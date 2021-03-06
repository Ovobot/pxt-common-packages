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

    class ATSeq {
        cmd:string;
        containCb:boolean;
        constructor(cmd:string,cb:boolean) {
            this.cmd = cmd;
            this.containCb = cb;
        }
    } 

    export class ATController extends net.Controller {
        private prefix = "AT";
        private newLine = "\r\n";
        private wifiConnResponse:ATResponse = undefined;
        private mqttCbTopicData: (topic: string, data: string) => void = null;
        private mWakeUp = false;
        private atHandles:((response: ATResponse) => void)[] = [];

        private ackState:ATAckState = ATAckState.None;
        private atcmds:ATSeq[] = []; 
        private status:ATStatus = ATStatus.None;
        private errorCode: number = 0;
        private srHandler: (data: string) => void = null;
        private netResultHandler: (data: string) => void = null;
        private atResultHanlder: (data: string[]) => void = null;
        private wkupHandler: () => void = null;
        private atready:boolean = true;
        private currentSsid:string = '';
        private voiceCmdNow:boolean = false;
        private httpUserCmdNow:boolean = false;
        private esp32Ready:boolean = false;
        private iotClient:string = "";
        private netRequestResult:string = "";
        private rssi:number = 0;
        private waitingHttpResult:boolean = false 
        private currentAtseq:ATSeq
        //private voiceReg = /AT+VOICE=/;
        constructor(private ser: serial.Serial) {
            super();
            this.ser.serialDevice.setTxBufferSize(128);
            this.ser.serialDevice.setRxBufferSize(512);
            //this.ser.serialDevice.setBaudRate(BaudRate.BaudRate115200);
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

        public startATBackgroundTask() {
            let line = "";
            let lines: string[] = [];
            let resLines: string[] = [];
            let topic = '';
            let handleIndex:number = -1;
            let currentAckCmd:string = "";
            let allStr:string = ''
            let getVoiceInputFlag = false
            let getHttpResultFlag = false
            //read thread   
            control.runInBackground(() => {
                // send command
                while(1) {
                    if (this.waitingHttpResult) {
                        
                    } else {
                        line = this.ser.readString()
                        if(line.length > 0) {
                            resLines.push(line)
                        }
    
                        while(resLines.length) {
                            // console.log(line)
                            let tmline = resLines[0]
                            allStr += tmline
                            resLines.removeElement(tmline)
                        }
                
                        if(allStr.length) {
                            let anslines = allStr.split("\r\n")
                            if(this.atResultHanlder) {
                                this.atResultHanlder(anslines);
                            }
                            while(anslines.length) {
                                line = anslines[0]
                                console.log("rec>" + line);
                                if (line == "ready" && !this.esp32Ready) {
                                    //it is first launch 
                                    this.esp32Ready = true;
                                    // this.status = ATStatus.Ok;
                                    // this.ackState = ATAckState.Tail;
                                } else if(line == "WIFI GOT IP") {
                                    if(this.wifiConnResponse) {
                                        this.wifiConnResponse.status = ATStatus.Ok;
                                    } else {
                                        this.wifiConnResponse = { status: ATStatus.Ok, errorCode: this.errorCode, lines: [] };
                                    }
                                } else if(line == "WIFI DISCONNECT") {
                                    if(this.wifiConnResponse) {
                                        this.wifiConnResponse.status = ATStatus.Error;
                                    } 
                                } 

                                if(this.voiceCmdNow) {
                                    if(line.indexOf("AT+VOICE=") != -1) {
                                        getVoiceInputFlag = true
                                        
                                    } else if (getVoiceInputFlag) {
                                        getVoiceInputFlag = false;
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
                                        getHttpResultFlag = true;
                                        
                                    } else if (getHttpResultFlag) {
                                        getHttpResultFlag = false;
                                        if(line == ">") {
                                            this.waitingHttpResult = true;
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
                                        this.status = ATStatus.Error;
                                        this.ackState = ATAckState.Tail;
                                    } else if (line.substr(0, "ERR CODE:".length) == "ERR CODE:") {
                                        this.errorCode = this.parseIntRadix(line.substr("ERR CODE:".length + 2),16);
                                    }  else if(line.length) {
                                        this.ackState = ATAckState.Content;
                                        lines.push(line);
                                    }     
                                }
                                if (this.ackState == ATAckState.Tail) {
                                    //call handles
                                    this.atready = true;
                                    this.ackState = ATAckState.None;
                                    const ahs =  this.atHandles as ((response: ATResponse) => void)[];
                                    if (ahs.length && this.currentAtseq && this.currentAtseq.containCb) {
                                        this.currentAtseq = undefined
                                        const ah = ahs.shift();
                                        ah({ status: this.status, errorCode: this.errorCode, lines: lines });
                                    }
                                    if (currentAckCmd == 'AT+SPEECHRES' && this.srHandler) {
                                        let result = lines[0];
                                        if (result != undefined) {
                                            this.srHandler(result);
                                        }
                                    }
                                    if (currentAckCmd == 'AT+WAKE' && this.wkupHandler) {
                                        this.wkupHandler();
                                    }
                                    if (currentAckCmd.indexOf("AT+SUBRES=") != -1) {
                                        let len =   "AT+SUBRES=".length + this.iotClient.length + 1
                                        //if speed fast uart may lost data so compare here is safe
                                        if(currentAckCmd.length > len) {
                                            topic = currentAckCmd.substr(19);
                                            if(this.mqttCbTopicData){
                                                const mqCb =  this.mqttCbTopicData as  (topic: string, data: string) => void
                                                if(lines.length > 0) {
                                                    mqCb(topic,lines[0]);    
                                                }
                                            }
                                        } 

                                    }
                                    handleIndex = -1;
                                    lines = [];
                                    line = "";
                                    currentAckCmd = "";
                                    this.status = ATStatus.None;
                                    this.errorCode = 0;
                                }
                                anslines.removeAt(0)
                            }
                            allStr = ''
                        }
                    }
                    pause(1);
                }

            });
            //write thread    
            control.runInBackground(() => {
                // send command
                while(1) {
                    if(this.atcmds.length) {
                        if (this.atready) {
                            this.atready = false;
                            const atseq = this.atcmds.shift() as ATSeq;
                            this.currentAtseq = atseq;
                            //console.log("c->:" + cmd);
                            if(atseq.cmd.indexOf("AT+VOICE=") != -1){
                                this.voiceCmdNow = true;
                            } else {
                                this.voiceCmdNow = false;
                            }
                            if(atseq.cmd.indexOf("AT+HTTPREQUEST=") != -1) {
                                this.httpUserCmdNow = true;
                            } else {
                                this.httpUserCmdNow = false;
                            }
                            // send over
                            this.ser.writeString(atseq.cmd);
                            // if(this.voiceCmdNow) {
                            //     let res = this.ser.readString();
                            //     //console.log("res:"+res);
                            // }
                        }
                        
                    } 
                    pause(1);
                }

            });
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

        private sendnow(cmd:string) {
            this.atready = false;
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
        }

        private sendNewAT(command: string, args?: any[], callback?: (response: ATResponse) => void, dispatchFirst?:boolean) {
            if(this.atcmds.length > 10) {
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
                if(this.atcmds.length == 0 && this.atready) {
                    this.atHandles.push(callback);
                    this.currentAtseq = new ATSeq(txt,true);
                    this.sendnow(txt);
                } else {
                    if(this.atready) {
                        if(dispatchFirst) {
                            this.atHandles.unshift(callback);
                            let mtempAt = new ATSeq(txt,true);
                            this.atcmds.unshift(mtempAt);
                        } else {
                            this.atHandles.push(callback);
                            let mtempAt = new ATSeq(txt,true);
                            this.atcmds.push(mtempAt);
                        }     
                    } else {
                        this.atHandles.push(callback);
                        let mtempAt = new ATSeq(txt,true);
                        this.atcmds.push(mtempAt);
                    }
                }

                
            } else {
                if(this.atcmds.length == 0 && this.atready) {
                    this.currentAtseq = undefined;
                    this.sendnow(txt);
                } else {
                    let mtempAt = new ATSeq(txt,false);
                    this.atcmds.push(mtempAt);
                }
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
            let APs:net.AccessPoint[] = []
            this.sendNewAT("CWMODE=1",[],function(resp:ATResponse) {
                if(resp.status == ATStatus.Ok) {
                    this.sendNewAT('CWLAP',[],function(resp:ATResponse) {
                
                        if(resp.status == ATStatus.Ok) {
                            let apinfos = resp.lines;
                            for (let apinfo of apinfos) {
                               if (apinfo.length >  "+CWLAP:".length) {
                                 let ap =  apinfo.substr("+CWLAP:".length)
                                 console.log(ap);
                               }
        
                            }
                            
                        } else {
                            //wait wifi connected
                            // while (!this.isConnected) {
                            //     pause(1)
                            // }
                            control.runInParallel(() => {
                                
                                while (!this.isConnected) {
                                    pause(5)
                                }
                                this.sendNewAT('CWLAP',[],function(resp:ATResponse) {
                                    if(resp.status == ATStatus.Ok) {
                                        let apinfos = resp.lines;
                                        console.log(apinfos.length);
                                        // for (let apinfo of apinfos) {
                                        //    //if (apinfo.length >  "+CWLAP:".length) {
                                        //      //let ap =  apinfo.substr("+CWLAP:".length)
                                        //      //console.log(apinfo.split(","));
                                        //    //}
                                        //    let aparrs = apinfo.split(",");
                                           
                                        //    let name = aparrs[1];
                                        //    let a_p = new net.AccessPoint(name)
                                        //    let rssi = aparrs[2];
                                        //    a_p.rssi = parseInt(rssi)
                                        //    let encr = aparrs[0].substr("+CWLAP:".length)
                                        //    a_p.encryption = parseInt(encr)
                                        //    console.log(name);
                                        //    APs.push(a_p)
                                        // }
                                    }
                                },true);
                
                            })
                        }
                    },true);
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
                    },true); 
                }
            });
        }

        public startVoiceInput() {
            this.sendNewAT("SPEECHINPUT");
        }

        public setSRCloud(cloud:number) {
            this.sendNewAT("SRCLOUD="+cloud);    
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
                                // console.log("num len:" + ansLen.length);

                                packetNum = packetNum.concat(ansLen);
                                let indexC = packetNum.indexOf(":");
                                // console.log("colon index:" + indexC);

                                if(indexC != -1) {
                                    let packlen = parseFloat(packetNum.slice(0,indexC));
                                    // console.log("get len:" + packlen);
                                    if(packetNum.length > indexC+1) {
                                        //start slice response
                                        netRequestResult = packetNum.slice(indexC+1);
                                        while(this.byteLength(netRequestResult) < packlen) {
                                            ansLen =  this.ser.readString();
                                            if(ansLen.length) {
                                                netRequestResult = netRequestResult.concat(ansLen);
                                                // console.log("now len:" + this.byteLength(netRequestResult));
                                            }
                                            pause(1);
                                        }
                                    } else if(packlen > 0){
                                        while(this.byteLength(netRequestResult) != packlen) {
                                            let packet =  this.ser.readString();
                                            if(packet) {
                                                netRequestResult = netRequestResult.concat(packet);
                                                // console.log("now len:" + this.byteLength(netRequestResult));
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
                        this.waitingHttpResult = false;
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

        public pubTopicMessage(topic: string, chart:string, message: string) {
            let finalTopic = this.iotClient + '/' + topic + '/' + chart;
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

        public registerATResponse(handler:(message:string[]) => void) {
            this.atResultHanlder = handler;
        }

        public registerWakeupResponse(handler: () => void) {
            this.wkupHandler = handler;
        }

        public setSpeechWkWord(wkword:number){
            this.sendNewAT("SPEECHWAKE="+wkword);
        }

        public setSpeechLang(lang:string){
            this.sendNewAT("SPEECHLANG",[lang]);
        }

        public setGoogleSRLang(lang:string){
            this.sendNewAT("GSRLANG",[lang]);
        }

        public getSpeechRecResult() {
            this.sendNewAT("SPEECHRES");
        }

        public getRssi():number{
            this.sendNewAT("CWMODE=1",[],function(resp:ATResponse) {
                if(resp.status == ATStatus.Ok) {
                    this.sendNewAT("CWLAP",[this.currentSsid],function(resp:ATResponse) {
                        //console.log(resp.lines);
                        let res1 = resp.lines[0];
                        let sep = res1.split(",");
                        this.rssi = parseInt(sep[2]);
                    },true); 
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