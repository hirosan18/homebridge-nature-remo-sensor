[![npm version](https://badge.fury.io/js/homebridge-nature-remo-sensor.svg)](https://badge.fury.io/js/homebridge-nature-remo-sensor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

# homebridge-nature-remo-sensor

Nature Remo plugin for homebridge: https://github.com/nfarina/homebridge

## feature

This is homebridge plugin to get NatureRemo sensor values with Siri and Homekit (Home app on iOS).

![temperature](./docs/temperature.gif)
![humidity](./docs/humidity.gif)


This plugin uses the "Nature Remo Cloud API" to get the temperature, humidity and illumination of NatureRemo.

Therefore, you need OAuth2 access token, which can be obtained from [home.nature.global](https://home.nature.global/).

＃ "Nature Remo Local API" doesn't have API to get temperature, humidity and illumination in v1.0.0, so this plugin uses "Nature Remo Cloud API".
＃ Also, the Home app doesn't seem to be able to create automation triggered by temperature, humidity, or illumination sensors (confirmed in iOS11).
＃ You can do this by using a third party app such as the Elgato Eve app (unconfirmed).


## Installation

```shell
npm install homebridge-nature-remo-sensor -g
```

## Configuration

### 1. Get Nature-Remo OAuth2 Access Token

Issue at [home.nature.global](https://home.nature.global/)

### 2. Set & Get Nature-Remo DeivceNickName from Remo app

Remo app → Setting → Remo → Name

![nickname1](./docs/nickname1.jpg)
![nickname2](./docs/nickname2.jpg)



### 3. Create the config.json file
```shell
$ vim ~/.homebridge/config.json
```

```js
{
  "bridge": {
    "name": "Homebridge",
    "username": "CC:22:3D:E3:CE:30",
    "port": 51826,
    "pin": "031-45-154"
  },
  "description": "Nature Remo Control",
  "accessories": [{
    "accessory": "remo-sensor",
    "name": "sensor",
    "deviceName": "<DeivceNickName>",
    "schedule": "*/5 * * * *",
    "cache": true,
    "accessToken": "<Get your access token at https://home.nature.global/>",
    "mini": false,
    "sensors": {
      "temperature": true,
      "humidity": true,
      "light": false
    }
  }]
}
```

Note:
* `schedule` is cron syntax
* `cache` If true, sensor value requests via Homebridge will return the value refreshed by the schedule (default false)
* `mini` must be `true` for Nature Remo mini
* `sensors` is optional
