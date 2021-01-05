namespace esp32 {
    export let _defaultController: net.Controller;
    export function defaultController(): net.Controller {
        // cached
        if (_defaultController) return _defaultController;


        // pause(1000);
        // look for ESP32 over serial pins
        const rx = pins.pinByCfg(DAL.CFG_PIN_WIFI_AT_RX);
        const tx = pins.pinByCfg(DAL.CFG_PIN_WIFI_AT_TX);

        if (rx && tx) {
            const dev = serial.createSerial(tx,rx,DAL.DEVICE_ID_SERIAL);
            // look for ESP32 over SPI pins
            const cs = pins.pinByCfg(DAL.CFG_PIN_WIFI_CS)
            if (cs) {
                cs.digitalWrite(true);
            }
            //pause(2000);
             _defaultController = new ATController(dev);
             let c = _defaultController as esp32.ATController;
             c.startATBackgroundTask();
            while(!c.isEsp32Ready){
                pause(10);
            }
            return _defaultController;
        }
        


        // const busy = pins.pinByCfg(DAL.CFG_PIN_WIFI_BUSY);
        // const reset = pins.pinByCfg(DAL.CFG_PIN_WIFI_RESET);
        // const gpio0 = pins.pinByCfg(DAL.CFG_PIN_WIFI_GPIO0); // optional
        // if (!!cs && !!busy && !!reset) {
        //     // grab SPI pins and go
        //     const mosi = pins.pinByCfg(DAL.CFG_PIN_WIFI_MOSI);
        //     const miso = pins.pinByCfg(DAL.CFG_PIN_WIFI_MISO);
        //     const sck = pins.pinByCfg(DAL.CFG_PIN_WIFI_SCK);
        //     let spi: SPI;
        //     if (!mosi && !miso && !sck) {
        //         spi = pins.spi();
        //     } else if (mosi && miso && sck) {
        //         spi = pins.createSPI(mosi, miso, sck);
        //     } else {// SPI misconfigured
        //         net.log("esp32 spi configuration error");
        //         control.panic(control.PXT_PANIC.CODAL_HARDWARE_CONFIGURATION_ERROR);
        //     }
        //     if (spi)
        //         return _defaultController = new NinaController(spi, cs, busy, reset, gpio0);
        // } else if (!cs && !busy && !reset) {
        //     return undefined;
        //     // do nothing, panic later
        // } else { // cs,busy,reset misconfigured
        //     net.log("esp32 partially configured");
        //     control.panic(control.PXT_PANIC.CODAL_HARDWARE_CONFIGURATION_ERROR);
        // }

        // no option
        //net.log("esp32 configuration error");
        //control.panic(control.PXT_PANIC.CODAL_HARDWARE_CONFIGURATION_ERROR);
        return undefined;
    }

    // initialize net
    //console.log("init default controller");
    //new net.Net(defaultController);
}