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
    //% help=net/get-json    
    export function getJson(url: string): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.httpRequestGet(url);
        } 
    }

    
    //% blockId=net_http_result block="on network return"
    //% weight=60 blockGap=12
    //% draggableParameters=reporter
    //% help=net/on-network-return-result    
    export function onNetworkReturn(handler: (netResult: string) => void): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.registerNetRequestResponse(handler);
        }
    }
}