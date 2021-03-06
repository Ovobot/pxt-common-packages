//% color=#6A31CA weight=70 icon="\uf0c1" blockGap=8 block="IoT"
//% blockGap=8
namespace xtroniot {
    /**
     * connect MQTT server
     * @param clientid Mqtt client id
    */
    //% blockId=mqtt_sethost block="connect server with clientID%clientid"
    //% weight=90
    //% help=xtroniot/mqtt-connect    
    export function mqttConnect(clientid: string): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.setHost(clientid);
        }
        basic.pause(500)
    }

    /**
     * Write a name:value pair as a line of text to the mobile console's chart.
     * @param consoleName name of the console to publish
     * @param chartName  name of chart to display data
     * @param name name of the value stream, eg: "x"
     * @param value to write
     */
    //% blockId=mqtt_publish_basic block="publish to console %consoleName chartName %chartName value %name|= %value"
    //% weight=86
    //% name.shadow=text
    //% value.shadow=math_number
    //% inlineInputMode=inline
    //% help=xtroniot/mqtt-publish    
    export function mqttPublish(consoleName: string,chartName:string, name: string, value: number): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            let message = "{" + "\\\"" +name + "\\\"" + ":" + value + "}"
            c.pubTopicMessage(consoleName,chartName,message);
        }
    }

    //% blockId=mqtt_subscribe_console block="subscribe console  %name"
    //% weight=84
    //% help=xtroniot/mqtt-subscribe    
    export function mqttSubscribeConsoleName(name: string): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.subTopic(name);
        }
    }

    /**
     * On MQTT got any topic and message
     * @param handler Mqtt topic message callback;
    */
    //% blockId=on_mqtt_topic_message block="on receive "
    //% weight=81
    //% blockGap=50 draggableParameters=reporter
    //% help=xtroniot/mqtt-receive-message    
    export function onMqttReceive(handler: (consoleName: string, message: string) => void): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.registerMqttSubResponse(handler);
        }
    }
}