
enum TimeType{
    //% block="seconds"
    SECONDS,
    //% block="minute"
    MINUTE,
    //% block="hour"
    HOUR,
    //% block="day of the week"
    DAY,
    //% block="date"
    DATE,
    //% block="month"
    MONTH,
    //% block="year"
    YEAR
}

enum TimeFormat{
    //% block="yyyy-MM-dd hh:mm:ss"
    BASICFORMAT,
    //% block="yyyy/MM/dd hh:mm:ss"
    BASIC2FORMAT,
    //% block="yyyy-MM-dd"
    FORMATYMD,
    //% block="hh:mm:ss"
    FORMATHMS,
    //% block="yyyy-MM-dd ww hh:mm:ss"
    FORMATFULLSTR

}


//% color="#1876c7" weight=75 icon="\uf133" block="DateTime"
//% groups='["Time","Create", "Basic","Separator", "Theme", "Digits" ]'
namespace rtcModules {

    const REG_DS1339_SECONDS = 0x00
    const REG_DS1339_MINUTES = 0x01
    const REG_DS1339_HOURS  =  0x02
    const REG_DS1339_DAY = 0x03
    const REG_DS1339_DATE = 0x04
    const REG_DS1339_MONTH = 0x05
    const REG_DS1339_YEAR = 0x06
    const REG_DS1339_ALARM1_SECONDS = 0x07
    const REG_DS1339_ALARM1_MINUTES =  0x08
    const REG_DS1339_ALARM1_HOURS  = 0x09
    const REG_DS1339_ALARM1_DAYDATE =  0x0A
    const REG_DS1339_ALARM2_MINUTES = 0x0B
    const REG_DS1339_ALARM2_HOURS  = 0x0C
    const REG_DS1339_ALARM2_DAYDATE =  0x0D
    const REG_DS1339_CONTROL = 0x0E
    const REG_DS1339_STATUS = 0x0F
    const REG_DS1339_TRICKLE_CHARGER = 0x10
    
    const DS1339_ALARM1_ADDR = 0x07
    const DS1339_ALARM2_ADDR=  0x0B

    const RTC_TYPE_DS1339 = 0x68

    // let rtc_bcd:number[] = [0,0,0,0,0,0,0];
    // let secondsSp:Sprite[] = undefined;
    // let numThemeMap:Image[] = undefined;
    // let numspace = 1;

    //% shim=rtcModules::requestUpdate
    function requestUpdate() { }

    //% shim=rtcModules::getSeconds
    export declare function getSeconds(): number;

    //% shim=rtcModules::getMinutes
    export declare function getMinutes():number;

    //% shim=rtcModules::getHours
    export declare function getHours():number;

    //% shim=rtcModules::getDay
    export declare function getDay():number;

    //% shim=rtcModules::getDate
    export declare function getDate():number;

    //% shim=rtcModules::getMonth
    export declare function getMonth():number;

    //% shim=rtcModules::getFullYear
    export declare function getFullYear():number;


    // function startRTCTimer() {
    //     let timer = 0;

    //     game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
    //         const time = game.currentScene().millis();
    //         if (timer <= time) {
    //             timer = time + 100;
    //             requestUpdate();
    //             let timerstate: TimerState = game.currentScene().data[timerNamespace];
    //             if(timerstate){
    //                 timerstate.timers.forEach(timer => timer.update());
    //             }
    //         }
    //     });
    // }

    /**
     * TODO: read format time string.
     */
    //% group="Time"
    //% block weight=50
    //% blockId=rtc_read_format_time block="time in %fmt   "
    export function readTimeStringFormateFrom(fmt:TimeFormat = TimeFormat.BASICFORMAT) : string {
        const weekCN = '一二三四五六日';

        const weekEN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        let format:string;
        switch(fmt){
            case 0:
                format = "yyyy-MM-dd hh:mm:ss"
                break;
            case 1:
                format = "yyyy/MM/dd hh:mm:ss"
                break;    
            case 2:
                format = "yyyy-MM-dd"
                break;
            case 3:
                format = "hh:mm:ss"
                break;
            case 4:
                format = "yyyy-MM-dd ww hh:mm:ss"
                break;                
        }
        let year = getFullYear();
        let month = getMonth();
        let day = getDate();
        let hours = getHours();
        let minutes = getMinutes();
        let seconds = getSeconds();
        let week = getDay();
    
        let monthstr = month >= 10 ? month.toString() : ('0' + month);
        let daystr = day >= 10 ? day.toString() : ('0' + day);
        let hoursstr = hours >= 10 ? hours.toString() : ('0' + hours);
        let minutesstr = minutes >= 10 ? minutes.toString() : ('0' + minutes);
        let secondsstr = seconds >= 10 ? seconds.toString() : ('0' + seconds);
    
        if (format.indexOf('yyyy') !== -1) {
            format = format.replace('yyyy', year.toString());
        } else {
            format = format.replace('yy', (year + '').slice(2));
        }
        format = format.replace('mm', minutesstr);
        format = format.replace('dd', daystr);
        format = format.replace('hh', hoursstr);
        format = format.replace('MM', monthstr);
        format = format.replace('ss', secondsstr);
        format = format.replace('W', weekCN[week - 1]);
        format = format.replace('ww', weekEN[week - 1]);
        format = format.replace('w', week.toString());
    
        return format;
    }


    /**
     * TODO: read rtc seconds.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readSeconds(): number {
        return getSeconds();
    }

    /**
     * TODO: read rtc minutes.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readMinutes(): number {
        return getMinutes();
    }

    /**
     * TODO: read rtc hours.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readHours(): number {
        return getHours();
    }

    /**
     * TODO: read rtc day of week.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readDaysofWeek():number {
        return getDay();
    }

    /**
     * TODO: read rtc date of month.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readDate():number {
        return getDate();
    }

    /**
     * TODO: read rtc month.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readMonths():number {
        return getMonth();
    }

    /**
     * TODO: read rtc year.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readYear():number {
        return getFullYear();
    }


    /**
     * TODO: read rtc time.
     */
    //% group="Time" 
    //% weight=50
    //% blockId=rtc_read block="time %type"
    export function readRTCTime(type:TimeType = TimeType.SECONDS) : number{
        switch (type) {
            case TimeType.SECONDS:
                return readSeconds();
            case TimeType.MINUTE:
                return readMinutes();
            case TimeType.HOUR:
                return readHours();
            case TimeType.DAY:
                return readDaysofWeek();    
            case TimeType.DATE:
                return readDate();
            case TimeType.MONTH:
                return readMonths();
            case TimeType.YEAR:
                return readYear();        
        }
        return 0;
    }

    function bin2bcd(v:number)
    {
        return ((v / 10)<<4) + (v % 10);
    }

    export function writeRtcTime(year:number,month:number,date:number,hour:number,minutes:number,seconds:number){
        let buf = pins.createBuffer(8);
        buf[0] = 0x00;
        buf[1] = bin2bcd(seconds);
        buf[2] = bin2bcd(minutes);
        buf[3] = bin2bcd(hour);
        buf[4] = bin2bcd(readDaysofWeek());
        buf[5] = bin2bcd(date);   
        buf[6] = bin2bcd(month);  
        buf[7] = bin2bcd(year);      
        pins.i2cWriteBuffer(RTC_TYPE_DS1339, buf);
    }
}
