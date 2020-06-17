
/**
 * Networking, WiFi, Speech recognition
 */
//% weight=1
//% advanced=true
//% icon="\uf1eb" color="#8446cf"
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

    //% blockId=speech_set_lang block="set speech language  %lang"
    //% weight=85 blockGap=12
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
    //% weight=85 blockGap=12
    export function speechSelectWakeupWord(wkWord:WAKEUPWORD){
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.setSpeechWkWord(wkWord);
            wkmode = true;
        }
    }


    // function receiveWKNotice():boolean{
    //     if(wkmode){
    //         let c =  esp32.defaultController() as esp32.ATController;
    //         if (c) {
    //             return c.isWakeUp();
    //         }
    //         return false;
    //     }
    //     return false;
    // }

    // void onLightConditionChanged(LightCondition condition, Action handler) {
    //     auto wlight = getWLight();
    //     if (NULL == wlight) return;    
    //     auto sensor = wlight->sensor;
    
    //     sensor.updateSample();
    //     registerWithDal(DAL.DEVICE_ID_SERIAL, (int)condition, handler);
    // }

    //% blockId=speech_wakeup block="robot wake up?"
    //% weight=85 blockGap=12
    export function receiveWKNotice(handler: () => void) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            //return c.isWakeUp();
            //ser.serialDevice.onEvent(event, handler);
            //c.atRegisterWithDal(CODAL_SERIAL_WAKEUP_RECEIVED,handler);
            control.onEvent(DAL.DEVICE_ID_SERIAL, CODAL_SERIAL_WAKEUP_RECEIVED, handler);
            //registerWithDal(DAL.DEVICE_ID_SERIAL, CODAL_SERIAL_WAKEUP_RECEIVED, handler);
            control.runInBackground(() => {
                while(1){
                    //console.log("background read");
                    if(wkmode && c.isWakeUp()){
                        control.raiseEvent(DAL.DEVICE_ID_SERIAL, CODAL_SERIAL_WAKEUP_RECEIVED);
                    }
                    pause(20);
                }
            });
        }
    }
    

    //% blockId=speech_rec_result block="get speech recognition result"
    //% weight=80 blockGap=12
    export function speechRecognitionResult():string{
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.getSpeechRecResult();
        } 
       return "";
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