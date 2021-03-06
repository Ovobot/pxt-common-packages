# create Json Object

Create json Object.

```blocks
let myJsonObj = JsonParser.create("{\"firstName\": \"John\",\"lastName\": \"Smith\",\"sex\": \"male\",\"age\": 25,\"phoneNumber\":[{\"type\": \"home\",\"number\": \"212 555-1234\"},{\"type\": \"fax\",\"number\": \"646 555-4567\"}]}")
```

## Parameters

* **jsonstr**: a valid json string

### ~ hint

#### JSON 

read https://en.wikipedia.org/wiki/JSON.

### ~

## Example #example

Write a test json string.

```blocks
let myJsonObj = JsonParser.create("{\"firstName\": \"John\",\"lastName\": \"Smith\",\"sex\": \"male\",\"age\": 25,\"phoneNumber\":[{\"type\": \"home\",\"number\": \"212 555-1234\"},{\"type\": \"fax\",\"number\": \"646 555-4567\"}]}")
myJsonObj.destroy()
```
### ~ hint

#### Work Only In Xtron Pro 

The example only supports running in Xtron Pro.

### ~

## See also #seealso

[get object](/reference/json/get-object),
[get boolean](/reference/json/get-boolean),
[get number](/reference/json/get-number),
[get string](/reference/json/get-string),
[contains key](/reference/json/contains-key),
[get array size](/reference/json/get-arraysize),
[get array item](/reference/json/get-array-item),
[destroy](/reference/json/destroy)