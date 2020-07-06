
enum ThemeType {
    //% block="number"
    Number,
    //% block="colon"
    Colon,
    //% block="dash"
    Dash
}
namespace rtcModules{
    export class TimerTheme{
        public themeMap:Image[] = [THEME1_NUM_0,THEME1_NUM_1,THEME1_NUM_2,THEME1_NUM_3,
            THEME1_NUM_4,THEME1_NUM_5,THEME1_NUM_6,THEME1_NUM_7,THEME1_NUM_8,THEME1_NUM_9]; 
        constructor() {
                    
        }

        /**
        * Add an image to theme
        */
        //% blockId=addTheme
        //% block="add  $frame=screen_image_picker type $themeicon to $this=variables_get(theme)" 
        //% group="Theme"
        //% weight=40
        //% help=rtc/add-theme-num
        addTheme(themeicon: TimerNumTheme = TimerNumTheme.NUM0,frame: Image) {
            if(this.themeMap){
                this.themeMap[themeicon] = frame;
            } 
        }

    }

    /**
     * Create an theme
     */
    //% blockId=createTimerTheme
    //% block="create timer theme"
    //% group="Create"
    //% blockSetVariable="theme"
    //% weight=90
    export function createTimerTheme() {
        return new TimerTheme();
    }


    //% weight=25
    //% blockId=rtc_setThemes block="attach theme $values to timer $timer=variables_get(myTimerComponent)"
    //% values.shadow="lists_create_with"
    //% values.defl="screen_image_picker"
    //% group="Theme"
    export function setThemes(timer: TimerComponent, values: Image[]): void {
        timer.setThemeNumAllIcons(values)
    }

    /**
     * Attach an theme to a timer
     */
    //% blockId=attachTheme
    //% block="attach theme $set=variables_get(theme) to timer $timer=variables_get(myTimerComponent)"
    //% group="Theme"
    //% weight=30
    export function attachTheme(timer: TimerComponent, set: TimerTheme) {
        timer.setThemeNumAllIcons(set.themeMap)
    }
}