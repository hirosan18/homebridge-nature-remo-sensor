const request = require('request')
const { CronJob } = require('cron')

const DEFAULT_REQUEST_PARAMS = {
  url: 'https://api.nature.global/1/devices',
  method: 'GET'
}

const TIMEOUT = 2500

const REGEX_TIMEOUT_ERROR_CODE = /E(?:SOCKET)?TIMEDOUT/

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
    this.mini = config.mini ?? false
    this.deviceName = config.deviceName
    this.accessToken = config.accessToken
    this.schedule = config.schedule || '*/5 * * * *'
    this.cache = config.cache ?? false

    this.previousSensorValue = null

    const sensors = config.sensors ?? {}
    const isEnabledTemperature = sensors.temperature !== false
    const isEnabledHumidity = this.mini !== true && sensors.humidity !== false
    const isEnabledLight = this.mini !== true && sensors.light !== false

    if (this.mini) {
      log('Humidity and light sensors are disabled in NatureRemo mini')
    }

    this.informationService = new Service.AccessoryInformation()
    this.temperatureSensorService = isEnabledTemperature ? new Service.TemperatureSensor(config.name) : null
    this.humiditySensorService = isEnabledHumidity ? new Service.HumiditySensor(config.name) : null
    this.lightSensorService = isEnabledLight ? new Service.LightSensor(config.name) : null

    this.job = new CronJob({
      cronTime: this.schedule,
      onTick: () => {
        this.log('> [Schedule]')
        this.request().then((data) => {
          this.previousSensorValue = this.parseResponseData(data)
          const { humidity, temperature, light } = this.previousSensorValue
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
          this.previousSensorValue = null
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

    this.getTemperature = this.createGetSensorFunc('temperature')
    this.getHumidity = this.createGetSensorFunc('humidity')
    this.getLight = this.createGetSensorFunc('light')
  }

  request (option) {
    if (!this.runningPromise) {
      this.runningPromise = new Promise((resolve, reject) => {
        const options = Object.assign({}, DEFAULT_REQUEST_PARAMS, {
          headers: {
            authorization: `Bearer ${this.accessToken}`
          }
        }, typeof option === 'object' ? option : {})

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

  createGetSensorFunc (type) {
    return (callback) => {
      this.log(`> [Getting] ${type}`)
      const previousSensorValue = this.previousSensorValue?.[type]
      if (this.cache && typeof previousSensorValue === 'number') {
        this.log(`>>> [Getting] ${type} => ${previousSensorValue} (from cache)`)
        callback(null, previousSensorValue)
      } else {
        this.request({ timeout: TIMEOUT }).then((data) => {
          const value = this.parseResponseData(data)?.[type]
          this.log(`>>> [Getting] ${type} => ${value}`)
          callback(null, value)
        }).catch((error) => {
          this.log(`>>> [Error] "${error}"`)
          if (REGEX_TIMEOUT_ERROR_CODE.test(error.code) && typeof previousSensorValue === 'number') {
            callback(null, previousSensorValue)
          } else {
            callback(error)
          }
        })
      }
    }
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
