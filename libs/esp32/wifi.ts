
/**
 * WiFi
 */
//% weight=79
//% icon="\uf1eb" color="#BE4BDB"
namespace wifi {
    //% blockId=wifi_connect block="connect to Wi-Fi name:%name password:%password"
    //% weight=92 blockGap=12
    //% help=wifi/wifi-connect
    export function connect(name: string, password: string): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.wifiConnect(name,password);
        }
    }

    //% blockId=wifi_isConnected block="is Wi-Fi connected?"
    //% weight=90 blockGap=12
    //% help=wifi/wifi-isconnected
    export function isConnected(): boolean {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.isConnected;
        }
        return false;
    }

    /**
     * get wifi info
    */
    //% blockId=wifi_set_getrssi block="get Wi-Fi rssi"
    //% weight=70 blockGap=12
    //% help=wifi/wifi-strength
    export function getRssi(): number {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
           return c.getRssi();
        }
        return undefined;
    }
}