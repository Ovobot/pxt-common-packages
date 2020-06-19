enum SegmentStyle {
    //% block="blank"
    Blank = 0,
    //% block="thin"
    Thin = 1,
    //% block="narrow"
    Narrow = 2,
    //% block="medium"
    Medium = 3,
    //% block="thick"
    Thick = 4
}

enum DigitsIndex{
    //% block="units"
    Units = 1,
    //% block="tens"
    Tens = 2,
    //% block="hundreds"
    Hundreds = 3,
    //% block="thousands"
    Thousands  = 4
}

enum SegmentScale {
    //% block="full"
    Full,
    //% block="half"
    Half
}

enum TimerNumTheme{
    //% block="iconzero"
    NUM0,
    //% block="iconone"
    NUM1,
    //% block="icontwo"
    NUM2,
    //% block="iconthree"
    NUM3,
    //% block="iconfour"
    NUM4,
    //% block="iconfive"
    NUM5,
    //% block="iconsix"
    NUM6,
    //% block="iconseven"
    NUM7,
    //% block="iconeight"
    NUM8,
    //% block="iconnine"
    NUM9
}

enum TimeType{
    //% block="seconds"
    SECONDS,
    //% block="minute"
    MINUTE,
    //% block="hour"
    HOUR,
    //% block="date"
    DATE,
    //% block="month"
    MONTH,
    //% block="year"
    YEAR
}

enum SeparatorType{
    //% block="colon"
    COLON,
    //% block="dash"
    DASH
}

enum DigitRadix {
    //% block="decimal"
    Decimal = 10,
    //% block="hex"
    Hex = 16,
    //% block="octal"
    Octal = 8,
    //% block="alpha"
    Alpha = 25
}

// "ABCDEFHJLoPUY-°"
enum SegmentCharacter {
    //% block="A"
    A = 10,
    //% block="B"
    B,
    //% block="C"
    C,
    //% block="D"
    D,
    //% block="E"
    E,
    //% block="F"
    F,
    //% block="H"
    H,
    //% block="J"
    J,
    //% block="L"
    L,
    //% block="o"
    o,
    //% block="P"
    P,
    //% block="U"
    U,
    //% block="Y"
    Y,
    //% block="-"
    Hyphen,
    //% block="°"
    Degree
}
//% color=190 weight=100 icon="\uf133" block="RTC"
//% groups='["Time","Create", "Basic","Separator", "Theme", "Digits" ]'
namespace rtcModules {

