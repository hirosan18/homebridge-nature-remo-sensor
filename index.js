const http = require('https')
const { CronJob } = require('cron')

const DEFAULT_REQUEST_PARAMS = {
  host: 'api.nature.global',
  path: '/1/devices',
  port: 443,
  method: 'GET'
}

let version
let Service
let Characteristic

module.exports = homebridge => {
  version = homebridge.version
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic

  homebridge.registerAccessory('homebridge-nature-remo-sensor', 'remo-sensor', NatureRemoSensor, true)
}

class NatureRemoSensor {
  constructor (log, config, api) {
    log('homebridge API version: ' + version)
    log('NatureRemo Init')
    this.log = log
    this.config = config
    this.name = config.name
    this.deviceName = config.deviceName
    this.accessToken = config.accessToken
    this.schedule = config.schedule || '*/5 * * * *'

    this.informationService = new Service.AccessoryInformation()
    this.humiditySensorService = new Service.HumiditySensor(config.name)
    this.temperatureSensorService = new Service.TemperatureSensor(config.name)
    this.lightSensorService = new Service.LightSensor(config.name)

    this.job = new CronJob({
      cronTime: this.schedule,
      onTick: () => {
        this.log(`> [Schedule]`)
        this.request().then((data) => {
          let {humidity, temperature, light} = this.parseResponseData(data)
          this.log(`>>> [Update] humidity => ${humidity}`)
          this.log(`>>> [Update] temperature => ${temperature}`)
          this.log(`>>> [Update] light => ${light}`)
          this.humiditySensorService.getCharacteristic(Characteristic.CurrentRelativeHumidity).updateValue(humidity)
          this.temperatureSensorService.getCharacteristic(Characteristic.CurrentTemperature).updateValue(temperature)
          this.lightSensorService.getCharacteristic(Characteristic.CurrentAmbientLightLevel).updateValue(light)
        }).catch((error) => {
          this.log(`>>> [Error] "${error}"`)
          this.humiditySensorService.getCharacteristic(Characteristic.CurrentRelativeHumidity).updateValue(error)
          this.temperatureSensorService.getCharacteristic(Characteristic.CurrentTemperature).updateValue(error)
          this.lightSensorService.getCharacteristic(Characteristic.CurrentAmbientLightLevel).updateValue(error)
        })
      },
      runOnInit: true
    })
    this.job.start()
  }
  request () {
    if (!this.runningPromise) {
      this.runningPromise = new Promise((resolve, reject) => {
        const options = Object.assign({}, DEFAULT_REQUEST_PARAMS, {
          headers: {
            'authorization': `Bearer ${this.accessToken}`
          }
        })
        let data = ''
        this.log(`>> [request]`)
        const req = http.request(options, res => {
          res.setEncoding('utf8')
          if (res.statusCode !== 200) {
            delete this.runningPromise
            reject(new Error(res.statusCode))
            return
          }
          res.on('data', chunk => {
            data += chunk.toString()
          })
          res.on('end', () => {
            delete this.runningPromise
            resolve(data)
          })
        })
        req.on('error', reject)
        req.end()
      })
    }
    return this.runningPromise
  }
  parseResponseData (response) {
    let humidity = null
    let temperature = null
    let light = null

    let data
    let json
    try {
      json = JSON.parse(response)
    } catch (e) {
      json = null
    }

    if (this.deviceName) {
      data = (json || []).find((device, i) => {
        return device.name === this.deviceName
      })
    }
    if (!data) {
      data = (json || [])[0]
    }
    if (data && data.newest_events) {
      if (data.newest_events.hu) {
        humidity = data.newest_events.hu.val
      }
      if (data.newest_events.te) {
        temperature = data.newest_events.te.val
      }
      if (data.newest_events.il) {
        light = data.newest_events.il.val
      }
    }
    return {humidity, temperature, light}
  }

  getHumidity (callback) {
    this.log(`> [Getting] humidity`)
    this.request().then((data) => {
      let {humidity} = this.parseResponseData(data)
      this.log(`>>> [Getting] humidity => ${humidity}`)
      callback(null, humidity)
    }).catch((error) => {
      callback(error)
    })
  }
  getTemperature (callback) {
    this.log(`> [Getting] temperature`)
    this.request().then((data) => {
      let {temperature} = this.parseResponseData(data)
      this.log(`>>> [Getting] temperature => ${temperature}`)
      callback(null, temperature)
    }).catch((error) => {
      callback(error)
    })
  }
  getLight (callback) {
    this.log(`> [Getting] light`)
    this.request().then((data) => {
      let {light} = this.parseResponseData(data)
      this.log(`>>> [Getting] light => ${light}`)
      callback(null, light)
    }).catch((error) => {
      callback(error)
    })
  }

  getServices () {
    this.log(`start homebridge Server ${this.name}`)

    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Nature')
      .setCharacteristic(Characteristic.Model, 'Remo')
      .setCharacteristic(Characteristic.SerialNumber, '031-45-154')

    this.humiditySensorService
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on('get', this.getHumidity.bind(this))

    this.temperatureSensorService
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', this.getTemperature.bind(this))

    this.lightSensorService
      .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
      .on('get', this.getLight.bind(this))

    return [this.informationService, this.humiditySensorService, this.temperatureSensorService, this.lightSensorService]
  }
}
