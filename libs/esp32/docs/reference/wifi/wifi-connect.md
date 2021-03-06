# connect

Xtron Pro connect to Wi-Fi.

```sig
wifi.connect("", "")
```

Xtron Pro can connect to wifi.After the connection is successful, you can access the network.

## Parameters

* **name**: Wi-Fi name
* **password**: Wi-Fi password

### ~ hint

#### Password warning

Since the wifi password is not encrypted, please do not share your project with any strangers.

### ~

## Example #example

Connect to wifi.

```blocks
wifi.connect("name", "password")
```

## See also #seealso

[wifi isconnected](/reference/wifi/wifi-isconnected),
[get rssi](/reference/wifi/wifi-strength)
