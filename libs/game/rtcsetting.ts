namespace scene.rtcSetting{
    let instance: rtcSettingScene;
    //% whenUsed=true
    const font = image.font8;
    //% whenUsed=true
    const PADDING_HORIZONTAL = 40;
    //% whenUsed=true
    const PADDING_VERTICAL = 4;
    //% whenUsed=true
    const PROMPT_LINE_SPACING = 2;

    //% whenUsed=true
    const NUM_LETTERS = 12;
    //% whenUsed=true
    const NUMPAD_ROW_LENGTH = 3;
    //% whenUsed=true
    const NUM_ROWS = Math.ceil(NUM_LETTERS / NUMPAD_ROW_LENGTH);
    //% whenUsed=true
    const INPUT_ROWS = 1;

    //% whenUsed=true
    const CONTENT_WIDTH = screen.width - PADDING_HORIZONTAL * 2;
    //% whenUsed=true
    const CONTENT_HEIGHT = screen.height - PADDING_VERTICAL * 2;
    //% whenUsed=true
    const CONTENT_TOP = PADDING_VERTICAL;

    // Dimensions of a "cell" that contains a letter
    //% whenUsed=true
    const CELL_HEIGHT = Math.floor(CONTENT_HEIGHT / (NUM_ROWS + 4));
    //% whenUsed=true
    const CELL_WIDTH = 10//Math.floor(CONTENT_WIDTH / NUMPAD_ROW_LENGTH);

    //% whenUsed=true
    const CELLDAY_WIDTH = 15;

    //% whenUsed=true
    const CELLDAY_HEIGHT = 10;


    //% whenUsed=true
    const LETTER_OFFSET_X = Math.floor((CELL_WIDTH - font.charWidth) / 2);
    //% whenUsed=true
    const LETTER_OFFSET_Y = Math.floor((CELL_HEIGHT - font.charHeight) / 2);
    //% whenUsed=true
    const BLANK_PADDING = 1;
    //% whenUsed=true
    const ROW_LEFT = PADDING_HORIZONTAL + CELL_WIDTH / 2 + Math.floor((CONTENT_WIDTH - (CELL_WIDTH * NUMPAD_ROW_LENGTH)) / 2);

    // Dimensions of the bottom bar
    //% whenUsed=true
    const BOTTOM_BAR_NUMPAD_MARGIN = 4;
    //% whenUsed=true
    const BOTTOM_BAR_HEIGHT = PADDING_VERTICAL + BOTTOM_BAR_NUMPAD_MARGIN + CELL_HEIGHT;
    //% whenUsed=true
    const BOTTOM_BAR_TOP = screen.height - BOTTOM_BAR_HEIGHT;
    //% whenUsed=true
    const BOTTOM_BAR_BUTTON_WIDTH = PADDING_HORIZONTAL * 2 + font.charWidth * 3;
    //% whenUsed=true
    const BOTTOM_BAR_TEXT_Y = (BOTTOM_BAR_HEIGHT - font.charHeight) / 2;
    //% whenUsed=true
    const BOTTOM_BAR_CONFIRM_X = (BOTTOM_BAR_BUTTON_WIDTH - font.charWidth * 2) / 2;

    // Dimensions of the numpad area
    //% whenUsed=true
    const NUMPAD_HEIGHT = NUM_ROWS * CELL_HEIGHT;
    //% whenUsed=true
    const NUMPAD_TOP = screen.height - NUMPAD_HEIGHT - BOTTOM_BAR_HEIGHT;
    //% whenUsed=true
    const NUMPAD_INPUT_MARGIN = 4;

    // Dimensions of area where text is input
    //% whenUsed=true
    const INPUT_HEIGHT = INPUT_ROWS * CELL_HEIGHT;
    //% whenUsed=true
    const INPUT_TOP = NUMPAD_TOP - INPUT_HEIGHT - NUMPAD_INPUT_MARGIN;

    // Pixels kept blank on left and right sides of prompt
    //% whenUsed=true
    const PROMPT_MARGIN_HORIZ = 3;

    // Dimensions of prompt message area
    //% whenUsed=true
    const PROMPT_HEIGHT = INPUT_TOP - CONTENT_TOP;
    //% whenUsed=true
    const PROMPT_WIDTH = screen.width - PROMPT_MARGIN_HORIZ * 2
    
    const confirmText = "OK";

    export class rtcSettingScene{
        theme: game.PromptTheme;
        private cursor: Sprite;
        private daycursor: Sprite;

        private numbers: Sprite[];
        private separators: Sprite[];
        private colons: Sprite[];

        private cursorRow: number;
        private cursorColumn: number;
        private confirmButton: Sprite;
        private inputs: Sprite[];
        private hmsinputs: Sprite[];
        private isEditing:boolean;
        answerLength: number;
        private blink: boolean;
        private frameCount: number;
        private inputIndex: number;
        private hmsinputIndex: number;

        private timeymdstr:string;
        private timehmsstr:string;
        private currentInputNum:number;
        private currentDay:string;
        private weekEN = ['MO', 'TU', 'WE', 'TH', 'FR', 'SR', 'SU'];

        constructor(theme?: game.PromptTheme) {
            if (theme) {
                this.theme = theme;
            }
            else {
                this.theme = {
                    colorPrompt: 1,
                    colorInput: 3,
                    colorInputHighlighted: 5,
                    colorInputText: 1,
                    colorAlphabet: 1,
                    colorCursor: 7,
                    colorBackground: 15,
                    colorBottomBackground: 3,
                    colorBottomText: 1,
                };
            }
            this.cursorRow = 0;
            this.cursorColumn = 0;
            this.answerLength = 8;//8
            this.inputIndex = 0;
            this.hmsinputIndex = -1;
            
            this.timeymdstr = this.initTimeFromRtc();//"19700101000000MO";
            this.timehmsstr = "000000";
            if(this.timeymdstr == undefined) {
                console.log("rtc error");
                this.timeymdstr = "19700101000000MO";//"19700101000000MO";
                this.currentInputNum = 1;
            } else {
                this.currentInputNum = parseInt(this.timeymdstr.substr(0,1));
            }
            // 
        }

    
        initTimeFromRtc() : string {
            pins.i2cWriteNumber(0x68, 0, NumberFormat.UInt8LE)
            let buf = pins.i2cReadBuffer(0x68, 7);
            let fmt:string = '';
            if(buf.length) {
                console.log(buf.length);
                let ye = buf.getUint8(6);
                let year = 2000 + (ye >> 4) * 10 + (ye & 0x0f);
                fmt = fmt + year;
                let mo = buf.getUint8(5);
                let data = (mo & 0x1f);
                let month = (data>>4)*10 + (data&0x0f);
                let monthstr = month >= 10 ? month.toString() : ('0' + month);
                fmt = fmt + monthstr;
                let dt = buf.getUint8(4);
                data = (dt & 0x3f);
                let date = (data>>4)*10 + (data&0x0f);
                let daystr = date >= 10 ? date.toString() : ('0' + date);
                fmt = fmt + daystr;

                let hours = 0;
                let res = buf.getUint8(2);
                data = (res & 0x7f);
                let flag12 =  data >> 6;
                if(flag12){
                    let getAMPM = (data &= (1<<5));
                    let data2 = (data & 0x1f);
                    hours = (data2>>4)*10 + (data&0x0f);
                } else {
                    let data2 = (data & 0x3f);
                    hours = (data2>>5)*20 + ((data & 0x1f)>>4)*10 + (data2&0x0f);
                }
                let hoursstr = hours >= 10 ? hours.toString() : ('0' + hours);
                fmt = fmt + hoursstr;
                res = buf.getUint8(1);
                data = (res & 0x7f);
                let minutes = (data>>4)*10 + (data&0x0f);
                let minutesstr = minutes >= 10 ? minutes.toString() : ('0' + minutes);
                fmt = fmt + minutesstr;
                res = buf.getUint8(0);
                data = (res & 0x7f);
                let seconds = (data>>4)*10 + (data&0x0f);
                let secondsstr = seconds >= 10 ? seconds.toString() : ('0' + seconds);
                fmt = fmt + secondsstr;
                let week = buf.getUint8(3);
                let weekstr =  this.weekEN[week - 1];
                fmt = fmt + weekstr;
                return fmt;
            }
            return "19700101000000MO";
        }

        show(){
            //let aa = game.askForNumber("", 4);
            this.draw();
            this.registerHandlers();
            // pause(3000)
            // scene.rtcSetting.closeSettingScene();
        }

        private draw() {
            this.drawPromptText("Set Time");
            this.drawInputarea();
            this.drawSeparator();
            //this.drawEditDayofWeekArea();
            this.drawColons();
            this.drawBottomBar();
        }

        private drawPromptText(text:string) {
            const prompt = sprites.create(layoutText(text, PROMPT_WIDTH, PROMPT_HEIGHT, this.theme.colorPrompt), -1);
            prompt.x = screen.width / 2
            prompt.y = CONTENT_TOP + Math.floor((PROMPT_HEIGHT - prompt.height) / 2) + Math.floor(prompt.height / 2);
        }

        private drawInputarea() {
            let answerLeft = (screen.width - (this.answerLength + 2) * CELL_WIDTH) / 2

            this.inputs = [];
            for (let i = 0; i < this.answerLength; i++) {
                const blank = image.create(CELL_WIDTH, CELL_HEIGHT);
                const letter = this.timeymdstr.substr(i, 1);
                this.drawInput(blank, letter, this.theme.colorInput,false);

                const s = sprites.create(blank, -1);
                if (i >= 6){
                    s.left = answerLeft + (i + 2) * CELL_WIDTH;
                } else if (i >= 4){
                    s.left = answerLeft + (i + 1) * CELL_WIDTH;
                } else {
                    s.left = answerLeft + i * CELL_WIDTH;
                }
                s.y = INPUT_TOP;
                this.inputs.push(s);
            }

            answerLeft = (screen.width - 8 * CELL_WIDTH) / 2
            for (let i = this.answerLength; i < this.answerLength + 6; i++) {
                const blank = image.create(CELL_WIDTH, CELL_HEIGHT);
                const letter = this.timeymdstr.substr(i, 1);
                this.drawInput(blank, letter, this.theme.colorInput,false);

                const s = sprites.create(blank, -1);
                if (i >= this.answerLength + 4){
                    s.left = answerLeft + (i + 2 - this.answerLength) * CELL_WIDTH;
                } else if (i >= this.answerLength + 2){
                    s.left = answerLeft + (i + 1 - this.answerLength) * CELL_WIDTH;
                } else {
                    s.left = answerLeft + (i - this.answerLength) * CELL_WIDTH;
                }
                s.y = INPUT_TOP  + CELL_HEIGHT + PADDING_VERTICAL;;
                this.inputs.push(s);
            }

            const blank = image.create(CELLDAY_WIDTH, CELL_HEIGHT);
            const letter = this.timeymdstr.substr(-2);
            this.currentDay = letter;
            this.drawInput(blank, letter, this.theme.colorInput,false);

            const s = sprites.create(blank, -1);
            
            s.y = INPUT_TOP  + 2* (CELL_HEIGHT + PADDING_VERTICAL);;
            this.inputs.push(s);
        }

        private drawColons(){
            const answerLeft = (screen.width - 8 * CELL_WIDTH) / 2
            this.colons = [];
            for (let j = 0; j < 2; j++) {
                const letter = image.create(CELL_WIDTH, CELL_HEIGHT);

                const t = sprites.create(letter, -1);
                if(j == 0){
                    t.left = answerLeft + 2 * CELL_WIDTH;
                } else {
                    t.left = answerLeft + 5 * CELL_WIDTH;
                }
                t.y = INPUT_TOP + CELL_HEIGHT + PADDING_VERTICAL;;

                this.colons.push(t);
            }
            
            const len = this.colons.length;
            for (let k = 0; k < len; k++) {
                const img = this.colons[k].image;
                img.fill(0);
                img.print(":", LETTER_OFFSET_X, LETTER_OFFSET_Y);
            }
        }

        private drawSeparator(){
            const answerLeft = (screen.width - (this.answerLength + 2) * CELL_WIDTH) / 2

            this.separators = [];
            for (let j = 0; j < 2; j++) {
                const letter = image.create(CELL_WIDTH, CELL_HEIGHT);

                const t = sprites.create(letter, -1);
                if(j == 0){
                    t.left = answerLeft + 4 * CELL_WIDTH;
                } else {
                    t.left = answerLeft + 7 * CELL_WIDTH;
                }
                t.y = INPUT_TOP;

                this.separators.push(t);
            }
            
            const len = this.separators.length;
            for (let k = 0; k < len; k++) {
                const img = this.separators[k].image;
                img.fill(0);
                img.print("-", LETTER_OFFSET_X, LETTER_OFFSET_Y);
            }
        }

        private drawInput(img: Image, char: string, color: number ,isblink:boolean) {
            img.fill(0);

            if(isblink){
                img.fillRect(BLANK_PADDING, CELL_HEIGHT - 1, CELL_WIDTH - BLANK_PADDING * 2, 1, color)
            }

            if (char) {
                img.print(char, LETTER_OFFSET_X, LETTER_OFFSET_Y, this.theme.colorInputText, font);
            }
        }

        private drawBottomBar() {
            const bg = image.create(screen.width, BOTTOM_BAR_HEIGHT);
            bg.fill(this.theme.colorBottomBackground);

            const bgSprite = sprites.create(bg, -1);
            bgSprite.x = screen.width / 2;
            bgSprite.y = BOTTOM_BAR_TOP + BOTTOM_BAR_HEIGHT / 2;
            bgSprite.z = -1;

            this.confirmButton = sprites.create(image.create(BOTTOM_BAR_BUTTON_WIDTH, BOTTOM_BAR_HEIGHT), -1);
            this.confirmButton.right = screen.width;
            this.confirmButton.y = BOTTOM_BAR_TOP + Math.ceil(BOTTOM_BAR_HEIGHT / 2);

            this.updateButtons();
        }

        private updateButtons() {
            if (this.inputIndex == this.answerLength+7) {
                this.confirmButton.image.fill(this.theme.colorCursor);
            }
            else {
                this.confirmButton.image.fill(this.theme.colorBottomBackground);
            }

            this.confirmButton.image.print(confirmText, BOTTOM_BAR_CONFIRM_X, BOTTOM_BAR_TEXT_Y);
        }

        private replaceStr(str:string, index:number, char:string){
            const strAry = str.split('');
            strAry[index] = char;
            return strAry.join('');
        }

        private changeNumber(){
            this.isEditing = true;
            this.currentInputNum = this.currentInputNum + 1 > 9 ? 0 : this.currentInputNum + 1;
            this.timeymdstr = this.replaceStr(this.timeymdstr,this.inputIndex,''+ this.currentInputNum);
            //this.timeymdstr = this.timeymdstr.substr(0, this.inputIndex) + this.currentInputNum + this.timeymdstr.substr(this.inputIndex + 1);
            this.isEditing = false;
        }

        private changeDayofWeek(){
            this.isEditing = true;
            let currentIndex = this.weekEN.indexOf(this.currentDay);
            if(currentIndex == 6){
                currentIndex = 0;
            } else {
                currentIndex++;
            }
            this.currentDay = this.weekEN[currentIndex];
            this.timeymdstr = this.timeymdstr.substr(0,this.timeymdstr.length-2) + this.currentDay;//this.replaceStr(this.timeymdstr,this.inputIndex,''+ this.currentInputNum);
            this.isEditing = false;
        }

        private changeEditInput(right:boolean){
            //this.changeInputIndex(1);
            this.blink = true;
            if(this.isEditing) return;
            if(right){
                if (this.inputIndex >= this.answerLength+6) {
                    // this.inputIndex = this.answerLength + 5;
                    // this.currentInputNum = parseInt(this.timeymdstr.substr(this.inputIndex,1));
    
                    // this.frameCount = 0
                    this.blink = false;
                    // this.updateSelectedInput();
                    
                    this.frameCount = 0;
                    
                    this.updateSelectedInput();
                    this.inputIndex = this.answerLength + 7;
                    this.cursorRow = 3
                    this.updateButtons();
                    return;
                }
                const u = this.inputs[this.inputIndex];
                const letter = this.timeymdstr.substr(this.inputIndex, 1);
                this.drawInput(u.image, letter, this.theme.colorInputHighlighted,false);
    
                this.inputIndex += 1;
                if(this.inputIndex < 8) {
                    this.cursorRow = 0
                } else if (this.inputIndex < 14) {
                    this.cursorRow = 1
                } else {
                    this.cursorRow = 2
                }
                this.currentInputNum = parseInt(this.timeymdstr.substr(this.inputIndex,1));

                this.frameCount = 0
                //this.updateSelectedInput();
            } else {
                if (this.inputIndex == 0){
                    this.cursorRow = 0
                    return;
                } else if (this.inputIndex == this.answerLength + 7){
                    this.inputIndex -= 1;
                    this.currentDay = this.timeymdstr.substr(-2);
        
                    this.frameCount = 0
                    this.updateSelectedInput();
                    this.updateButtons();
                    this.cursorRow = 2
                    return;
                } else if (this.inputIndex == 14){
                    const u = this.inputs[this.inputIndex];
                    const letter = this.timeymdstr.substr(-2);
                    this.drawInput(u.image, letter, this.theme.colorInputHighlighted,false);
        
                    this.inputIndex -= 1;
                    this.currentInputNum = parseInt(this.timeymdstr.substr(this.inputIndex,1));
    
                    this.frameCount = 0
                    this.cursorRow = 1
                    return;
                }
                const u = this.inputs[this.inputIndex];
                const letter = this.timeymdstr.substr(this.inputIndex, 1);
                this.drawInput(u.image, letter, this.theme.colorInputHighlighted,false);
    
                this.inputIndex -= 1;
                this.currentInputNum = parseInt(this.timeymdstr.substr(this.inputIndex,1));

                this.frameCount = 0
                if(this.inputIndex < 8) {
                    this.cursorRow = 0
                } else if (this.inputIndex < 14) {
                    this.cursorRow = 1
                } else {
                    this.cursorRow = 2
                }
               // this.updateSelectedInput();
            }

        }

        private isLeapYear (Year:number) {
            if (((Year % 4)==0) && ((Year % 100)!=0) || ((Year % 400)==0)) {
                return (true);
            } else { return (false); }
        }

        private bin2bcd(v:number)
        {
            return ((v / 10)<<4) + (v % 10);
        }
    

        private writeRtcTime(year:number,month:number,date:number,hour:number,minutes:number,seconds:number,day:number){
            let buf = pins.createBuffer(8);
            buf[0] = 0x00;
            buf[1] = this.bin2bcd(seconds);
            buf[2] = this.bin2bcd(minutes);
            buf[3] = this.bin2bcd(hour);
            buf[4] = this.bin2bcd(day);
            buf[5] = this.bin2bcd(date);   
            buf[6] = this.bin2bcd(month);  
            buf[7] = this.bin2bcd(year);      
            let result = pins.i2cWriteBuffer(0x68, buf);
            console.log("rtc write result:" + result);
        }

        private confirm() {
            let year = parseInt(this.timeymdstr.substr(0,4));
            let month = parseInt(this.timeymdstr.substr(4,2));
            let date = parseInt(this.timeymdstr.substr(6,2));
            let hour = parseInt(this.timeymdstr.substr(8,2));
            let minute = parseInt(this.timeymdstr.substr(10,2));
            let seconds = parseInt(this.timeymdstr.substr(12,2));
            let day = this.weekEN.indexOf(this.currentDay) + 1;
            if(year >= 2000) year -= 2000;
            this.writeRtcTime(year,month,date,hour,minute,seconds,day);
            scene.rtcSetting.closeSettingScene();
        }

        private moveVertical(up: boolean) {
            this.blink = true;
            if (up) {
                if (this.cursorRow === 3) {
                    this.cursorRow -= 1;
                    if (this.inputIndex == this.answerLength + 7){
                        this.inputIndex = 14;
                        this.currentDay = this.timeymdstr.substr(-2);
            
                        this.frameCount = 0
                        this.updateSelectedInput();
                        this.updateButtons();
                        return;
                    }

                }
                else {
                    this.cursorRow = Math.max(0, this.cursorRow - 1);

                    if (this.inputIndex == 14) {
                        const u = this.inputs[this.inputIndex];
                        const letter = this.timeymdstr.substr(-2);
                        this.drawInput(u.image, letter, this.theme.colorInputHighlighted,false);
            
                        this.inputIndex = 10
                        this.currentInputNum = parseInt(this.timeymdstr.substr(this.inputIndex,1));
        
                        this.frameCount = 0
                        return
                    } else if (this.inputIndex < 14 && this.inputIndex > 7) {
                        const u = this.inputs[this.inputIndex];
                        const letter = this.timeymdstr.substr(this.inputIndex, 1);
                        this.drawInput(u.image, letter, this.theme.colorInputHighlighted,false);
                        if(this.inputIndex == 8) {
                            this.inputIndex = 0
                        } else if(this.inputIndex == 9){
                            this.inputIndex = 2
                        } else {
                            this.inputIndex -= 6
                        } 
                    }
                    this.currentInputNum = parseInt(this.timeymdstr.substr(this.inputIndex,1));
                    this.frameCount = 0
                }
            }
            else {
                this.cursorRow = Math.min(3, this.cursorRow + 1);
                if(this.inputIndex == this.answerLength + 7) return;
                const u = this.inputs[this.inputIndex];
                const letter = this.timeymdstr.substr(this.inputIndex, 1);
                this.drawInput(u.image, letter, this.theme.colorInputHighlighted,false);
    
                if(this.inputIndex < 2) {
                    this.inputIndex = 8
                } else if (this.inputIndex < 4) {
                    this.inputIndex = 9
                } else if (this.inputIndex < 8) {
                    this.inputIndex = this.inputIndex + 6
                } else if (this.inputIndex < 14) {
                    this.inputIndex = 14
                } else {
                    this.blink = false;
                    
                    this.frameCount = 0;
                    
                    this.updateSelectedInput();
                    this.inputIndex = this.answerLength + 7;
                    this.updateButtons();
                    return;
                }
                this.currentInputNum = parseInt(this.timeymdstr.substr(this.inputIndex,1));
                this.frameCount = 0
            }

        }

        private registerHandlers() {
            controller._setUserEventsEnabled(false);
            controller.up.onEvent(SYSTEM_KEY_DOWN, () => {
                this.moveVertical(true);
            })

            controller.down.onEvent(SYSTEM_KEY_DOWN, () => {
                this.moveVertical(false);
            })

            controller.right.onEvent(SYSTEM_KEY_DOWN, () => {
                this.changeEditInput(true);
            });

            controller.left.onEvent(SYSTEM_KEY_DOWN, () => {
                this.changeEditInput(false);
            });

            controller.A.onEvent(SYSTEM_KEY_DOWN, () => {
                if(this.inputIndex == this.answerLength + 7){
                    //this.confirm();//call this scene again 
                } else if(this.inputIndex == this.answerLength + 6){
                    this.changeDayofWeek();
                } else {
                    this.changeNumber();
                }
            });

            controller.A.onEvent(SYSTEM_KEY_UP, () => {
                if(this.inputIndex == this.answerLength + 7){
                    this.confirm();
                } 
                
            });

            controller.B.onEvent(SYSTEM_KEY_DOWN, () => {
                //this.delete();
                scene.rtcSetting.closeSettingScene();
            });


            this.frameCount = 0;
            this.blink = true;

            game.onUpdate(() => {
                this.frameCount = (this.frameCount + 1) % 30;

                if (this.frameCount === 0) {
                    this.blink = !this.blink;
                }
                this.updateSelectedInput();
            })
        }

        private updateSelectedInput() {
            if(this.isEditing) return;
            if (this.inputIndex < this.answerLength + 6) {
                const u = this.inputs[this.inputIndex];
                //const letter = this.timeymdstr.substr(this.inputIndex, 1);
                // console.log("index:"+ this.inputIndex);
                // console.log('letter:' + letter);
                // console.log('timeymdstr:' +  this.timeymdstr);

                if (this.blink) {
                    this.drawInput(u.image, '' + this.currentInputNum , this.theme.colorInput,true);
                }
                else {
                    this.drawInput(u.image, '' + this.currentInputNum , this.theme.colorInputHighlighted,false);
                }
            } else if (this.inputIndex == this.answerLength + 6){
                const u = this.inputs[this.inputIndex];
                if (this.blink) {
                    this.drawInput(u.image, this.currentDay , this.theme.colorInput,true);
                }
                else {
                    this.drawInput(u.image, this.currentDay , this.theme.colorInputHighlighted,false);
                }
            }
        }

    }


    function layoutText(message: string, width: number, height: number, color: number) {
        const lineHeight = font.charHeight + PROMPT_LINE_SPACING;

        const lineLength = Math.floor(width / font.charWidth);
        const numLines = Math.floor(height / lineHeight);

        let lines: string[] = [];
        let word: string;
        let line: string;

        let pushWord = () => {
            if (line) {
                if (line.length + word.length + 1 > lineLength) {
                    lines.push(line);
                    line = word;
                }
                else {
                    line = line + " " + word;
                }
            }
            else {
                line = word;
            }

            word = null;
        }

        for (let l = 0; l < message.length; l++) {
            const char = message.charAt(l);

            if (char === " ") {
                if (word) {
                    pushWord();
                }
                else {
                    word = " ";
                }
            }
            else if (!word) {
                word = char;
            }
            else {
                word += char;
            }
        }

        if (word) {
            pushWord();
        }

        if (line) {
            lines.push(line);
        }

        let maxLineWidth = 0;
        for (let m = 0; m < lines.length; m++) {
            maxLineWidth = Math.max(maxLineWidth, lines[m].length);
        }

        const actualWidth = maxLineWidth * font.charWidth;
        const actualHeight = lines.length * lineHeight;

        const res = image.create(actualWidth, actualHeight);

        for (let n = 0; n < lines.length; n++) {
            if ((n + 1) > numLines) break;
            res.print(lines[n], 0, n * lineHeight, color, font);
        }

        return res;
    }

    export function showRtcSettingScene() {
        if (instance) return;
        //
        game.pushScene();
        controller._setUserEventsEnabled(false);
        instance = new rtcSettingScene();
        instance.show();
    }

    export function closeSettingScene() {
        if (instance) {
            instance = undefined;
        }
        //controller._setUserEventsEnabled(true);

        game.popScene();

    }
}