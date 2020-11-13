speech.onSpeechRecognitionResult(function (result) {
    if (speech.speechRecognitionResultContainValue(result, "天气")) {
        speech.getJSON("https://api.seniverse.com/v3/weather/now.json?key=4nik0ivxfmxfjzz1&location=chongqing&language=zh-Hans&unit=c")
    }
})
speech.onNetworkResult(function (netResult) {
    myJsonObj = JsonParse.create(netResult)
    reslist = JsonParse.objectForKeyToArray(myJsonObj, "results")
    weatherJson = reslist[0]
    nowWeatherJson = JsonParse.objectForKeyToObject(weatherJson, "now")
    wtemp = JsonParse.objectForKeyToString(nowWeatherJson, "temperature")
    oneword = JsonParse.objectForKeyToString(nowWeatherJson, "text")
    playsound = "今天天气" + oneword + ", 温度" + wtemp + "摄氏度"
    speech.voiceSay(playsound)
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    speech.startVoiceInput()
})

controller.A.onEvent(ControllerButtonEvent.Released, function () {
    speech.speechRecognitionResult()
})
let playsound = ""
let oneword = ""
let wtemp = ""
let nowWeatherJson: object = null
let weatherJson: any = null
let reslist: any[] = []
let myJsonObj: object = null
let markHanzi = "天气晴阴转多云小中大雨雷电风东南西北温度"
let mySprite = sprites.create(img`
    . . . . . . . e e e e . . . . . 
    . . . . . e e 4 5 5 5 e e . . . 
    . . . . e 4 5 6 2 2 7 6 6 e . . 
    . . . e 5 6 6 7 2 2 6 4 4 4 e . 
    . . e 5 2 2 7 6 6 4 5 5 5 5 4 . 
    . e 5 6 2 2 8 8 5 5 5 5 5 4 5 4 
    . e 5 6 7 7 8 5 4 5 4 5 5 5 5 4 
    e 4 5 8 6 6 5 5 5 5 5 5 4 5 5 4 
    e 5 c e 8 5 5 5 4 5 5 5 5 5 5 4 
    e 5 c c e 5 4 5 5 5 4 5 5 5 e . 
    e 5 c c 5 5 5 5 5 5 5 5 4 e . . 
    e 5 e c 5 4 5 4 5 5 5 e e . . . 
    e 5 e e 5 5 5 5 5 4 e . . . . . 
    4 5 4 e 5 5 5 5 e e . . . . . . 
    . 4 5 4 5 5 4 e . . . . . . . . 
    . . 4 4 e e e . . . . . . . . . 
    `, SpriteKind.Player)
speech.wifiSetPassphrase("Jeff", "ljf202080720")
