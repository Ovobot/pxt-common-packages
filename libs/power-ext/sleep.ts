
const enum SleepConst {
    //% block="15 seconds"
    fifteenSeconds = 15,
    //% block="30 seconds"
    thirtySeconds = 30,
    //% block="1 minute"
    oneMinute = 60,
    //% block="2 minutes"
    twoMinutes = 120,
    //% block="5 minutes"
    fiveMinutes = 300,
    //% block="Never"
    never = -1
}
/**
 * sleep management
 */
//% advanced=true icon="\uf011" color="#898989"
//% weight=1 blockGap=8
namespace sleep {
    //% whenUsed=true
    const font = image.font8;
    //% whenUsed=true
    const PROMPT_LINE_SPACING = 2;
    // Pixels kept blank on left and right sides of prompt
    //% whenUsed=true
    const PROMPT_MARGIN_HORIZ = 3;
    //% whenUsed=true
    const INPUT_ROWS = 1;
    //% whenUsed=true
    const PADDING_VERTICAL = 4;
    //% whenUsed=true
    const NUM_LETTERS = 12;
    //% whenUsed=true
    const NUMPAD_ROW_LENGTH = 3;        
    //% whenUsed=true
    const CONTENT_HEIGHT = screen.height - PADDING_VERTICAL * 2; 
    //% whenUsed=true
    const NUM_ROWS = Math.ceil(NUM_LETTERS / NUMPAD_ROW_LENGTH);       
    // Dimensions of a "cell" that contains a letter
    //% whenUsed=true
    const CELL_HEIGHT = Math.floor(CONTENT_HEIGHT / (NUM_ROWS + 4));
    // Dimensions of area where text is input
    //% whenUsed=true
    const INPUT_HEIGHT = INPUT_ROWS * CELL_HEIGHT;
    // Dimensions of the bottom bar
    //% whenUsed=true
    const BOTTOM_BAR_NUMPAD_MARGIN = 4;
    //% whenUsed=true
    const BOTTOM_BAR_HEIGHT = PADDING_VERTICAL + BOTTOM_BAR_NUMPAD_MARGIN + CELL_HEIGHT;
    // Dimensions of the numpad area
    //% whenUsed=true
    const NUMPAD_HEIGHT = NUM_ROWS * CELL_HEIGHT;    
    //% whenUsed=true
    const NUMPAD_TOP = screen.height - NUMPAD_HEIGHT - BOTTOM_BAR_HEIGHT;
    //% whenUsed=true
    const NUMPAD_INPUT_MARGIN = 4;    
    //% whenUsed=true
    const INPUT_TOP = NUMPAD_TOP - INPUT_HEIGHT - NUMPAD_INPUT_MARGIN;
    //% whenUsed=true
    const PROMPT_WIDTH = screen.width - PROMPT_MARGIN_HORIZ * 2
    //% whenUsed=true
    const CONTENT_TOP = PADDING_VERTICAL;
    // Dimensions of prompt message area
    //% whenUsed=true
    const PROMPT_HEIGHT = INPUT_TOP - CONTENT_TOP;

    class PowerManager{
        theme: game.PromptTheme;
        screenDropSp:Sprite;
        sleepDropSp:Sprite;
        selectDropSp:Sprite;
        index:number;
        defaultSleepTime:number;
        defaultScreenSleepTime:number;
        sleepList:string[];
        sleepData:number[];
        droplist:DropSprite;
        isEditing:boolean;
        screenSleepIndex:number;
        deepSleepIndex:number;
        screenLabel:TextSprite;
        deepSleepLabel:TextSprite;

