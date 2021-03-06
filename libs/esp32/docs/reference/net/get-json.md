# get Json

Get Json From a url.

```sig
net.getJson("")
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

[on network return result](/reference/net/on-network-return-result)
