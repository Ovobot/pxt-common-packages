
/**
 * Networking, WiFi, Speech recognition
 */
//% weight=90
//% icon="\uf130" color="#7B68EE"
namespace speech {
    export const CODAL_SERIAL_WAKEUP_RECEIVED = 5

    export enum LangTypes {
        //% block="EN"
        English,
        //% block="ZH"
        Chinese
    }

    export enum WAKEUPWORD {
        //% block="TIANMAO"
        TIANMAO,
        //% block="XIAOAI"
        XIAOAI,
        //% block="XIAOLE"
        XIAOLE,
        //% block="XIAOWA"
        XIAOWA,
        //% block="OVO"
        OVO
    }

    let wkmode:boolean = false;

    

    //% blockId=speech_wifi_setpassphrase block="Wi-Fi connect to account:%ssid password:%passphrase"
    //% weight=92 blockGap=12
    export function wifiSetPassphrase(ssid: string, passphrase: string): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.wifiConnect(ssid,passphrase);
        }
    }

    //% blockId=speech_wifi_connected block="Wi-Fi connected?"
    //% weight=90 blockGap=12
    export function wifiConnected(): boolean {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.isConnected;
        }
        return false;
    }

    /**
     * Sets speech time.
     * @param recordTime the group id between ``1`` and ``4``, eg: 2
     */
    //% blockId=speech_rec_ready block="start speech recognition in %recordTime seconds?"
    //% weight=85 blockGap=12
    //% recordTime.min=1 recordTime.max=4
    //% recordTime.fieldOptions.precision=1
    export function speechReadyRecognition(recordTime:number){
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.setSpeechTime(recordTime);
        }
    }

    /**
     * Send at command.
     * @param command the command string, eg: AT
     */
    //% blockId=speech_at_test block="send AT command  %command"
    //% weight=85 blockGap=12
    export function testATCommand(command:string) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.sendATTest(command);
        }
    }

    //% blockId=speech_set_lang block="set speech language  %lang"
    //% weight=80 blockGap=12
    export function speechSelectLanguage(lang:LangTypes){
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            //return c.setSpeechTime(recordTime);
            switch(lang){
                case LangTypes.English:
                    c.setSpeechLang("EN");
                    break;
                case LangTypes.Chinese:
                    c.setSpeechLang("ZH");
                    break;
                default:
                    console.log("not support yet");
                    break;    
            }
        }
    }

    //% blockId=speech_set_wakeupword block="set speech wake up  word %wkWord"
    //% weight=75 blockGap=12
    export function speechSelectWakeupWord(wkWord:WAKEUPWORD){
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.setSpeechWkWord(wkWord);
            wkmode = true;
        }
    }

    /**
     * get wifi info
     * @param ssid wifi ssid; eg: @PHICOMM_B8
    */
    //% blockId=speech_set_getrssi block="get wifi %ssid rssi strength"
    //% weight=70 blockGap=12
    export function getWifiRssiStrength(ssid:string ){
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.getRssi(ssid);
        }
    }

    //% blockId=speech_set_getWlapssidInfo block="get wlap info"
    //% weight=70 blockGap=12
    export function getWLapRssiStrength(){
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.getLAPOpt();
        }
    }

    //% blockId=speech_wakeup block="robot wake up?"
    //% weight=65 blockGap=12
    export function receiveWKNotice(handler: () => void) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.registerWakeupResponse(handler);
        }
    }
    

    //% blockId=speech_rec_result block="get speech recognition result"
    //% weight=84 blockGap=12
    export function speechRecognitionResult(): void{
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.getSpeechRecResult();
        } 
    }

    /**
     * On MQTT subscribe message callback install
     * @param handler speech recognition result callback;
    */
    //% blockId=on_sr_result block="on speech recognition callback"
    //% weight=82 draggableParameters=reporter
    export function onSpeechRecognitionResult(handler: (result: string) => void): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.registerSRResponse(handler);
        }
    }

    //% blockId=speech_rec_result_contain block="speech recognition result contain %keystr?"
    //% weight=78 blockGap=12
    export function speechRecognitionResultContainValue(keystr:string):boolean{
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.isSpeechResContain(keystr);
        } 
        return false;
    }    
}