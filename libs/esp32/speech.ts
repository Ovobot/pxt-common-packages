enum LangTypes {
    //% block="English"
    EN,
    //% block="Chinese"
    ZH
}

enum GSRLangTypes {
    //% block="English"
    EN,
    //% block="Chinese"
    ZH,
    //% block="French"
    FR,
    //% block="Russian"
    RU,
    //% block="German"
    DE,
    //% block="Portuguese"
    PT,
    //% block="Italian"
    IT,
    //% block="Japanese"
    JA            
}

enum WakeupWord {
    //% block="hi jeson"
    Jeson,
    //% block="tian mao jing ling"
    Tianmao,
    //% block="xiao ai tong xue"
    Xiaoai,
    //% block="xiao le xiao le"
    Xiaole,
    //% block="ao wa ji qi ren"
    Ovobot
}

enum SrCloud {
    //% block="Google"
    Google,
    //% block="Baidu"
    Baidu
}

enum VoiceTag {
    //% block="Female"
    Female,
    //% block="Male"
    Male
}
/**
 * Networking, Speech recognition
 */
//% weight=78
//% icon="\uf130" color="#7B68EE"
//% groups='["Speech","Google Cloud", "Baidu Cloud"]'
namespace speech {
    export const CODAL_SERIAL_WAKEUP_RECEIVED = 5

    let wkmode:boolean = false;

    export function disableESP32(on: boolean) {
        // // look for ESP32 over SPI pins
        const cs = pins.pinByCfg(DAL.CFG_PIN_WIFI_CS)
        if (cs) {
            cs.digitalWrite(on);
        }
    }

    /**
     * set speech recognition cloud.
     */
    //% group="Speech"
    //% blockId=speech_set_srcloud block="set speech recognition cloud %cloud"
    //% weight=100 blockGap=12
    //% help=speech/speech-cloud    
    export function setSrCloud(cloud:SrCloud) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.setSRCloud(cloud);
        }
    }

    /**
     * Start voice input.
     */
    //% group="Speech"
    //% blockId=speech_start_voiceInput block="start voice input"
    //% weight=99 blockGap=12
    //% help=speech/speech-voice-input    
    export function startVoiceInput() {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.startVoiceInput();
        }
    }

    //% group="Speech"
    //% blockId=speech_rec_result block="get speech recognition result"
    //% weight=98 blockGap=12
    //% help=speech/speech-recognition-result    
    export function getSrResult(): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.getSpeechRecResult();
        } 
    }

    /**
     * speech recognition result callback
     * @param handler speech recognition result callback;
    */
    //% group="Speech"
    //% blockId=on_sr_result block="on speech recognition receive"
    //% weight=82 draggableParameters=reporter
    //% help=speech/speech-on-recognition-result    
    export function onSpeechRecognitionReceive(handler: (result: string) => void): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.registerSRResponse(handler);
        }
    }

    //% group="Speech"
    //% blockId=speech_esp32_voicesay block="speak %content"
    //% weight=90 blockGap=12
    //% help=speech/speech-voice-output    
    export function speak(content:string) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.setVoiceContent(content);
        }        
    }

    //% group="Speech"  
    //% blockId=speech_esp32_voiceperson block="set voice tag %person"
    //% weight=91 blockGap=12
    //% help=speech/speech-voice-tag       
    export function setVoiceTag(tag:VoiceTag) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.setVoicePerson(tag);
        }        
    }  

    //% group="Baidu Cloud"
    //% blockId=speech_set_baidu_lang block="set baidu speech language %lang"
    //% weight=90 blockGap=12
    //% help=speech/speech-sr-language-baiduservice    
    export function setSRLanguageInBaidu(lang:LangTypes) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            switch(lang){
                case LangTypes.EN:
                    c.setSpeechLang("EN");
                    break;
                case LangTypes.ZH:
                    c.setSpeechLang("ZH");
                    break;
                default:
                    console.log("not support yet");
                    break;    
            }
        }
    }

    //% group="Google Cloud"
    //% blockId=speech_set_google_lang block="set google speech language %lang"
    //% weight=90 blockGap=12
    //% help=speech/speech-sr-language-googleservice    
    export function setSRLanguageInGoogle(lang:GSRLangTypes) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            switch(lang){
                case GSRLangTypes.EN:
                    c.setGoogleSRLang("EN");
                    break;
                case GSRLangTypes.ZH:
                    c.setGoogleSRLang("ZH");
                    break;
                case GSRLangTypes.FR:
                    c.setGoogleSRLang("FR");
                    break;
                case GSRLangTypes.RU:
                    c.setGoogleSRLang("RU");
                    break; 
                case GSRLangTypes.DE:
                    c.setGoogleSRLang("DE");
                    break; 
                case GSRLangTypes.PT:
                    c.setGoogleSRLang("PT");
                    break; 
                case GSRLangTypes.IT:
                    c.setGoogleSRLang("IT");
                    break; 
                case GSRLangTypes.JA:
                    c.setGoogleSRLang("JA");
                    break;                                                                                                           
                default:
                    console.log("not support yet");
                    break;    
            }
        }
    }

    //% group="Speech"
    //% blockId=speech_set_wakeupword block="set speech wake up word %wkWord"
    //% weight=88 blockGap=12
    //% help=speech/speech-set-wakeupword     
    export function setWakeupWord(wkWord:WakeupWord) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.setSpeechWkWord(wkWord);
            wkmode = true;
        }
    }

    //% group="Speech"
    //% blockId=speech_wakeup block="robot wake up?"
    //% weight=65 blockGap=12
    //% help=speech/speech-receive-wakeup-notice    
    export function receiveWKNotice(handler: () => void) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.registerWakeupResponse(handler);
        }
    }   
    
}