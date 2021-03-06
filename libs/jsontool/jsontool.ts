
//% weight=99 color="#CC33CC" icon="\uf1c0"
//% groups='["Create","Parse", "Lifecycle"]'
//% advanced=true
namespace JsonParser{
    /**
     * Create a jsonobject from a json string
     * @param jsonstr the json string
     */
    //% group="Create"
    //% blockId=jsonparser_create block="Json string %jsonstr"
    //% blockSetVariable=myJsonObj
    //% weight=100 
    //% help=json/create         
    export function create(jsonstr: string): codalJson.JsonObject {
        const jsonObj = codalJson.parse(jsonstr)
        return jsonObj
    }
}