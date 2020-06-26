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
    const motion = this.mini !== true && sensors.motion !== false

    if (this.mini) {
      log('Humidity, light and motion sensors are disabled in NatureRemo mini')
    }

    this.informationService = new Service.AccessoryInformation()
    this.temperatureSensorService = temperature ? new Service.TemperatureSensor(config.name) : null
    this.humiditySensorService = humidity ? new Service.HumiditySensor(config.name) : null
    this.lightSensorService = light ? new Service.LightSensor(config.name) : null
    this.motionSensorService = motion ? new Service.MotionSensor(config.name) : null

    this.job = new CronJob({
      cronTime: this.schedule,
      onTick: () => {
        this.log(`> [Schedule]`)
        this.request().then((data) => {
          let { humidity, temperature, light, motion } = this.parseResponseData(data)
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
          if (this.motionSensorService) {
            this.log(`>>> [Update] motion => ${motion}`)
            this.motionSensorService.getCharacteristic(Characteristic.MotionDetected).updateValue(motion)
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
          if (this.motionSensorService) {
            this.motionSensorService.getCharacteristic(Characteristic.MotionDetected).updateValue(error)
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
            'authorization': `Bearer ${this.accessToken}`
          }
        })
        this.log(`>> [request]`)
        const req = request(options, (error, res, body) => {
          delete this.runningPromise
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
    let motion = false

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
      if (data.newest_events.mo) {
        if (300000 > Date.now() - new Date(data.newest_events.mo.created_at))
        motion = true
      }
    }
    return { humidity, temperature, light, motion }
  }

  getHumidity (callback) {
    this.log(`> [Getting] humidity`)
    this.request().then((data) => {
      let { humidity } = this.parseResponseData(data)
      this.log(`>>> [Getting] humidity => ${humidity}`)
      callback(null, humidity)
    }).catch((error) => {
      this.log(`>>> [Error] "${error}"`)
      callback(error)
    })
  }
  getTemperature (callback) {
    this.log(`> [Getting] temperature`)
    this.request().then((data) => {
      let { temperature } = this.parseResponseData(data)
      this.log(`>>> [Getting] temperature => ${temperature}`)
      callback(null, temperature)
    }).catch((error) => {
      this.log(`>>> [Error] "${error}"`)
      callback(error)
    })
  }
  getLight (callback) {
    this.log(`> [Getting] light`)
    this.request().then((data) => {
      let { light } = this.parseResponseData(data)
      this.log(`>>> [Getting] light => ${light}`)
      callback(null, light)
    }).catch((error) => {
      this.log(`>>> [Error] "${error}"`)
      callback(error)
    })
  }
  getMotion (callback) {
    this.log(`> [Getting] motion`)
    this.request().then((data) => {
      let { motion } = this.parseResponseData(data)
      this.log(`>>> [Getting] motion => ${motion}`)
      callback(null, motion)
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

    let services = [this.informationService]

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

    if (this.motionSensorService) {
      this.motionSensorService
        .getCharacteristic(Characteristic.MotionDetected)
        .on('get', this.getMotion.bind(this))

      services.push(this.motionSensorService)
    }

    return services
  }
}
