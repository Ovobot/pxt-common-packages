#pragma once
#include "cJSON.h"
#include "pxtbase.h"

namespace codalJson {
    class CodalJsonObject {
        private:
            bool isRoot;
        public:
            cJSON *item;

        CodalJsonObject(const char *json) {
            this->isRoot = true;
            this->item = cJSON_Parse(json);
        }

        CodalJsonObject(cJSON *item) {
            this->isRoot = false;
            this->item = item;   
        }

        codalJsonObject getJsonObject(const char *name) {
            cJSON *temp = cJSON_GetObjectItem(this->item, name);
            auto cjobj = new CodalJsonObject(temp);
            return  cjobj;
        }

        String getValueString(const char* name) {
            cJSON *temp = cJSON_GetObjectItem(this->item, name);
            return mkStringCore(temp->valuestring);
        }

        double getNumberValue(const char* name) {
            cJSON *temp = cJSON_GetObjectItem(this->item, name);
            return temp->valuedouble;
        }

        bool getBooleanValue(const char* name) {
            cJSON *bool_json = cJSON_GetObjectItemCaseSensitive(this->item, name);
            if (cJSON_IsTrue(bool_json) == 0) {
                return false;
            } else {
                return true;    
            }
        }

        bool hasObjectItem(const char* name) {
            cJSON_bool contain = cJSON_HasObjectItem(this->item, name);
            if (contain == 0) {
                return false;
            } else {
                return true;    
            }
        }

        int getArraySize() {
            return cJSON_GetArraySize(this->item);
        }

        codalJsonObject getArrayItem(int index) {
            cJSON *temp = cJSON_GetArrayItem(this->item, index);
            auto cjobj = new CodalJsonObject(temp);
            return  cjobj;
        }

        void clear() {
            if(this->isRoot) {
                cJSON_Delete(this->item);
            }
        }
    };
    typedef CodalJsonObject *codalJsonObject;

}

