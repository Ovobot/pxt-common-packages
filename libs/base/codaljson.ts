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
        //% weight=60
        //% blockId=jsonobj_toobj block="%JsonObject(myJsonObj) get object of key $name "
        getObject(name:string):JsonObject {
            let newobj = new JsonObject(this.maincJobj.getObjectItem(name));
            return newobj;
        }

        //% group="Parse"
        //% weight=60
        //% blockId=jsonobj_tostring block="%JsonObject(myJsonObj) get string of key $name "
        getValueString(name:string):string {
            return this.maincJobj.getValueString(name);
        }

        //% group="Parse"
        //% weight=60
        //% blockId=jsonobj_tonumber block="%JsonObject(myJsonObj) get number of key $name "
        getValueNumber(name:string):number {
            return this.maincJobj.getValueNumber(name);
        }

        //% group="Parse"
        //% weight=60
        //% blockId=jsonobj_tobool block="%JsonObject(myJsonObj) get bool of key $name "
        getValueBoolean(name:string):boolean {
            return this.maincJobj.getBooleanValue(name);
        }

        //% group="Parse"
        //% weight=60
        //% blockId=jsonobj_arrysize block="%JsonObject(myJsonObj) get array size "
        getItemArraySize():number {
            return this.maincJobj.getItemArraySize();
        }

        //% group="Parse"
        //% weight=60
        //% blockId=jsonobj_arrayitem block="%JsonObject(myJsonObj) get array item at index $index"
        getArrayItem(index:number):JsonObject {
            let newobj = new JsonObject(this.maincJobj.getArrayItem(index));
            return newobj;
        }

        //% group="Lifecycle"
        //% blockId=jsonobj_destroy block="destroy %JsonObject(myJsonObj)"
        destroy() {
            this.maincJobj.clear()
            this.maincJobj = undefined
            let obj = this
            obj = null
        }
    }
}