namespace codalJson {

    declare interface codalJsonObject {
        //% shim=CodalJsonMethods::getObjectItem
        getObjectItem(name:string):codalJsonObject;

        //% shim=CodalJsonMethods::getValueString
        getValueString(name: string): string;

        //% shim=CodalJsonMethods::getValueNumber
        getValueNumber(name: string):number;

        //% shim=CodalJsonMethods::getBooleanValue
        getBooleanValue(name: string):boolean;

        //% shim=CodalJsonMethods::hasObjectItem
        hasObjectItem(name: string):boolean;

        //% shim=CodalJsonMethods::getItemArraySize
        getItemArraySize():number;

        //% shim=CodalJsonMethods::getArrayItem
        getArrayItem(index:number):codalJsonObject;

        //% shim=CodalJsonMethods::clearData
        clear():void;
    }

    //% shim=codalJson::internalCreateJsonObject
    export declare function internalCreateJsonObject(json: string): codalJsonObject;

    export function parse(s: string) {
        let rootCJObj = internalCreateJsonObject(s);
        let newobj = new JsonObject(rootCJObj);
        return newobj;
    }

    //% blockNamespace=JsonParser color="#CC33CC" blockGap=8
    export class JsonObject {
        maincJobj:codalJsonObject
        constructor(cJobj:codalJsonObject) {
            this.maincJobj = cJobj;
        }

        //% group="Parse"
        //% weight=61
        //% blockId=jsonobj_hasName block="%JsonObject(myJsonObj) contains key $name "
        //% help=json/contains-key    
        containsKey(name:string):boolean {
            return this.maincJobj.hasObjectItem(name);
        }

        //% group="Parse"
        //% weight=60
        //% blockId=jsonobj_toobj block="%JsonObject(myJsonObj) get object of key $name "
        //% help=json/get-object            
        getObject(name:string):JsonObject {
            let newobj = new JsonObject(this.maincJobj.getObjectItem(name));
            return newobj;
        }

        //% group="Parse"
        //% weight=60
        //% blockId=jsonobj_tostring block="%JsonObject(myJsonObj) get string of key $name "
        //% help=json/get-string                    
        getValueString(name:string):string {
            return this.maincJobj.getValueString(name);
        }

        //% group="Parse"
        //% weight=60
        //% blockId=jsonobj_tonumber block="%JsonObject(myJsonObj) get number of key $name "
        //% help=json/get-number         
        getValueNumber(name:string):number {
            return this.maincJobj.getValueNumber(name);
        }

        //% group="Parse"
        //% weight=60
        //% blockId=jsonobj_tobool block="%JsonObject(myJsonObj) get bool of key $name "
        //% help=json/get-boolean         
        getValueBoolean(name:string):boolean {
            return this.maincJobj.getBooleanValue(name);
        }
 
        //% group="Parse"
        //% weight=60
        //% blockId=jsonobj_arrysize block="%JsonObject(myJsonObj) get array size "
        //% help=json/get-arraysize         
        getArraySize():number {
            return this.maincJobj.getItemArraySize();
        }

        //% group="Parse"
        //% weight=60
        //% blockId=jsonobj_arrayitem block="%JsonObject(myJsonObj) get array item at index $index"
        //% help=json/get-array-item         
        getArrayItem(index:number):JsonObject {
            let newobj = new JsonObject(this.maincJobj.getArrayItem(index));
            return newobj;
        }

        //% group="Lifecycle"
        //% blockId=jsonobj_destroy block="destroy %JsonObject(myJsonObj)"
        //% help=json/destroy         
        destroy() {
            this.maincJobj.clear()
            this.maincJobj = undefined
            let obj = this
            obj = null
        }
    }
}