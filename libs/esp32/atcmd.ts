/**
 * AT COMMAND
 */
//% weight=1
//% advanced=true
//% icon="\uf129" color="#007AAE"
namespace AT{

    /**
     * Send at command.
     * @param command the command string
     */
    //% blockId=at_send block="send AT command  %command"
    //% weight=85 blockGap=12
    export function sendCommand(command:string) {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            return c.sendATTest(command);
        }
    }

    //% blockId=at_result block="AT command result"
    //% weight=60 blockGap=12
    //% draggableParameters=reporter
    export function onATResult(handler: (atResult: string[]) => void): void {
        let c =  esp32.defaultController() as esp32.ATController;
        if (c) {
            c.registerATResponse(handler);
        }
    }
}