    const segmap: Buffer = hex`fc60daf266b6bee0fef6ee3e9c7a9e8e6e781c3ace7c7602c6`;
    // packed metrics of pixel drawing for full size digit segments
    const fullSegment: Buffer[] = [
        hex`01000e0002010d0103020c0204030b03`,
        hex`0f020f0e0e030e0d0d040d0c0c050c0b`,
        hex`0f110f1d0e120e1c0d130d1b0c140c1a`,
        hex`011f0e1f021e0d1e031d0c1d041c0b1c`,
        hex`0011001d0112011c0213021b0314031a`,
        hex`0002000e0103010d0204020c0305030b`,
        hex`020f0d0f02100d10030e0c0e03110c11`
    ];
    // packed metrics of pixel drawing for half size digit segments
    const halfSegment: Buffer[] = [
        hex`0100060002010501`,
        hex`0702070606030605`,
        hex`0708070d0609060c`,
        hex`010f060f020e050e`,
        hex`0008000d0109010c`,
        hex`0002000601030105`,
        hex`0207050702070507`
    ];
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
    const defaultIcons: Image[] = [
        img`
        . f f f f f f . 
        f f 1 1 1 1 f f 
        f 1 1 1 1 1 1 f 
        f 1 1 f f 1 1 f 
        f 1 1 f 1 1 1 f 
        f 1 1 1 f 1 1 f 
        f 1 1 f f 1 1 f 
        f 1 1 1 1 1 1 f 
        f f 1 1 1 1 f f 
        . f f f f f f . `,
        img`
        f f f f f f . . 
        f 1 1 1 1 f . . 
        f f f 1 1 f . . 
        . . f 1 1 f . . 
        . . f 1 1 f . . 
        . . f 1 1 f . . 
        . . f 1 1 f . . 
        f f f 1 1 f f f 
        f 1 1 1 1 1 1 f 
        f f f f f f f f `,
        img`
        f f f f f f f . 
        f 1 1 1 1 1 f f 
        f 1 1 1 1 1 1 f 
        f f f f f 1 1 f 
        f f 1 1 1 1 1 f 
        f 1 1 1 1 1 f f 
        f 1 1 f f f f f 
        f 1 1 1 1 1 1 f 
        f 1 1 1 1 1 1 f 
        f f f f f f f f`,
        img`
        f f f f f f f f 
        f 1 1 1 1 1 1 f 
        f 1 1 1 1 1 1 f 
        f f f f f 1 1 f 
        . f 1 1 1 1 1 f 
        . f 1 1 1 1 1 f 
        f f f f f 1 1 f 
        f 1 1 1 1 1 1 f 
        f 1 1 1 1 1 1 f 
        f f f f f f f f `,
        img`
        f f f f f f f f 
        f 1 1 f f 1 1 f 
        f 1 1 f f 1 1 f 
        f 1 1 f f 1 1 f 
        f 1 1 1 1 1 1 f 
        f 1 1 1 1 1 1 f 
        f f f f f 1 1 f 
        . . . . f 1 1 f 
        . . . . f 1 1 f 
        . . . . f f f f`,
        img`
        f f f f f f f f 
        f 1 1 1 1 1 1 f 
        f 1 1 1 1 1 1 f 
        f 1 f f f f f f 
        f 1 1 1 1 1 f f 
        f 1 1 1 1 1 1 f 
        f f f f f 1 1 f 
        f 1 1 1 1 1 1 f 
        f 1 1 1 1 1 f f 
        f f f f f f f . `,
        img`
        . f f f f f f . 
        f f 1 1 1 1 f . 
        f 1 1 1 1 1 f . 
        f 1 1 f f f f . 
        f 1 1 1 1 1 f f 
        f 1 1 1 1 1 1 f 
        f 1 1 f f 1 1 f 
        f 1 1 1 1 1 1 f 
        f f 1 1 1 1 f f 
        . f f f f f f . `,
        img`
        f f f f f f f f 
        f 1 1 1 1 1 1 f 
        f 1 1 1 1 1 1 f 
        f 1 1 f f 1 1 f 
        f 1 1 f f 1 1 f 
        f f f f f 1 1 f 
        . . . . f 1 1 f 
        . . . . f 1 1 f 
        . . . . f 1 1 f 
        . . . . f f f f`,
        img`
        . f f f f f f . 
        f f 1 1 1 1 f f 
        f 1 1 1 1 1 1 f 
        f 1 1 f f 1 1 f 
        f f 1 1 1 1 f f 
        f 1 1 1 1 1 1 f 
        f 1 1 f f 1 1 f 
        f 1 1 1 1 1 1 f 
        f f 1 1 1 1 f f 
        . f f f f f f .`,
        img`
        . f f f f f f . 
        f f 1 1 1 1 f f 
        f 1 1 1 1 1 1 f 
        f 1 1 f f 1 1 f 
        f 1 1 1 1 1 1 f 
        f f 1 1 1 1 1 f 
        . f f f f 1 1 f 
        . f 1 1 1 1 1 f 
        . f 1 1 1 1 f f 
        . f f f f f f .`
    ];
    let rtc_bcd:number[] = [0,0,0,0,0,0,0];
    let secondsSp:Sprite[] = undefined;
    let numThemeMap:Image[] = undefined;
    let numspace = 1;
    function requestUpdate(){
        pins.i2cWriteNumber(RTC_TYPE_DS1339, REG_DS1339_SECONDS, NumberFormat.UInt8LE)
        const buf = pins.i2cReadBuffer(RTC_TYPE_DS1339, 7);
        for(let i = 0; i < 7; ++i) {
            rtc_bcd[i] = buf.getNumber(NumberFormat.UInt8LE, i);
        }
    }

