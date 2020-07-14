//% color=#cf6a87 weight=80 icon="\uf0c1" blockGap=8
//% blockGap=8
namespace xtroniot {
    export const CODAL_SERIAL_MQTT_SUBRES_RECEIVED = 6
    type EvtStr = (data: string) => void;
    type EvtAct = () => void;
    type EvtNum = (data: number) => void;
    type EvtDict = (topic: string, data: string) => void;
    let mqttCbCnt = 0;
    let mqttCb: EvtStr[] = [null, null, null, null, null, null, null, null];
    let mqttCbKey: string[] = ['', '', '', '', '', '', '', ''];
    let mqttCbTopicData: EvtDict = null;
    /**
     * Set MQTT set host
     * @param host Mqtt server ip or address; eg: ovobotiot.cn
     * @param clientid Mqtt client id; eg: node01
    */
    //% blockId=mqtt_sethost block="set Host%host clientID%clientid"
    //% weight=90
    export function mqttSetHost(host: string, clientid: string): void {
        // let cmd: string = 'WF 15 2 15 ' + host + ' ' + clientid + '\n'
        // serial.writeString(cmd)
        // basic.pause(1000)
        // // reset mqtt handler
        // serial.writeString("WF 10 4 0 2 3 4 5\n") // mqtt callback install
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.setHost(host,clientid);
        }
        basic.pause(500)
    }

    //% blockId=mqtt_publish_basic block="publish %topic|message %message"
    //% weight=86
    export function mqttPublishBasic(topic: string, message: string): void {
        //mqtt_publish(topic, data, 1, 0);
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.pubTopicMessage(topic,message);
        }
    }

    //% blockId=mqtt_subscribe_basic block="subscribe %topic"
    //% weight=84
    export function mqtt_subscribe_basic(topic: string): void {
        //mqtt_subscribe(topic, 1);
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.subTopic(topic);
            
        }
    }

    /**
     * On MQTT subscribe message callback install
     * @param topic Mqtt topic; eg: /hello
     * @param handler Mqtt topic message callback;
    */
    //% blockId=on_mqtt_message block="on topic|%topic callback"
    //% weight=82
    export function onMqttMessage(topic: string, handler: (message: string) => void): void {
        // todo: push may null global definition
        // mqttCb.push(handler)
        // mqttCbKey.push(topic)
        if (mqttCbCnt >= 8) return;
        mqttCb[mqttCbCnt] = handler;
        mqttCbKey[mqttCbCnt] = topic;
        mqttCbCnt++;

        let c =  esp32.defaultController() as esp32.ATController;
        if (c && mqttCbCnt == 1) {
            c.onsubResponse(mqttCb,mqttCbKey);
        }
    }

        /**
     * On MQTT got any topic and message
     * @param handler Mqtt topic message callback;
    */
    //% blockId=on_mqtt_topic_message block="on  topic "
    //% weight=81
    //% blockGap=50 draggableParameters=reporter
    export function onMqttTopicMessage(handler: (topic: string, message: string) => void): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.registerMqttSubResponse(handler);
            if(mqttCbCnt == 0){
                c.onsubResponse(mqttCb,mqttCbKey);
            }
        }
    }
}