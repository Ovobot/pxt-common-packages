/**
 * Power and sleep management
 */
//% advanced=true icon="\uf011" color="#898989"
//% weight=1 blockGap=8
namespace power {
    let _poked: number;
    let _timeout: number;
    let _screenout:number;
    let _screenSleep:boolean;
    /**
     * Set the no-activity duration after which the device should go to deep sleep.
     * @param seconds duration in seconds until the device should be put in lower power mode
     */
    //% blockId=powersetdeepsleeptimout block="power set deep sleep timeout to %seconds s"
    //% seconds.defl=60
    //% help=/power/set-deep-sleep-timeout
    export function setDeepSleepTimeout(seconds: number) {
        init();
        _timeout = seconds;
    }

    export function setScreenTimeout(seconds: number) {
        init();
        _screenout = seconds;
    }

    /**
     * Poke the activity watcher to keep the device awake.
     */
    //% blockId=powerpke block="power poke"
    //% help=/power/poke
    export function poke() {
        init();
        _screenSleep = false;
        _poked = control.millis();
    }

    /**
     * Check if the device has had any "pokes" and needs to go into deep sleep mode.
     */
    //% blockId=powercheckdeepsleep block="power check deep sleep"
    //% help=/power/check-deep-sleep
    export function checkDeepSleep() {
        init();
        const p = _poked || 0;
        const to = _timeout || 0;
        if (to > 0 && 
            control.millis() - p > to &&
            !control.isUSBOnline()) {
            // going to deep sleep
            deepSleep();
        }
        if(control.isUSBOnline()) {
            _poked = control.millis();
        }
    }

    export function checkScreenSleep() {
        init();
        const p = _poked || 0;
        const to = _screenout || 0;

        if (to > 0 && 
            control.millis() - p > to &&
            !control.isUSBOnline()) {
            screen.setBrightnessZero();
            screen.setSleep(true);
            _screenSleep = true;
        }
        if(control.isUSBOnline()) {
            _poked = control.millis();
        }
    }

    export function isInScreenSleep(): boolean {
        return _screenSleep;
    }

    /**
     * Put the device into a deep sleep state.
     */
    //% blockId=powerdeepsleep block="power deep sleep"
    //% shim=pxt::deepSleep
    //% help=/power/deep-sleep
    export function deepSleep() {
    }

    function init() {
        if (_timeout !== undefined) return;

        // read default value
        _timeout = control.getConfigValue(DAL.CFG_POWER_DEEPSLEEP_TIMEOUT, -1) * 1000;
        _screenout = 0;
        // ensure deepsleep is long enough
        const minDeepSleepTimeout = 300000;
        if (_timeout > 0 && _timeout < minDeepSleepTimeout)
            _timeout = minDeepSleepTimeout;

    }

    export function resetPower() {
        // read default value

        _timeout =  settings.readNumber("#deepsleep") || 0;//if undefined will return 0
        _screenout = settings.readNumber("#screensleep") || 0;//if undefined will return 0

        if (_timeout == 0) {
            _timeout = control.getConfigValue(DAL.CFG_POWER_DEEPSLEEP_TIMEOUT, 1) * 1000;
            // ensure deepsleep is long enough
            const minDeepSleepTimeout = 300000;
            if (_timeout > 0 || _timeout < minDeepSleepTimeout)
                _timeout = minDeepSleepTimeout;
            settings.writeNumber("#deepsleep", _timeout)
        }
        if (_screenout == 0) {
            _screenout = -1;
            settings.writeNumber("#screensleep", _screenout)
        }
    }
}
