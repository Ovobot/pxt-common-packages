
/**
 * WiFi
 */
//% weight=79
//% icon="\uf1eb" color="#BE4BDB"
namespace wifi {
    //% blockId=wifi_setpassphrase block="Wi-Fi connect to account:%ssid password:%passphrase"
    //% weight=92 blockGap=12
    export function setPassphrase(ssid: string, passphrase: string): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.wifiConnect(ssid,passphrase);
        }
    }

    //% blockId=wifi_connected block="Wi-Fi connected?"
    //% weight=90 blockGap=12
    export function connected(): boolean {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.isConnected;
        }
        return false;
    }

    /**
     * get wifi info
     * @param ssid wifi ssid; eg: @PHICOMM_B8
    */
    //% blockId=wifi_set_getrssi block="get rssi strength"
    //% weight=70 blockGap=12
    export function getRssiStrength(): number {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
           return c.getRssi();
        }
        return undefined;
    }
}