/**
 * XtronPro communication lego hardware
 */
//% weight=90 
//% icon="\uf085" color="#de0011"
namespace lego {
    export let _defaultController: LegoController;

    class LegoController {
        mavlink:Mavlink;
        constructor(private ser: serial.Serial) {
            this.ser.serialDevice.setTxBufferSize(150);
            this.ser.serialDevice.setRxBufferSize(200);
            this.ser.serialDevice.setBaudRate(BaudRate.BaudRate115200);
            this.mavlink = new Mavlink();
        }

        public ctlServoAngle(angle:number) {
            const msg = this.mavlink.mavlinkPackCtrlServo(angle);
            this.ser.serialDevice.writeBuffer(msg);
        }
    }

    export function defaultController(): LegoController {
        // cached
        if (_defaultController) return _defaultController;

        const rx = pins.pinByCfg(DAL.CFG_PIN_RX);
        const tx = pins.pinByCfg(DAL.CFG_PIN_TX);
        if (rx && tx) {
            const dev = serial.createSerial(tx,rx);
             _defaultController = new LegoController(dev);
            return _defaultController;
        }
        return undefined;
    }

    //% blockId=legocontrolServoAngle block="control servo to angle %angle °"
    //% weight=100 blockGap=8
    export function controlServoAngle(angle:number) {
        const c = defaultController();
        if (c) {
            c.ctlServoAngle(angle);
        }
    }

}