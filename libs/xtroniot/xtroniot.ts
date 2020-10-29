//% color=#6A31CA weight=70 icon="\uf0c1" blockGap=8
//% blockGap=8
namespace xtroniot {
    /**
     * Set MQTT set host
     * @param host Mqtt server ip or address; eg: ovobotiot.cn
     * @param clientid Mqtt client id; eg: node01
    */
    //% blockId=mqtt_sethost block="connect server with clientID%clientid"
    //% weight=90
    export function mqttSetHost(clientid: string): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.setHost(clientid);
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
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.onsubResponse(topic,handler);
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
        }
    }
}