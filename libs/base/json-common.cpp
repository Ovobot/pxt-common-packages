#include "pxt.h"
#include "json.h"

namespace CodalJsonMethods {
//%
codalJsonObject getObjectItem(codalJsonObject cJobj,String name)
{
    return cJobj->getJsonObject((const char*)name->getUTF8Data());
}

//%
String getValueString(codalJsonObject cJobj, String name)
{
    return cJobj->getValueString((const char*)name->getUTF8Data());
}

//%
TNumber getValueNumber(codalJsonObject cJobj, String name)
{
    return fromDouble(cJobj->getNumberValue((const char*)name->getUTF8Data()));
}

//%
TNumber getItemArraySize(codalJsonObject cJobj)
{
    return fromInt(cJobj->getArraySize());
}

//%
codalJsonObject getArrayItem(codalJsonObject cJobj, int index)
{
    return cJobj->getArrayItem(index);
}

//%
bool getBooleanValue(codalJsonObject cJobj, String name) 
{
    return cJobj->getBooleanValue((const char*)name->getUTF8Data());
}

//%
void clearData(codalJsonObject cJobj)
{
    cJobj->clear();
    delete cJobj;
}

} // namespace CodalJsonMethods
