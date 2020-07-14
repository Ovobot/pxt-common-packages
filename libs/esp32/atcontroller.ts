namespace esp32 {
    export enum ATStatus {
        None,
        Ok,
        Error
    }

    export enum MqttStatus{
        None,
        Topic,
        Message,
        OK
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
        private wifiConnResponse:ATResponse;
        private currentSpeechRes = "";
        private mqttCbTopicData: (topic: string, data: string) => void = null;
        private useMqttEvtLoop = false;
        private mWakeUp = false;
        constructor(private ser: serial.Serial) {
            super();
            this.ser.serialDevice.setTxBufferSize(64);
            this.ser.serialDevice.setRxBufferSize(128);
            this.ser.serialDevice.setBaudRate(BaudRate.BaudRate115200);
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
                txt += "=" + args.map(arg => "\""  + arg + "\"").join(",");
            }
            txt += this.newLine;
            // send over
            this.ser.writeString(txt);
            // read output
            let status = ATStatus.None;
            let errorCode: number = 0;
            let line = "";
            const lines: string[] = [];
            //control.runInBackground(() => {
                do {
                    line = this.ser.readNewLine();
                    //this.ser.writeString(line);
                    console.log(line)
                    if (line == "OK")
                        status = ATStatus.Ok;
                    else if (line == "ERROR")
                        status = ATStatus.Error;
                    else if (line.substr(0, "ERR CODE:".length) == "ERR CODE:")
                        errorCode = this.parseIntRadix(line.substr("ERR CODE:".length + 2),16); //parseInt(line.substr("ERR CODE:".length + 2), 16)
                    else if (!line.length) continue; // keep reading
                    else lines.push(line);
                    //pause(10);
                    pause(20);
                } while (status == ATStatus.None);
            //});


            return { status: status, errorCode: errorCode, lines: lines };
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

        public isWakeUp():boolean{
            let wake = this.mWakeUp;
            if(this.useMqttEvtLoop){
                this.mWakeUp = false;
                return wake;
            } else {
                let line = this.ser.readNewLine();
                console.log("recv->" + line);
                if (line == "OK") return true;
                else return false;
            }

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
            const r = this.sendAT("CWMODE=1");
            if(r.status == ATStatus.Ok) {
               this.wifiConnResponse = this.sendAT("CWJAP",[ssid,password]); 
            }
        }

        public setSpeechTime(time:number) {
            let r =  Math.constrain(time, 1, 4);
            this.sendAT("SPEECH="+time);
            //pause(time * 1000);
        }

        public setHost(host:string,client:string) {
            this.wifiConnResponse = this.sendAT("MQTT",[host,client]); 
        }

        public pubTopicMessage(topic: string, message: string) {
            this.wifiConnResponse = this.sendAT("PUB",[topic,message]); 
        }

        public subTopic(topic:string) {
            this.wifiConnResponse = this.sendAT("SUB",[topic]); 
        }

        public registerMqttSubResponse(handler: (topic: string, message: string) => void){
            this.mqttCbTopicData = handler;
        }

        public onsubResponse(mqttCb:((data: string) => void)[],mqttCbKey:string[]){
            let line = "";
            let mqttstatus =  MqttStatus.None;
            let resp = "";
            let handleIndex = -1;
            let topic = "";
            this.useMqttEvtLoop = true;
            control.runInBackground(() => {
                do {
                    line = this.ser.readNewLine();
                    //this.ser.writeString(line);
                    if(line == "AT+WAKE"){
                        this.mWakeUp = true;
                    } else if (mqttstatus == MqttStatus.None) {
                        for (let i = 0; i < 5; i++) {
                            let cbKey = "AT+SUBRES=" + mqttCbKey[i];
    
                            if(line == cbKey) {
                                handleIndex = i;
                                topic = line.substr(10);
                                mqttstatus =  MqttStatus.Topic;   
                                break;
                            } 
                            // let cmp = mqttCbKey[i].compare(topic)
                            // if (cmp == 0) {
                            //     mqttCb[i](data)
                            //     break;
                            // }
                        }
                        if(mqttstatus != MqttStatus.Topic && line.indexOf("AT+SUBRES=") != -1){
                            handleIndex = -1;
                            topic = line.substr(10);
                            mqttstatus =  MqttStatus.Topic;   
                        }
                    } else if(mqttstatus == MqttStatus.Topic){
                        resp = line;
                        mqttstatus = MqttStatus.Message;
                    } else if (mqttstatus == MqttStatus.Message){
                        if (line == "OK"){
                            mqttstatus = MqttStatus.None;
                            if(handleIndex != -1) {
                                mqttCb[handleIndex](resp);
                            }
                            handleIndex = -1;
                            if(this.mqttCbTopicData){
                                this.mqttCbTopicData(topic,resp);
                            }
                            //handler(resp)
                        }
                    }
                    //pause(10);
                    pause(20);
                } while (1);
            });
            
        }

        public setSpeechWkWord(wkword:number){
            this.sendAT("AT+SPEECHWAKE="+wkword);
        }

        public setSpeechLang(lang:string){
            this.sendAT("AT+SPEECHLANG="+lang);
        }

        public getSpeechRecResult():string{
            const r = this.sendAT("SPEECHRES");
            if(r.status == ATStatus.Ok) {
                const res = r.lines[1];
                this.currentSpeechRes = res;
                return res; 
            }
            this.currentSpeechRes = "";
            return "";
        }

        public isSpeechResContain(str:string):boolean{
            return this.currentSpeechRes.indexOf(str) > -1;
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