        constructor(theme?: game.PromptTheme) {
            // this.scanning = false;
            // this.apIndex = 0;
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
            this.index = 0;
            this.defaultSleepTime =  settings.readNumber("#deepsleep");
            this.defaultScreenSleepTime = settings.readNumber("#screensleep");
            if(this.defaultSleepTime == undefined)
                this.defaultSleepTime = 300000;
            if(this.defaultScreenSleepTime == undefined)
                this.defaultScreenSleepTime = -1;    
            this.sleepList = ["15 seconds","30 seconds","1 minute","2 minutes","5 minutes","Never"];
            this.sleepData = [15000,30000,60000,120000,300000,-1];
            this.screenSleepIndex = this.sleepData.indexOf(this.defaultScreenSleepTime);
            this.deepSleepIndex = this.sleepData.indexOf(this.defaultSleepTime);
            if(this.deepSleepIndex < 0) {
                this.deepSleepIndex = 4;
                settings.writeNumber("#deepsleep", 300000);
                power.setDeepSleepTimeout(300000);  
            }
        }

        main() {
            this.drawPromptText("Power Management");
            this.drawScreenPowerText("Screen");
            this.screenDropSp = sprites.create(img`
            1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 . . . . . . . . . 1 . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 1 . . . . . . . 1 1 . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 1 . . . . . 1 1 . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 1 . . . 1 1 . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 1 . 1 1 . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 1 1 . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
            `, SpriteKind.Player)
            this.screenDropSp.left = 15
            this.screenDropSp.y = CONTENT_TOP + Math.floor((PROMPT_HEIGHT - 16) / 2) + Math.floor(16 / 2) + 30; 
            this.drawSleepText("Sleep");
            this.sleepDropSp = sprites.create(img`
            1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 . . . . . . . . . 1 . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 1 . . . . . . . 1 1 . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 1 . . . . . 1 1 . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 1 . . . 1 1 . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 1 . 1 1 . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 1 1 . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1 
            1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
            `, SpriteKind.Player)
            this.sleepDropSp.left = 15
            this.sleepDropSp.y = CONTENT_TOP + Math.floor((PROMPT_HEIGHT - 16) / 2) + Math.floor(16 / 2) + 30+8+10+16;
            this.selectDropSp = sprites.create(img`
            3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3 
            3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 
            `, SpriteKind.Player)
            this.selectDropSp.left = 15
            this.selectDropSp.y = CONTENT_TOP + Math.floor((PROMPT_HEIGHT - 16) / 2) + Math.floor(16 / 2) + 30;
            this.screenLabel = textsprite.create(this.sleepList[this.screenSleepIndex]); 
            this.screenLabel.x = this.screenDropSp.x;
            this.screenLabel.y = this.screenDropSp.y;

            this.deepSleepLabel = textsprite.create(this.sleepList[this.deepSleepIndex]); 
            this.deepSleepLabel.x = this.sleepDropSp.x;
            this.deepSleepLabel.y = this.sleepDropSp.y;
            
            this.registerHandlers();

        }

