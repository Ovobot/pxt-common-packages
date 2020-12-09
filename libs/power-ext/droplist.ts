class DropSprite {
    currentIndex:number;
    constructor(
        public childs:Sprite[],
        public bgchild:Sprite,
        public selectchild:Sprite,
        public parent:Sprite,
        public defaultIndex:number 
    ) {
        this.currentIndex = defaultIndex;
    }

    private update() {
        if(this.childs[this.currentIndex].y < 0 || this.childs[this.currentIndex].top < this.bgchild.top) {
            //is not in screen
            this.childs[this.currentIndex].setFlag(SpriteFlag.Invisible, false)
            for(let i = 0; i < this.childs.length; i++) {
                let child = this.childs[i];
                child.y += this.selectchild.height;
                if(child.bottom > this.bgchild.bottom) {
                    child.setFlag(SpriteFlag.Invisible, true)
                }
            }
            this.selectchild.y = this.childs[this.currentIndex].y;
        } else if(this.childs[this.currentIndex].bottom > screen.height) {
            //is not in screen
            this.childs[this.currentIndex].setFlag(SpriteFlag.Invisible, false)
            for(let i = 0; i < this.childs.length; i++) {
                let child = this.childs[i];
                child.y -= this.selectchild.height;
                if(child.y < 0 || child.top < this.bgchild.top) {
                    child.setFlag(SpriteFlag.Invisible, true)
                }
            }
            this.selectchild.y = this.childs[this.currentIndex].y;
        } else {
            if(!this.childs[this.currentIndex].__visible()) {
                this.childs[this.currentIndex].setFlag(SpriteFlag.Invisible, false)
                for(let i = 0; i < this.childs.length; i++) {
                    let child = this.childs[i];
                    child.y -= this.selectchild.height;
                    if(child.y < 0) {
                        child.setFlag(SpriteFlag.Invisible, true)
                    }
                }
            }
            this.selectchild.y = this.childs[this.currentIndex].y;
        }
    }

    public moveVertical(up: boolean) {
        if(up) {
            if(this.currentIndex == 0) return;
            this.currentIndex--;
        } else {
            if(this.currentIndex == this.childs.length - 1) return;
            this.currentIndex++;
        }
        this.update();
    }

    public show() {
        this.bgchild.setFlag(SpriteFlag.Invisible, false)
        this.selectchild.setFlag(SpriteFlag.Invisible, false)
        for(let i = 0; i < this.childs.length; i++) {
            let child = this.childs[i];
            child.setFlag(SpriteFlag.Invisible, false)
        }
    }

    public savedrop() {
        this.defaultIndex = this.currentIndex;
        this.childs[this.currentIndex].y = this.parent.y;
        this.dismiss();
    }

    get selectIndex() {
        return this.currentIndex;
    }

    public dismiss() {
        this.bgchild.destroy();
        this.selectchild.destroy();
        for(let i = 0; i < this.childs.length; i++) {
            let child = this.childs[i];
            child.destroy();
        }
    }
}

namespace dropsprite {
    export function create(list:string[],currentIndex:number,bg:number=0,parent:Sprite) {
        let itemHeight =  parent.height;
        let itemWidth =  parent.width;

        let sps = [];
        let rectimage = image.create(parent.width, itemHeight*list.length)
        let selimage = image.create(parent.width, itemHeight)
        selimage.fill(2);
        selimage.fillRect(1, 1, itemWidth - 1 * 2, itemHeight - 1 * 2, bg)
        rectimage.fill(bg)
        let bgsp = sprites.create(img`
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
            bgsp.setImage(rectimage)
        let selsp = sprites.create(img`
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
        selsp.setImage(selimage)      
        bgsp.setImage(rectimage)    
        bgsp.x = parent.x;
        selsp.x = parent.x;
        bgsp.setFlag(SpriteFlag.Invisible, true)
        selsp.setFlag(SpriteFlag.Invisible, true)
        for(let i = 0; i < list.length;i++) {
            let title = list[i];
            let textSprite = textsprite.create(title)
            //textSprite.setMaxFontHeight(itemHeight);
            textSprite.x = parent.x;
            if (i == currentIndex) {
                textSprite.y = parent.y;
            } else if (i < currentIndex){
                textSprite.y = parent.y - (currentIndex - i ) * itemHeight;
                textSprite.setFlag(SpriteFlag.Invisible, true)
            } else {
                textSprite.y = parent.y + (i - currentIndex ) * itemHeight;
                textSprite.setFlag(SpriteFlag.Invisible, true)
            }
            sps.push(textSprite);
        }
        bgsp.top = sps[0].y - itemHeight / 2;
        selsp.y = sps[currentIndex].y;
        // bgsp.z = sps[0].z - 1 ;
        let dpsp = new DropSprite(sps,bgsp,selsp,parent,currentIndex);
        return dpsp;
    }
}