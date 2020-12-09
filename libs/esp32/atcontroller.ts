namespace esp32 {
    export enum ATStatus {
        None,
        Ok,
        Error
    }

    export enum ATAckState {
        None,
        Head,
        Content,
        Tail
    }

    export interface ATResponse {
        status: ATStatus;
        errorCode?: number;
        lines: string[];
    }

    

    /**
     * Controller for AT command set https://github.com/espressif/esp-at/blob/master/docs/ESP_AT_Commands_Set.md
     */


    export class ATController extends net.Controller {
        private prefix = "AT";
        private newLine = "\r\n";
        private wifiConnResponse:ATResponse = undefined;
        private currentSpeechRes = "";
        private mqttCbTopicData: (topic: string, data: string) => void = null;
        private mWakeUp = false;
        private atHandles:((response: ATResponse) => void)[] = [];
        private cacheHandles:((response: ATResponse) => void)[] = [];

        private ackState:ATAckState = ATAckState.None;
        private atcmds:string[] = []; 
        private cachecmds:string[] = []; 
        private status:ATStatus = ATStatus.None;
        private errorCode: number = 0;
        private srHandler: (data: string) => void = null;
        private netResultHandler: (data: string) => void = null;
        private wkupHandler: () => void = null;
        private mqttCb: ((data: string) => void)[] = [null, null, null, null, null, null, null, null];
        private mqttCbCnt: number = 0;
        private mqttCbKey: string[] = ['', '', '', '', '', '', '', ''];
        private atready:boolean = true;
        private currentSsid:string = '';
        private voiceCmdNow:boolean = false;
        private httpUserCmdNow:boolean = false;
        private esp32Ready:boolean = false;
        private iotClient:string = "";
        private netRequestResult:string = "";
        private rssi:number = 0;
        //private voiceReg = /AT+VOICE=/;
        constructor(private ser: serial.Serial) {
            super();
            this.ser.serialDevice.setTxBufferSize(150);
            this.ser.serialDevice.setRxBufferSize(200);
            this.ser.serialDevice.setBaudRate(BaudRate.BaudRate115200);
            let line = "";
            let lines: string[] = [];
            let topic = '';
            let handleIndex:number = -1;
            let currentAckCmd:string = "";
            this.ser.serialDevice.onDelimiterReceived(Delimiters.NewLine, function () {

                line = this.ser.readNewLine();
                console.log(line);
                if (line == "ready" && !this.esp32Ready) {
                    //it is first launch 
                    this.esp32Ready = true;
                    // this.status = ATStatus.Ok;
                    // this.ackState = ATAckState.Tail;
                }
                if(this.voiceCmdNow) {
                    if(line.indexOf("AT+VOICE=") != -1) {
                        line = this.ser.readString();
                        console.log("voice res:" + line);
                        if(line == ">") {
                            console.log("voice input");
                            this.status = ATStatus.Ok;
                            this.ackState = ATAckState.Tail;
                        } else {
                            this.status = ATStatus.Error;
                            this.ackState = ATAckState.Tail;
                        }
                    }
                }
                if (this.httpUserCmdNow) {
                    if(line.indexOf("AT+HTTPREQUEST=") != -1) {
                        line = this.ser.readString();
                        console.log("http at res:" + line);
                        if(line == ">") {
                            console.log("http url input");
                            this.status = ATStatus.Ok;
                            this.ackState = ATAckState.Tail;
                        } else {
                            this.status = ATStatus.Error;
                            this.ackState = ATAckState.Tail;
                        }
                    }
                }
                if (line.length >= 2 && line.charAt(0) == 'A' && line.charAt(1) == 'T' && this.ackState == ATAckState.None) {
                    this.ackState = ATAckState.Head;
                    currentAckCmd = line;
                } else if (this.ackState != ATAckState.None &&  this.status != ATStatus.Ok) {
                    if (line == "OK") {
                        this.status = ATStatus.Ok;
                        this.ackState = ATAckState.Tail;
                    } else if (line == "ERROR") {
                        console.log('error');
                        this.status = ATStatus.Error;
                        this.ackState = ATAckState.Tail;
                    } else if (line.substr(0, "ERR CODE:".length) == "ERR CODE:") {
                        console.log('error code');
                        this.errorCode = this.parseIntRadix(line.substr("ERR CODE:".length + 2),16);
                    }  else if(line.length) {
                        this.ackState = ATAckState.Content;
                        lines.push(line);
                    }     
                }
                if (this.ackState == ATAckState.Tail) {
                    //call handles
                    this.ackState = ATAckState.None;
                    const ahs =  this.atHandles as ((response: ATResponse) => void)[];
                    if (ahs.length) {
                        const ah = ahs.shift();
                        ah({ status: this.status, errorCode: this.errorCode, lines: lines });
                    }
                    if (currentAckCmd == 'AT+SPEECHRES' && this.srHandler) {
                        let result = lines[0];
                        if (result != undefined) {
                            this.currentSpeechRes = result;
                            this.srHandler(result);
                        }
                    }
                    if (currentAckCmd == 'AT+WAKE' && this.wkupHandler) {
                        this.wkupHandler();
                    }
                    if (currentAckCmd.indexOf("AT+SUBRES=") != -1) {
                        topic = currentAckCmd.substr(19);
                        const mqcbkey = this.mqttCbKey as string[];
                        for (let i = 0; i < mqcbkey.length; i++) {
                            let cbKey = mqcbkey[i];
                            if(topic == cbKey) {
                                handleIndex = i;
                                break;
                            } 
                        }

                        if(handleIndex != -1) {
                            const mqCb =  this.mqttCb as ((data: string) => void)[];
                            mqCb[handleIndex](lines[0]);
                        }
                        if(this.mqttCbTopicData){
                            const mqCb =  this.mqttCbTopicData as  (topic: string, data: string) => void
                            mqCb(topic,lines[0]);
                        }
                    }
                    this.atready = true;
                    handleIndex = -1;
                    lines = [];
                    line = "";
                    this.status = ATStatus.None;
                    this.errorCode = 0;
                }
                
            });
            control.runInBackground(() => {
                // send command
                while(1) {
                    if(this.atcmds.length) {
                        if (this.atready) {
                            this.atready = false;
                            const cmd = this.atcmds.shift();
                            //console.log("c->:" + cmd);
                            if(cmd.indexOf("AT+VOICE=") != -1){
                                this.voiceCmdNow = true;
                            } else {
                                this.voiceCmdNow = false;
                            }
                            if(cmd.indexOf("AT+HTTPREQUEST=") != -1) {
                                this.httpUserCmdNow = true;
                            } else {
                                this.httpUserCmdNow = false;
                            }
                            // send over
                            this.ser.writeString(cmd);
                            // if(this.voiceCmdNow) {
                            //     let res = this.ser.readString();
                            //     //console.log("res:"+res);
                            // }
                        }
                        
                    } else {
                        if (this.atready){
                            if (this.cachecmds.length) {
                                this.atcmds.push(this.cachecmds.shift());
                                this.atHandles.push(this.cacheHandles.shift());
                            }
                        }
                    }
                    pause(1);
                }

            });
        }

        

        parseIntRadix(s: string, base?: number) {
            if (base == null || base == 10) {
                return parseFloat(s) | 0
            }
    
            let m = false
            let r = 0
            for (let i = 0; i < s.length; ++i) {
                let c = s.charCodeAt(i)
                if (c == 0x20 || c == 10 || c == 13 || c == 9)
                    continue
                if (r == 0 && !m && c == 0x2d) {
                    m = true
                    continue
                }
    
                let v = -1
                if (0x30 <= c && c <= 0x39)
                    v = c - 0x30
                else {
                    c |= 0x20
                    if (0x61 <= c && c <= 0x7a)
                        v = c - 0x61 + 10
                }
    
                if (0 <= v && v < base) {
                    r *= base
                    r += v
                } else {
                    return undefined
                }
            }
    
            return m ? -r : r
        }

        /**
         * Sends and receives an AT command
         * @param command command name
         */
        private sendAT(command: string, args?: any[]): ATResponse {
            // send command
            let txt = this.prefix;
            // add command
            if (command)
                txt += "+" + command;
            // filter out undinfed from the back
            while (args && args.length && args[args.length - 1] === undefined)
                args.pop();
            if (args && args.length > 0) {
                txt += "=" + args.map(arg => "" + arg).join(",");
            }
            txt += this.newLine;
            // send over
            this.ser.writeString(txt);
            // read output
            let status = ATStatus.None;
            let errorCode: number = 0;
            let line = "";
            const lines: string[] = [];
            do {
                line = this.ser.readLine();
                if (line == "OK")
                    status = ATStatus.Ok;
                else if (line == "ERROR")
                    status = ATStatus.Error;
                else if (line.substr(0, "ERR CODE:".length) == "ERR CODE:")
                errorCode = parseInt(line.substr("ERR CODE:".length + 2), 16)
                else if (!line.length) continue; // keep reading
                else lines.push(line);
            } while (status == ATStatus.None);

            return { status: status, errorCode: errorCode, lines: lines };
        }

        private sendNewAT(command: string, args?: any[], callback?: (response: ATResponse) => void) {
            if(this.cachecmds.length > 10) {
                console.log("cmd buf full");
                return;
            }
            let txt = this.prefix;
            // add command
            if (command)
                txt += "+" + command;
            // filter out undinfed from the back
            while (args && args.length && args[args.length - 1] === undefined)
                args.pop();
            if (args && args.length > 0) {
                txt += "=" + args.map(arg => "\""  + arg + "\"").join(",");
            }
            txt += this.newLine;            
            if (callback) {
                if(this.atready) {
                    this.atHandles.push(callback);
                    this.atcmds.unshift(txt);
                } else {
                    this.cacheHandles.push(callback);
                    this.cachecmds.push(txt);
                }
                
            } else {
                this.atcmds.push(txt);
            }
            
        }

        private parseNumber(r : ATResponse): number {
            if (r.status != ATStatus.Ok || !r.lines.length)
                return undefined;

            const line = r.lines[0];
            if (line[0] != "+")
                return undefined;

            const time = parseInt(line.substr(1));
            return time;
        }

        get isIdle(): boolean {
            return this.esp32Ready; 
            //return this.sendAT("").status == ATStatus.Ok;
        }

        get isEsp32Ready():boolean {
            return this.esp32Ready;
        }

        version() {
            const r = this.sendAT("GMR");
            return r.lines.join("\r\n");            
        }

        get isConnected(): boolean {
            if(this.wifiConnResponse) return this.wifiConnResponse.status == ATStatus.Ok;
            return false;
        }
        connect(): void { 

        }

        disconnect():void {
            this.wifiConnResponse = undefined;
        }
 
        ping(dest: string, ttl: number = 250): number {
            // https://github.com/espressif/esp-at/blob/master/docs/ESP_AT_Commands_Set.md#425-atping-ping-packets
            const r = this.sendAT(`PING`, [dest, ttl]);
            return this.parseNumber(r);
        }

        public scanNetworks(): net.AccessPoint[] {
            let aps = []
            this.sendNewAT('CWLAP',[],function(resp:ATResponse) {
                
                if(resp.status == ATStatus.Ok) {
                    let apinfos = resp.lines;
                    for (let apinfo of apinfos) {
                       if (apinfo.length >  "+CWLAP:".length) {
                         let ap =  apinfo.substr("+CWLAP:".length)
                         console.log(ap);
                       }

                    }
                    
                }
            });
            return [];
        }

        

        public socket(): number {
            return -1;
        }

        public sendATTest(command:string) {
            this.sendNewAT(command);
        }

        public atRegisterWithDal(event: number, handler: () => void){
            if(this.ser){
                this.ser.serialDevice.onEvent(event, handler);
            }
            
        }

        public socketConnect(socket_num: number, dest: string | Buffer, port: number, conn_mode = net.TCP_MODE): boolean {
            return false;
        }

        public wifiConnect(ssid:string,password:string){
                this.currentSsid = ssid;
                this.sendNewAT("CWMODE=1",[],function(resp:ATResponse) {
                    if(resp.status == ATStatus.Ok) {
                        this.sendNewAT("CWJAP",[ssid,password],function(resp:ATResponse){
                            //console.log(resp.lines);
                            this.wifiConnResponse = resp;
                        }); 
                    }
                });
        }

        public setSpeechTime(time:number) {
            let r =  Math.constrain(time, 1, 4);
            this.sendNewAT("SPEECH="+time);
            //pause(time * 1000);
        }

        public startVoiceInput() {
            this.sendNewAT("SPEECHINPUT");
        }

        // lengthInUtf8Bytes(str:string) {
        //     // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
        //     var m = encodeURIComponent(str).match(/%[89ABab]/g);
        //     return str.length + (m ? m.length : 0);
        // }

        byteLength(str:string) {
            // returns the byte length of an utf8 string
            let s = str.length;
            for (let i=str.length-1; i>=0; i--) {
              let code = str.charCodeAt(i);
              if (code > 0x7f && code <= 0x7ff) s++;
              else if (code > 0x7ff && code <= 0xffff) s+=2;
              if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
            }
            return s;
        }

        public setVoiceContent(msg:string) {
            let len = this.byteLength(msg);
            this.sendNewAT("VOICE="+len,[], function(resp:ATResponse) {
                if(resp.status == ATStatus.Ok) {
                    //this.ser.writeString(msg);
                    console.log("send voice:" + msg + '.');
                    
                    // let total = msg.length;
                    // let pkgIdx = 0;
                    // while(total) {
                    //     total = total - 128;
                    //     if (total < 0) {
                    //         let sendstr = msg.substr(pkgIdx*128);
                    //         this.ser.writeString(sendstr);
                    //     } else {
                    //         let sendstr = msg.substr(pkgIdx*128,128);
                    //         this.ser.writeString(sendstr);
                    //     }
                    //     pkgIdx++;
                    // }
                    this.ser.writeString(msg);
                }
            }); 
        }

        public httpRequestGet(url:string) {
            let len = this.byteLength(url);
            this.sendNewAT("HTTPREQUEST="+len,[], function(resp:ATResponse) {
                if(resp.status == ATStatus.Ok) {
                    //this.ser.writeString(msg);
                    console.log("send HTTP URL:" + url);
                    
                    this.ser.writeString(url);
                    let ansLen = "";
                    let packetNum = "";
                    control.runInBackground(() => {
                        // send command
                        while(1) {
                            ansLen =  this.ser.readString();//this.ser.readUntil(Delimiters.Colon);
                            if(ansLen.length){
                                let netRequestResult = ""; 
                                // let ansnumLen:number = parseFloat(ansLen);
                                //console.log("num len:" + ansLen);
                                console.log("num len:" + ansLen.length);

                                packetNum = packetNum.concat(ansLen);
                                let indexC = packetNum.indexOf(":");
                                console.log("colon index:" + indexC);

                                if(indexC != -1) {
                                    let packlen = parseFloat(packetNum.slice(0,indexC));
                                    console.log("get len:" + packlen);
                                    if(packetNum.length > indexC+1) {
                                        //start slice response
                                        netRequestResult = packetNum.slice(indexC+1);
                                        while(this.byteLength(netRequestResult) < packlen) {
                                            ansLen =  this.ser.readString();
                                            if(ansLen.length) {
                                                netRequestResult = netRequestResult.concat(ansLen);
                                                console.log("now len:" + this.byteLength(netRequestResult));
                                            }
                                            pause(1);
                                        }
                                    } else if(packlen > 0){
                                        while(this.byteLength(netRequestResult) != packlen) {
                                            let packet =  this.ser.readString();
                                            if(packet) {
                                                netRequestResult = netRequestResult.concat(packet);
                                                console.log("now len:" + this.byteLength(netRequestResult));
                                            }
                                            pause(1);
                                        }
                                    }
                                    if(netRequestResult.length && this.netResultHandler) {
                                        this.netResultHandler(netRequestResult);
                                    }
                                    break;
                                    
                                }
                                
                            }
                            
                            pause(10);
                        }
                        console.log("http over");    
                    });
                }
            });
        }

        public setVoicePerson(p:number) {
            this.sendNewAT("VOICEP="+p);
        }

        public setHost(client:string) {
            this.iotClient = client;
            this.sendNewAT("MQTT",["ovobotiot.cn",client]); 
        }

        public pubTopicMessage(topic: string, message: string) {
            let finalTopic = this.iotClient + '/' + topic;
            this.sendNewAT("PUB",[finalTopic,message]); 
        }

        public subTopic(topic:string) {
            let finalTopic = this.iotClient + '/' + topic;
            this.sendNewAT("SUB",[finalTopic]); 
        }

        public registerMqttSubResponse(handler: (topic: string, message: string) => void){
            this.mqttCbTopicData = handler;
        }

        public registerSRResponse(handler: (message: string) => void) {
            this.srHandler = handler;
        }

        public registerNetRequestResponse(handler: (message: string) => void) {
            this.netResultHandler = handler;
        }

        public registerWakeupResponse(handler: () => void) {
            this.wkupHandler = handler;
        }
        

        public onsubResponse(topic: string, handler: (message: string) => void){
            if (this.mqttCbCnt >= 8) return;
            this.mqttCb[this.mqttCbCnt] = handler;
            this.mqttCbKey[this.mqttCbCnt] = topic;
            this.mqttCbCnt++;
        }

        public setSpeechWkWord(wkword:number){
            this.sendNewAT("SPEECHWAKE="+wkword);
        }

        public setSpeechLang(lang:string){
            this.sendNewAT("SPEECHLANG",[lang]);
        }

        public getSpeechRecResult() {
            this.sendNewAT("SPEECHRES");
        }

        public isSpeechResContain(str:string):boolean{
            return this.currentSpeechRes.indexOf(str) > -1;
        }


        public getRssi():number{
            this.sendNewAT("CWMODE=1",[],function(resp:ATResponse) {
                if(resp.status == ATStatus.Ok) {
                    this.sendNewAT("CWLAP",[this.currentSsid],function(resp:ATResponse) {
                        //console.log(resp.lines);
                        let res1 = resp.lines[0];
                        let sep = res1.split(",");
                        this.rssi = parseInt(sep[2]);
                    }); 
                }
            });
            return this.rssi;
            
        }

        public getLAPOpt() {
            this.sendNewAT("CWLAPOPT",[1,6],function(resp:ATResponse) {
                console.log(resp.lines);
            });
        }

        public socketWrite(socket_num: number, buffer: Buffer): void {
        }

        public socketAvailable(socket_num: number): number {
            return -1;
        }

        public socketRead(socket_num: number, size: number): Buffer {
            return undefined;
        }

        public socketClose(socket_num: number): void {
        }

        public hostbyName(hostname: string): Buffer {
            return undefined;
        }
        get ssid(): string { return undefined; }
        get MACaddress(): Buffer { return undefined; }
    }
}