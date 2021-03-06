# on Network Return Result

Network returns result.

```sig
net.onNetworkReturn(function (netResult) {
	
})
```

## Example #example

Get xmaker about info.

```blocks
game.consoleOverlay.setVisible(true)
wifi.connect("name", "password")
console.log("connecting")
while (!(wifi.isConnected())) {
    pause(100)
}
console.log("connected")
net.getJson("https://xmaker.ovobot.cc/api/md/arcade/about?targetVersion=1.3.3")
net.onNetworkReturn(function (netResult) {
    console.log(netResult)
})
```

## See also #seealso

[get json](/reference/net/get-json)
