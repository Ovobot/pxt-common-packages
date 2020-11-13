
//% weight=99 color="#CC33CC" icon="\uf1c0"
//% groups='["Create","Parse"]'
//% advanced=true
namespace JsonParse{


    /**
     * Create a jsonobject from a json string
     * @param jsonstr the json string
     */
    //% group="Create"
    //% blockId=jsonobjcreate block="Json string %jsonstr"
    //% expandableArgumentMode=toggle
    //% blockSetVariable=myJsonObj
    //% weight=100 
    export function create(jsonstr: string): object {
        const jsonobj = JSON.parse(jsonstr)
        return jsonobj
    }


    function objectForKey(jsonobj:any,mkey:string): any {
        return jsonobj[mkey];       
    }

    //% group="Parse"
    //% weight=60
    //% blockId=jsonobj_objectforkey_toarray block="$jsonobj=variables_get(myJsonObj) get array of key $mkey "
    export function objectForKeyToArray(jsonobj:any,mkey:string):Array<any> {
        return objectForKey(jsonobj,mkey)
    }

    //% group="Parse"
    //% weight=60
    //% blockId=jsonobj_objectforkey_toobj block="$jsonobj=variables_get(myJsonObj) get object of key $mkey "
    export function objectForKeyToObject(jsonobj:any,mkey:string):object {
        return objectForKey(jsonobj,mkey)
    }

    //% group="Parse"
    //% weight=60
    //% blockId=jsonobj_objectforkey_tostring block="$jsonobj=variables_get(myJsonObj) get string of key $mkey "
    export function objectForKeyToString(jsonobj:any,mkey:string):string {
        return objectForKey(jsonobj,mkey)
    }

    //% group="Parse"
    //% weight=60
    //% blockId=jsonobj_objectforkey_tonumber block="$jsonobj=variables_get(myJsonObj) get number of key $mkey "
    export function objectForKeyToNumber(jsonobj:any,mkey:string):number {
        return objectForKey(jsonobj,mkey)
    }
}