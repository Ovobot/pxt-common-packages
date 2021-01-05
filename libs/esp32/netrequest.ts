/**
 * NET REQUEST
 */
//% weight=1
//% advanced=true
//% icon="\uf233" color="#85C8C0"
namespace net {
    /** 
     * Send HTTP GET request and return JSON 
     **/
    //% blockId=net_getjson block="get json $url"
    //% weight=62 draggableParameters=reporter
    export function getJSON(url: string): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.httpRequestGet(url);
        } 
    }

    
    //% blockId=net_http_result block="network data callback"
    //% weight=60 blockGap=12
    //% draggableParameters=reporter
    export function onNetworkResult(handler: (netResult: string) => void): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.registerNetRequestResponse(handler);
        }
    }
}