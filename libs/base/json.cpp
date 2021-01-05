#include "pxt.h"
#include "json.h"
#include "pxtbase.h"

using namespace codalJson;

namespace codalJson {
    //% 
    codalJsonObject internalCreateJsonObject(String json) {
        auto cJobj = new CodalJsonObject((const char*)json->getUTF8Data());
        return cJobj;
    }

}
