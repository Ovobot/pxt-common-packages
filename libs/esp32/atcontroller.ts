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
        private ackState:ATAckState = ATAckState.None;
        private atcmds:string[] = []; 
        private status:ATStatus = ATStatus.None;
        private errorCode: number = 0;
        private srHandler: (data: string) => void = null;
        private wkupHandler: () => void = null;
        private mqttCb: ((data: string) => void)[] = [null, null, null, null, null, null, null, null];
        private mqttCbCnt: number = 0;
        private mqttCbKey: string[] = ['', '', '', '', '', '', '', ''];
        private atready:boolean = true;
        constructor(private ser: serial.Serial) {
            super();
            this.ser.serialDevice.setTxBufferSize(128);
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
                
                if (line.length >= 2 && line.charAt(0) == 'A' && line.charAt(1) == 'T' && this.ackState == ATAckState.None) {
                    this.ackState = ATAckState.Head;
                    currentAckCmd = line;
                } else if (this.ackState != ATAckState.None) {
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
                        topic = currentAckCmd.substr(10);
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
        private sendAT(command: string, args?: any[]) :ATResponse{
            control.runInBackground(() => {
                // send command
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
                // send over
                this.ser.writeString(txt);
            });
         // read output
         let status = ATStatus.None;
         let errorCode: number = 0;
         let line = "";
         let lines: string[] = [];
            // control.runInBackground(() => {
            //     do {
            //         line = this.ser.readNewLine();
            //         console.log(line);
            //         if (line == "OK")
            //             status = ATStatus.Ok;
            //         // else if (line == "ERROR")
            //         //     status = ATStatus.Error;
            //         // else if (line.substr(0, "ERR CODE:".length) == "ERR CODE:")
            //         //     errorCode = this.parseIntRadix(line.substr("ERR CODE:".length + 2),16); //parseInt(line.substr("ERR CODE:".length + 2), 16)
            //         else if (!line.length) continue; // keep reading
            //         else if(line.length) {
            //             lines.push(line);
            //         }
            //     } while (status == ATStatus.None);
            // });


            return { status: status, errorCode: errorCode, lines: lines };
        }

        private sendNewAT(command: string, args?: any[], callback?: (response: ATResponse) => void) {
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
                this.atHandles.push(callback);
                this.atcmds.unshift(txt);
            } else {
                this.atcmds.push(txt);
            }
            
            control.runInBackground(() => {
                // send command
                while(this.atcmds.length) {
                    if (this.atready) {
                        this.atready = false;
                        const cmd = this.atcmds.shift();
                        console.log(cmd);
                        // send over
                        this.ser.writeString(cmd);
                    }
                    pause(10);
                }
            });
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
            return this.sendAT("").status == ATStatus.Ok;
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

        ping(dest: string, ttl: number = 250): number {
            // https://github.com/espressif/esp-at/blob/master/docs/ESP_AT_Commands_Set.md#425-atping-ping-packets
            const r = this.sendAT(`PING`, [dest, ttl]);
            return this.parseNumber(r);
        }

        public scanNetworks(): net.AccessPoint[] {
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
                this.sendNewAT("CWMODE=1",[],function(resp:ATResponse) {
                    if(resp.status == ATStatus.Ok) {
                        this.sendNewAT("CWJAP",[ssid,password],function(resp:ATResponse){
                            console.log(resp.lines);
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

        public setHost(host:string,client:string) {
            this.sendNewAT("MQTT",[host,client]); 
        }

        public pubTopicMessage(topic: string, message: string) {
            this.sendNewAT("PUB",[topic,message]); 
        }

        public subTopic(topic:string) {
            this.sendNewAT("SUB",[topic]); 
        }

        public registerMqttSubResponse(handler: (topic: string, message: string) => void){
            this.mqttCbTopicData = handler;
        }

        public registerSRResponse(handler: (message: string) => void) {
            this.srHandler = handler;
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


        public getRssi(ssid:string){
            this.sendNewAT("CWMODE=1",[],function(resp:ATResponse) {
                if(resp.status == ATStatus.Ok) {
                    this.sendNewAT("CWLAP",[ssid],function(resp:ATResponse) {
                        console.log(resp.lines);
                    }); 
                }
            });
            
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