const request = require('request')
const { CronJob } = require('cron')

const DEFAULT_REQUEST_PARAMS = {
  url: 'https://api.nature.global/1/devices',
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
    this.mini = config.mini || false
    this.deviceName = config.deviceName
    this.accessToken = config.accessToken
    this.schedule = config.schedule || '*/5 * * * *'

    const sensors = config.sensors || {}
    const temperature = sensors.temperature !== false
    const humidity = this.mini !== true && sensors.humidity !== false
    const light = this.mini !== true && sensors.light !== false

    if (this.mini) {
      log('Humidity and light sensors are disabled in NatureRemo mini')
    }

    this.informationService = new Service.AccessoryInformation()
    this.temperatureSensorService = temperature ? new Service.TemperatureSensor(config.name) : null
    this.humiditySensorService = humidity ? new Service.HumiditySensor(config.name) : null
    this.lightSensorService = light ? new Service.LightSensor(config.name) : null

    this.job = new CronJob({
      cronTime: this.schedule,
      onTick: () => {
        this.log('> [Schedule]')
        this.request().then((data) => {
          const { humidity, temperature, light } = this.parseResponseData(data)
          if (this.temperatureSensorService) {
            this.log(`>>> [Update] temperature => ${temperature}`)
            this.temperatureSensorService.getCharacteristic(Characteristic.CurrentTemperature).updateValue(temperature)
          }
          if (this.humiditySensorService) {
            this.log(`>>> [Update] humidity => ${humidity}`)
            this.humiditySensorService.getCharacteristic(Characteristic.CurrentRelativeHumidity).updateValue(humidity)
          }
          if (this.lightSensorService) {
            this.log(`>>> [Update] light => ${light}`)
            this.lightSensorService.getCharacteristic(Characteristic.CurrentAmbientLightLevel).updateValue(light)
          }
        }).catch((error) => {
          this.log(`>>> [Error] "${error}"`)
          if (this.temperatureSensorService) {
            this.temperatureSensorService.getCharacteristic(Characteristic.CurrentTemperature).updateValue(error)
          }
          if (this.humiditySensorService) {
            this.humiditySensorService.getCharacteristic(Characteristic.CurrentRelativeHumidity).updateValue(error)
          }
          if (this.lightSensorService) {
            this.lightSensorService.getCharacteristic(Characteristic.CurrentAmbientLightLevel).updateValue(error)
          }
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
            authorization: `Bearer ${this.accessToken}`
          }
        })
        this.log('>> [request]')
        const req = request(options, (error, res, body) => {
          delete this.runningPromise
          const limit = res?.headers?.['x-rate-limit-limit'] ?? 0
          const remaining = res?.headers?.['x-rate-limit-remaining'] ?? 0
          this.log(`>>> [response] status: ${res?.statusCode ?? 'NONE'}, limit: ${remaining}/${limit}`)
          if (!error && res.statusCode === 200) {
            resolve(body)
          } else {
            reject(error || new Error(res.statusCode))
          }
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
    return { humidity, temperature, light }
  }

  getHumidity (callback) {
    this.log('> [Getting] humidity')
    this.request().then((data) => {
      const { humidity } = this.parseResponseData(data)
      this.log(`>>> [Getting] humidity => ${humidity}`)
      callback(null, humidity)
    }).catch((error) => {
      this.log(`>>> [Error] "${error}"`)
      callback(error)
    })
  }

  getTemperature (callback) {
    this.log('> [Getting] temperature')
    this.request().then((data) => {
      const { temperature } = this.parseResponseData(data)
      this.log(`>>> [Getting] temperature => ${temperature}`)
      callback(null, temperature)
    }).catch((error) => {
      this.log(`>>> [Error] "${error}"`)
      callback(error)
    })
  }

  getLight (callback) {
    this.log('> [Getting] light')
    this.request().then((data) => {
      const { light } = this.parseResponseData(data)
      this.log(`>>> [Getting] light => ${light}`)
      callback(null, light)
    }).catch((error) => {
      this.log(`>>> [Error] "${error}"`)
      callback(error)
    })
  }

  getServices () {
    this.log(`start homebridge Server ${this.name}`)

    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Nature')
      .setCharacteristic(Characteristic.Model, 'Remo')
      .setCharacteristic(Characteristic.SerialNumber, '031-45-154')

    const services = [this.informationService]

    if (this.temperatureSensorService) {
      this.temperatureSensorService
        .getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', this.getTemperature.bind(this))

      services.push(this.temperatureSensorService)
    }

    if (this.humiditySensorService) {
      this.humiditySensorService
        .getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .on('get', this.getHumidity.bind(this))

      services.push(this.humiditySensorService)
    }

    if (this.lightSensorService) {
      this.lightSensorService
        .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
        .on('get', this.getLight.bind(this))

      services.push(this.lightSensorService)
    }

    return services
  }
}
