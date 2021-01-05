
/**
 * Networking, Speech recognition
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

    export enum VOICEPERSON {
        //% block="FEMALESTD"
        FEMALESTD,
        //% block="MALESTD"
        MALESTD,
        //% block="MALEMAG"
        MALEMAG = 3,
        //% block="CHILDSTD"
        CHILDSTD = 4

    }

    let wkmode:boolean = false;

    export function disableESP32(on: boolean) {
        // // look for ESP32 over SPI pins
        const cs = pins.pinByCfg(DAL.CFG_PIN_WIFI_CS)
        if (cs) {
            cs.digitalWrite(on);
        }
    }

    /**
     * Start voice input.
     */
    //% blockId=speech_start_voiceInput block="start voice input"
    //% weight=100 blockGap=12
    export function startVoiceInput(){
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.startVoiceInput();
        }
    }

    //% blockId=speech_rec_result block="get speech recognition result"
    //% weight=98 blockGap=12
    export function speechRecognitionResult(): void{
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.getSpeechRecResult();
        } 
    }

    /**
     * speech recognition result callback
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

    //% blockId=speech_esp32_voicesay block="voice say  %content"
    //% weight=90 blockGap=12
    export function voiceSay(content:string) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.setVoiceContent(content);
        }        
    }

  
    //% blockId=speech_esp32_voiceperson block="set voice person  %person"
    //% weight=91 blockGap=12
    export function voicePerson(person:VOICEPERSON) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.setVoicePerson(person);
        }        
    }  

    //% blockId=speech_set_lang block="set speech language  %lang"
    //% weight=90 blockGap=12
    export function speechSelectLanguage(lang:LangTypes){
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
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
    //% weight=88 blockGap=12
    export function speechSelectWakeupWord(wkWord:WAKEUPWORD){
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.setSpeechWkWord(wkWord);
            wkmode = true;
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
    
}