    /**
     * TODO: start rtc timer.
     */
    //% group="Time"
    //% weight=50
    //% blockId=rtc_init block="start rtc timer"
    export function startRTCTimer() {
        let timer = 0;

        game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
            const time = game.currentScene().millis();
            if (timer <= time) {
                timer = time + 100;
                requestUpdate();
                let timerstate: TimerState = game.currentScene().data[timerNamespace];
                if(timerstate){
                    
                    timerstate.timers.forEach(timer => timer.update());

                    // let seconds = readSeconds()
                    // secondsSp[1].setImage(numThemeMap[readDigit(DigitsIndex.Units, seconds)])
                    // secondsSp[0].setImage(numThemeMap[readDigit(DigitsIndex.Tens, seconds)])
                    // displaySecondsSpriteAtPosition(secondsSp[0].left,secondsSp[0].top,numspace)
                }
            }
        });
    }


    /**
     * TODO: read rtc seconds.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readSeconds(): number {
        //let res = pins.i2cReadRegister(RTC_TYPE_DS1339, REG_DS1339_SECONDS, NumberFormat.UInt8LE);
        let res = rtc_bcd[0];
        let data = (res & 0x7f);
        let seconds = (data>>4)*10 + (data&0x0f);
        return seconds;
    }

    /**
     * TODO: read rtc minutes.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readMinutes(): number {
        //let res = pins.i2cReadRegister(RTC_TYPE_DS1339, REG_DS1339_MINUTES, NumberFormat.UInt8LE);
        let res = rtc_bcd[1];
        let data = (res & 0x7f);
        let minutes = (data>>4)*10 + (data&0x0f);
        return minutes;
    }

    /**
     * TODO: read rtc hours.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readHours(): number {
        let minutes = 0;
        //let res = pins.i2cReadRegister(RTC_TYPE_DS1339, REG_DS1339_HOURS, NumberFormat.UInt8LE);
        let res = rtc_bcd[2];
        let data = (res & 0x7f);
        let flag12 =  data >> 6;
        if(flag12){

            let getAMPM = (data &= (1<<5));
            let data2 = (data & 0x1f);
            minutes = (data2>>4)*10 + (data&0x0f);
        } else {
            let data2 = (data & 0x3f);
            minutes = (data2>>5)*20 + ((data & 0x1f)>>4)*10 + (data2&0x0f);
        }
        return minutes;
    }

    /**
     * TODO: read rtc day of week.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readDaysofWeek():number {
        //let day = pins.i2cReadRegister(RTC_TYPE_DS1339, REG_DS1339_DAY, NumberFormat.UInt8LE);
        let day = rtc_bcd[3];
        return day;
    }

    /**
     * TODO: read rtc date of month.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readDate():number {
        //let res = pins.i2cReadRegister(RTC_TYPE_DS1339, REG_DS1339_DATE, NumberFormat.UInt8LE);
        let res = rtc_bcd[4];
        let data = (res & 0x3f);
        let date = (data>>4)*10 + (data&0x0f);
        return date;
    }

    /**
     * TODO: read rtc month.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readMonths():number {
        //let res = pins.i2cReadRegister(RTC_TYPE_DS1339, REG_DS1339_MONTH, NumberFormat.UInt8LE);
        let res = rtc_bcd[5];
        let data = (res & 0x1f);
        let month = (data>>4)*10 + (data&0x0f);
        return month;
    }

    /**
     * TODO: read rtc year.
     */
    //% group="Time"
    //% block weight=50
    //% blockHidden=1
    export function readYear():number {
        //let res = pins.i2cReadRegister(RTC_TYPE_DS1339, REG_DS1339_YEAR, NumberFormat.UInt8LE);
        let res = rtc_bcd[6];
        let year = 2000 + (res >> 4) * 10 + (res & 0x0f);
        return year;
    }


    /**
     * TODO: read rtc time.
     */
    //% group="Time" 
    //% weight=50
    //% blockId=rtc_read block="read rtc  %type  of time "
    export function readRTCTime(type:TimeType = TimeType.SECONDS) : number{
        switch (type) {
            case TimeType.SECONDS:
                return readSeconds();
            case TimeType.MINUTE:
                return readMinutes();
            case TimeType.HOUR:
                return readHours();
            case TimeType.DATE:
                return readDate();
            case TimeType.MONTH:
                return readMonths();
            case TimeType.YEAR:
                return readYear();        
        }
        return 0;
    }

    /**
     * TODO: read rtc year.
     */
    //% group="Time"
    //% block weight=50
    //% blockId=time_convert block="get digit in %type with value %value"
    export function readDigit(type:DigitsIndex,value:number) : number{
        if(type == DigitsIndex.Thousands){
            if(value < 1000) return 0;
            return value/1000;
        }  else if(type == DigitsIndex.Hundreds){
            if(value < 100) return 0;
            return (value/100)%10;
        } else if(type == DigitsIndex.Tens){
            if(value < 10) return 0;
            return (value/10)%10;
        } else {
            return (value%10);
        }
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





export function drawSegment(digit: Image, segment: Buffer, thickness: SegmentStyle, color: number) {
    let offset = 0;
    let x, y, w, h = 0;
    if (segment.length >= thickness * 4) {
        for (let i = 0; i < thickness; i++) {
            x = segment.getNumber(NumberFormat.Int8LE, offset + 0);
            y = segment.getNumber(NumberFormat.Int8LE, offset + 1);
            w = segment.getNumber(NumberFormat.Int8LE, offset + 2) - x + 1;
            h = segment.getNumber(NumberFormat.Int8LE, offset + 3) - y + 1;
            digit.fillRect(x, y, w, h, color);
            offset += 4;
        }
    }
}

export function drawDigit(digit: Image, value: number, thickness: SegmentStyle, scale: SegmentScale, color: number) {
    let segment: Buffer = null;
    let digitMap = segmap.getNumber(NumberFormat.Int8LE, value)

    digit.fill(0);
    for (let i = 0; digitMap != 0; i++) {
        if ((digitMap & 0x80) != 0) {
            segment = scale == SegmentScale.Full ? fullSegment[i] : halfSegment[i];
            if (scale == SegmentScale.Half && thickness > SegmentStyle.Narrow) {
                thickness = SegmentStyle.Narrow;
            }
            drawSegment(digit, segment, thickness, color)
        }
        digitMap = digitMap << 1;
    }
}
    /**
     * Create a seven segment display digit
     * @param thickness the width of the segments, eg: SegmentStyle.Thick
     * @param value optional initial display value, eg: 0
     */
    //% group="Create"
    //% blockId=sevenseg_create block="create seven segment digit || of %thickness with value %value"
    //% expandableArgumentMode=toggle
    //% blockSetVariable=myDigit
    //% weight=80
    export function createDigit(thickness: SegmentStyle = SegmentStyle.Thick, value: number = 0): SevenSegDigit {
        return new SevenSegDigit(thickness, value)
    }

    /**
     * Create a timer component to display time 
     * @param type the type of the time, eg: TimeType.SECONDS
     */
    //% group="Create"
    //% blockId=timer_component_create block="timer to display %type "
    //% blockSetVariable=myTimerComponent
    //% weight=99
    export function createTimerComponent(type: TimeType = TimeType.SECONDS): TimerComponent {
        return new TimerComponent(type)
    }


    
    /**
     * Create a separator component 
     * @param type the type of the time, eg: SeparatorType.COLON
     */
    //% group="Create"
    //% blockId=separator_component_create block="create separator %type "
    //% blockSetVariable=mySeparator
    //% weight=99
    export function createSeparatorComponent(type: SeparatorType = SeparatorType.COLON): SeparatorComponent {
        return new SeparatorComponent(type)
    }



    //% group="DefaultTheme"
    //% blockId=display_seconds block="display seconds"
    //% weight=99
    //% blockHidden=1
    export function displaySecondsSprite(){
        if(secondsSp) return;
        secondsSp = []
        numThemeMap = []
        let secR0sp =  sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Player)
    
        let secR1sp =  sprites.create(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, SpriteKind.Player)

        numThemeMap.push(THEME1_NUM_0)
        numThemeMap.push(THEME1_NUM_1)
        numThemeMap.push(THEME1_NUM_2)
        numThemeMap.push(THEME1_NUM_3)
        numThemeMap.push(THEME1_NUM_4)
        numThemeMap.push(THEME1_NUM_5)
        numThemeMap.push(THEME1_NUM_6)
        numThemeMap.push(THEME1_NUM_7)
        numThemeMap.push(THEME1_NUM_8)
        numThemeMap.push(THEME1_NUM_9)
        secR0sp.setImage(THEME1_NUM_0)
        secR1sp.setImage(THEME1_NUM_0)

        secondsSp.push(secR1sp)
        secondsSp.push(secR0sp)
    }


    //% group="Theme"
    //% blockId=display_seconds_postion block="display seconds at left %left top %top  || with number space %space"
    //% weight=99
    //% blockHidden=1
    export function displaySecondsSpriteAtPosition(left:number,top:number,space:number = 1){
        if(!secondsSp) {
            displaySecondsSprite()
        }
        let spR1 = secondsSp[0]
        let spR0 = secondsSp[1]
        spR1.left = left;
        spR1.top = top;
        spR0.left = space + spR1.right
        spR0.top = spR1.top
        numspace = space
    }
    
    /**
     * Sets the image on the sprite
     */
    //% group="Theme"
    //% blockId=set_timernum_theme block="set %themeicon image to %img=screen_image_picker"
    //% weight=50 
    //% blockHidden=1
    export function setThemeNumberImage(themeicon: TimerNumTheme = TimerNumTheme.NUM0, img: Image){
        displaySecondsSprite()
        if(numThemeMap){
            numThemeMap[themeicon] = img;
            let spR1 = secondsSp[0]
            displaySecondsSpriteAtPosition(spR1.left,spR1.top,numspace)
        } 
    }

    //% fixedInstances blockId=timer_theme block="theme %v"
    export class ThemeIcon {
        public icons:Image[] = []
        // constructor(icon0:any) {
        //     this.icons = []
        //     this.icons.push(icon0)
        //     // this.icons.push(icon1)
        //     // this.icons.push(icon2)
        //     // this.icons.push(icon3)
        //     // this.icons.push(icon4)
        //     // this.icons.push(icon5)
        //     // this.icons.push(icon6)
        //     // this.icons.push(icon7)
        //     // this.icons.push(icon8)
        //     // this.icons.push(icon9)

        //     console.log("hehe");

        //     let tmpicon = img`
        //     . f f f f f f . 
        //     f f 1 1 1 1 f f 
        //     f 1 1 1 1 1 1 f 
        //     f 1 1 f f 1 1 f 
        //     f 1 1 f 1 1 1 f 
        //     f 1 1 1 f 1 1 f 
        //     f 1 1 f f 1 1 f 
        //     f 1 1 1 1 1 1 f 
        //     f f 1 1 1 1 f f 
        //     . f f f f f f . 
        // `;

        //     console.log(icon0);

        //     console.log(tmpicon);


        //     console.log("array");

        //     console.log(this.icons);
        // }

        constructor(public v: Image[]) {
        }
    }
    

    //% blockId=timer_theme
    //% block="%themeIcon"
    //% blockHidden=1
    export function timerIcon(themeIcon: ThemeIcon) {
        return themeIcon.v;
    }

    //% fixedInstance whenUsed block="timer number theme1"
    export const defaultThemeIcons = new ThemeIcon(defaultIcons);

    //% fixedInstance whenUsed block="timer number theme2"
    export const defaultThemeIcons2 = new ThemeIcon(defaultIcons);

}

    const timerNamespace = "__rtcTimer";

    interface TimerState {
        timers: TimerComponent[];
    }


    //% blockNamespace=rtcModules color="#4682B4" blockGap=8
    class SeparatorComponent{
        private sepKind:SeparatorType;
        private sepImg:Image;
        private sprite:Sprite;
        constructor(type: SeparatorType = SeparatorType.COLON){
            this.sepKind = type
            this.sepImg = type == SeparatorType.COLON ? rtcModules.THEME1_COLON : rtcModules.THEME1_DASH
            this.sprite =  sprites.create(this.sepImg)
        }

        //% group="Separator"
        //% blockId=separator_component_postion block="set %rtcModules(mySeparator) position to x %x y %y"
        //% weight=50
        //% x.shadow="positionPicker" y.shadow="positionPicker"
        displayAtPosition(x:number,y:number){
            this.sprite.x = x
            this.sprite.y = y
        }

        //% group="Separator"
        //% blockId=separator_set_image block="set %rtcModules(mySeparator) image to %img=screen_image_picker"
        //% weight=45 
        setImage(img: Image){
            this.sprite.setImage(img)
        }
    }

    //% blockNamespace=rtcModules color="#4682B4" blockGap=8
    class TimerComponent {
        private timesps:Sprite[];
        private numThemeMap:Image[]; 
        private timeKind:TimeType;
        private numspace:number = 1;
        private posX:number = 0;
        private posY:number = 0;
        constructor(type: TimeType = TimeType.SECONDS) {
            this.timeKind = type
            let n = type == TimeType.YEAR ? 4 : 2
            this.timesps = []
            this.numThemeMap = []
            this.numThemeMap.push(rtcModules.THEME1_NUM_0)
            this.numThemeMap.push(rtcModules.THEME1_NUM_1)
            this.numThemeMap.push(rtcModules.THEME1_NUM_2)
            this.numThemeMap.push(rtcModules.THEME1_NUM_3)
            this.numThemeMap.push(rtcModules.THEME1_NUM_4)
            this.numThemeMap.push(rtcModules.THEME1_NUM_5)
            this.numThemeMap.push(rtcModules.THEME1_NUM_6)
            this.numThemeMap.push(rtcModules.THEME1_NUM_7)
            this.numThemeMap.push(rtcModules.THEME1_NUM_8)
            this.numThemeMap.push(rtcModules.THEME1_NUM_9)
            for(let i = 0; i < n; i++){
                let sp =  sprites.create(img`
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                . . . . . . . . . . . . . . . . 
                `, SpriteKind.Player)
                sp.setImage(rtcModules.THEME1_NUM_0)    
                this.timesps.push(sp)
            }

            let timerstate: TimerState = game.currentScene().data[timerNamespace];

            // Register animation updates to fire when frames are rendered
            if (!timerstate) {
                timerstate = game.currentScene().data[timerNamespace] = {
                    timers: []
                } as TimerState;
            }

            timerstate.timers.push(this);

        }

        /**
         * Create a timer component to display time 
         * @param x horizontal position in pixels
         * @param y vertical position in pixels
         * @param space the space of the number, eg: 1
         */
        //% group="Basic"
        //% blockId=display_component_postion2 block="set %rtcModules(myTimerComponent) position to x %x y %y || with number space %space"
        //% weight=50
        //% x.shadow="positionPicker" y.shadow="positionPicker"
        displayTimerAtPosition(x:number,y:number,space:number = 1){
            let sp = this.timesps[0]

            let n = this.timeKind == TimeType.YEAR ? 4 : 2
            let width = n * (sp.width) + this.numspace * (n-1)
            let left = x - (width)/2
            let startLeft = left;
            sp.left = startLeft
            sp.y = y
            let top = sp.top
            this.numspace = space
            for(let i = 1; i < n; i++) {
                sp = this.timesps[i]
                sp.left = space + this.timesps[i-1].right
                sp.top = top
            }
            this.posX = x
            this.posY = y
        }


        /**
         * Sets the image on the sprite
         */
        //% group="Basic"
        //% blockId=timer_setnum_theme block="set %rtcModules(myTimerComponent) %themeicon image to %img=screen_image_picker"
        //% weight=45 
        //% blockHidden=1
        setThemeNumberImage(themeicon: TimerNumTheme = TimerNumTheme.NUM0, img: Image){
            if(this.numThemeMap){
                this.numThemeMap[themeicon] = img;
                let n = this.timeKind == TimeType.YEAR ? 4 : 2
                for(let i = 0; i < n; i++) {
                    let sp = this.timesps[i]
                    sp.setImage(img)
                }

                this.displayTimerAtPosition(this.posX,this.posY,this.numspace)
            } 
        }

        themeNumIcons(): Image[] {
            return this.numThemeMap;
        }

        //% group="Basic" blockSetVariable="myTimerComponent"
        //% blockCombine block="x"        
        get x():number{
            return this.posX
        }

        //% group="Basic" blockSetVariable="myTimerComponent"
        //% blockCombine block="y"
        get y():number{
            return this.posY
        }




        //% group="Theme" 
        //% blockId=timer_setnum_alltheme block="set %rtcModules(myTimerComponent) theme icons to $v=timer_theme"
        //% weight=45 
        //% blockHidden=1
        setThemeNumAllIcons(v: Image[]) {
            for(let i = 0; i < v.length;i++){
                this.numThemeMap[i] = v[i]
            }
            let sp;
            let img = this.numThemeMap[0]
            let n = this.timeKind == TimeType.YEAR ? 4 : 2
            for(let i = 0; i < n; i++) {
                sp = this.timesps[i]
                sp.setImage(img)
            }
            this.displayTimerAtPosition(this.posX,this.posY,this.numspace)
        }


        update(){
            switch(this.timeKind){
                case TimeType.SECONDS:
                    let seconds = rtcModules.readSeconds()
                    this.timesps[0].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Tens, seconds)])
                    this.timesps[1].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Units, seconds)])
                    break;
                case TimeType.MINUTE:
                    let miniutes = rtcModules.readMinutes()
                    this.timesps[0].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Tens, miniutes)])
                    this.timesps[1].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Units, miniutes)])
                    break;
                case TimeType.HOUR:
                    let hour = rtcModules.readHours()
                    this.timesps[0].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Tens, hour)])
                    this.timesps[1].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Units, hour)])
                    break;
                case TimeType.DATE:
                    let date = rtcModules.readDate()
                    this.timesps[0].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Tens, date)])
                    this.timesps[1].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Units, date)])
                    break;
                case TimeType.MONTH:
                    let month = rtcModules.readMonths()
                    this.timesps[0].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Tens, month)])
                    this.timesps[1].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Units, month)])
                    break;
                case TimeType.YEAR:
                    let year = rtcModules.readYear()
                    this.timesps[0].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Thousands, year)])
                    this.timesps[1].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Hundreds, year)])
                    this.timesps[2].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Tens, year)])
                    this.timesps[3].setImage(this.numThemeMap[rtcModules.readDigit(DigitsIndex.Units, year)])

                    break;  
            }
        }
    
    }


    //% blockNamespace=rtcModules color="#4682B4" blockGap=8
    class SevenSegDigit {
        private digit: Image;
        private digitSprite: Sprite;
        private _value: number;
        private thickness: SegmentStyle;
        private color: number;
        private scale: SegmentScale;
        private _x: number;
        private _y: number;
        private _radix: number;
        
        constructor(thickness: SegmentStyle = SegmentStyle.Thick, value: number = 0) {
            this._value = value;
            this.digit = image.create(16, 32);
            this.digitSprite = sprites.create(this.digit, 0);
            this._x = this.digitSprite.x
            this._y = this.digitSprite.y
            this.thickness = thickness;
            this.color = 2;
            this.scale = SegmentScale.Full;
            this._radix = DigitRadix.Decimal;
            rtcModules.drawDigit(this.digit, this.value, thickness, this.scale, this.color);
        }

        /**
         * Set the display value to a digit character: '0'- '9'
         * @param alphaChar the display value, eg: "0"
         */
        //% group="Digits"
        //% blockId=sevenseg_setalpha block="set %sevenseg(myDigit) display value to %alphaChar"
        //% weight=40
        setDigitAlpha(alphaChar: SegmentCharacter) {
            const matchChars = "0123456789ABCDEFHJLoPUY-°";
            if (alphaChar == this.value || alphaChar < 0 || alphaChar >= matchChars.length)
                return;
            this.value = alphaChar;
            rtcModules.drawDigit(this.digit, this.value, this.thickness, this.scale, this.color);
        }

        //% group="Digits" blockSetVariable="myDigit"
        //% blockCombine block="value" weight=90
        get value(): number {
            return this._value;
        }

        //% group="Digits" blockSetVariable="myDigit"
        //% blockCombine block="value" weight=90
        set value(value: number) {
            value = value | 0;
            if (value != this.value) {
                if (value >= 0 && value < this._radix) {
                    this._value = value;
                } else {
                    this._value = value % this._radix;
                }
                rtcModules.drawDigit(this.digit, this._value, this.thickness, this.scale, this.color);
            }
        }

        /**
         * Set the display digit color
         * @param color of the digit display, eg: 2
         */
        //% group="Digits"
        //% blockId=sevenseg_setcolor block="set %sevenseg(myDigit) display color to %color=colorindexpicker"
        //% weight=35
        setDigitColor(color: number): void {
            this.color = color;
            rtcModules.drawDigit(this.digit, this.value, this.thickness, this.scale, this.color);
        }

        //% group="Digits" blockSetVariable="myDigit"
        //% blockCombine block="x"
        get x(): number {
            return this.digitSprite.x;
        }

        //% group="Digits" blockSetVariable="myDigit"
        //% blockCombine block="x"
        set x(v: number) {
            this._x = v;
            this.digitSprite.x = v;
        }

        //% group="Digits" blockSetVariable="myDigit"
        //% blockCombine block="y"
        get y(): number {
            return this.digitSprite.y;
        }

        //% group="Digits" blockSetVariable="myDigit"
        //% blockCombine block="y"
        set y(v: number) {
            this._y = v;
            this.digitSprite.y = v;
        }

        //% group="Digits" blockSetVariable="myDigit"
        //% blockCombine block="height"
        get width(): number {
            return this.digitSprite.width;
        }

        //% group="Digits" blockSetVariable="myDigit"
        //% blockCombine block="height"
        get height(): number {
            return this.digitSprite.height;
        }

        /**
         * Set the display radix of the digit
         * @param radix of the digit display, eg: DigitRadix.Decimal
         */
        //% blockId=sevenseg_setradix block="set display radix of %sevenseg(myDigit) to %radix"
        //% group="Digits" weight=30
        setRadix(radix: DigitRadix) {
            this._radix = radix;
            rtcModules.drawDigit(this.digit, this.value, this.thickness, this.scale, this.color);
        }

        /**
         * Set the display digit size
         * @param scale of the digit display, eg: SegmentScale.Full
         */
        //% group="Digits"
        //% blockId=sevenseg_setdigitscale block="set %sevenseg(myDigit) to %scale size"
        //% weight=25
        setScale(scale: SegmentScale): void {
            if (scale != this.scale) {
                this.scale = scale;
                if (scale == SegmentScale.Full) {
                    this.digit = image.create(16, 32)
            } else {
                    this.digit = image.create(8, 16)
            }
            this.digitSprite.setImage(this.digit);
            this.digitSprite.x = this._x;
            this.digitSprite.y = this._y;
            rtcModules.drawDigit(this.digit, this.value, this.thickness,this.scale, this.color);
            }
        }
    }