        layoutText(message: string, width: number, height: number, color: number) {
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

        private drawPromptText(text:string) {
            const prompt = sprites.create(this.layoutText(text, PROMPT_WIDTH, PROMPT_HEIGHT, this.theme.colorPrompt), -1);
            prompt.x = screen.width / 2
            prompt.y = CONTENT_TOP + Math.floor((PROMPT_HEIGHT - prompt.height) / 2) + Math.floor(prompt.height / 2);
        }

        private drawScreenPowerText(text:string) {
            const prompt = sprites.create(this.layoutText(text, PROMPT_WIDTH, PROMPT_HEIGHT, this.theme.colorPrompt), -1);
            prompt.left = 15
            prompt.y = CONTENT_TOP + Math.floor((PROMPT_HEIGHT - prompt.height) / 2) + Math.floor(prompt.height / 2) + 15;    
        }

        private drawSleepText(text:string) {
            const prompt = sprites.create(this.layoutText(text, PROMPT_WIDTH, PROMPT_HEIGHT, this.theme.colorPrompt), -1);
            prompt.left = 15
            prompt.y = CONTENT_TOP + Math.floor((PROMPT_HEIGHT - prompt.height) / 2) + Math.floor(prompt.height / 2) + 30+8+10;    
        }

        private updateSelectIndex(up: boolean) {
            if(up) {
                if(this.index == 0) return;
                this.index--;
            } else {
                if(this.index == 1) return;
                this.index++;
            }
            switch(this.index){
                case 0:
                    this.selectDropSp.left = 15
                    this.selectDropSp.y = CONTENT_TOP + Math.floor((PROMPT_HEIGHT - 16) / 2) + Math.floor(16 / 2) + 30; 
                    break;
                case 1:
                    this.selectDropSp.left = this.sleepDropSp.left;
                    this.selectDropSp.y = this.sleepDropSp.y;
                    break;    
            }
        }


        private registerHandlers() {
            controller._setUserEventsEnabled(false);
            controller.up.onEvent(SYSTEM_KEY_DOWN, () => {
                if(this.isEditing) {
                    this.droplist.moveVertical(true);
                } else {
                    this.updateSelectIndex(true);
                }
            })

            controller.down.onEvent(SYSTEM_KEY_DOWN, () => {
                if(this.isEditing) {
                    this.droplist.moveVertical(false);
                } else {
                    this.updateSelectIndex(false);
                }
            })

            controller.A.onEvent(SYSTEM_KEY_UP, () => {
                if(!this.isEditing) {
                    this.isEditing = true;
                    if (this.index == 0) {
                        this.droplist = dropsprite.create(this.sleepList,this.screenSleepIndex,13,this.screenDropSp);   
                    } else {
                        this.droplist = dropsprite.create(this.sleepList,this.deepSleepIndex,13,this.sleepDropSp);   
                    }
                    this.droplist.show();
                } else {
                    this.droplist.savedrop();
                    if (this.index == 0) {
                        this.screenSleepIndex = this.droplist.currentIndex;
                        this.screenLabel.setText(this.sleepList[this.screenSleepIndex]);
                        this.screenLabel.x = this.screenDropSp.x;
                        this.isEditing = false; 
                        let time = this.sleepData[this.screenSleepIndex];
                        settings.writeNumber("#screensleep", time);
                        power.poke();
                        power.setScreenTimeout(time);  
                    } else {
                        this.deepSleepIndex = this.droplist.currentIndex;
                        this.deepSleepLabel.setText(this.sleepList[this.deepSleepIndex]);
                        this.deepSleepLabel.x = this.sleepDropSp.x;
                        this.isEditing = false; 
                        let time = this.sleepData[this.deepSleepIndex];
                        settings.writeNumber("#deepsleep", time);
                        power.poke();
                        power.setDeepSleepTimeout(time);  
                    }
                }
                
            });

           
            controller.B.onEvent(SYSTEM_KEY_DOWN, () => {
                if(this.isEditing) {
                    this.droplist.dismiss();
                    this.isEditing = false;
                } else {
                    game.popScene();
                    //controller._setUserEventsEnabled(true);
                }
            });
        }
    } 

    function powerSystemMenu() {
        //scene.systemMenu.closeMenu();
        game.pushScene();
        // game.consoleOverlay.setVisible(true);
        // console.log("WiFi configuration")
        const config = new PowerManager();
        config.main()
    }

    scene.systemMenu.addEntry(
        () => "Power",
        () => powerSystemMenu(),
        img`
    . . . . . 2 . 2 2 . 2 . . . . .
    . . . 2 2 2 . 2 2 . 2 2 2 . . .
    . . 2 2 2 . . 2 2 . . 2 2 2 . .
    . 2 2 2 . . . 2 2 . . . 2 2 2 .
    . 2 2 . . . . 2 2 . . . . 2 2 .
    2 2 . . . . . 2 2 . . . . . 2 2
    2 2 . . . . . 2 2 . . . . . 2 2
    2 2 . . . . . 2 2 . . . . . 2 2
    2 2 . . . . . 2 2 . . . . . 2 2
    2 2 . . . . . . . . . . . . 2 2
    2 2 . . . . . . . . . . . . 2 2
    . 2 2 . . . . . . . . . . 2 2 .
    . 2 2 2 . . . . . . . . 2 2 2 .
    . . 2 2 2 . . . . . . 2 2 2 . .
    . . . 2 2 2 2 2 2 2 2 2 2 . . .
    . . . . . 2 2 2 2 2 2 . . . . .
`);

}