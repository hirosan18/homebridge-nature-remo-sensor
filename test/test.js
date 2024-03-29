const nock = require('nock')
const config = require('./config.test.json')
const waitForExpect = require('wait-for-expect')

const homebridgeMock = {
  version: 'mock',
  hap: {
    Service: {
      HumiditySensor: function (name) {
        this.getCharacteristic = jest.fn().mockImplementation(function () {
          const ret = {
            on: jest.fn().mockImplementation(() => ret),
            updateValue: jest.fn()
          }
          return ret
        })
      },
      TemperatureSensor: function (name) {
        this.getCharacteristic = jest.fn().mockImplementation(function () {
          const ret = {
            on: jest.fn().mockImplementation(() => ret),
            updateValue: jest.fn()
          }
          return ret
        })
      },
      LightSensor: function (name) {
        this.getCharacteristic = jest.fn().mockImplementation(function () {
          const ret = {
            on: jest.fn().mockImplementation(() => ret),
            updateValue: jest.fn()
          }
          return ret
        })
      },
      AccessoryInformation: function () {
        this.setCharacteristic = jest.fn().mockReturnValue(this)
      }
    },
    Characteristic: jest.fn()
  },
  registerAccessory: jest.fn()
}

describe('NatureRemoSensor', function () {
  it('Confirmation of registration', function () {
    const init = require('../index.js')
    let data

    homebridgeMock.registerAccessory.mockImplementationOnce(function (pluginName, platformName, constructor, dynamic) {
      data = { pluginName, platformName, constructor, dynamic }
    })
    init(homebridgeMock)

    expect(data.pluginName).toBe('homebridge-nature-remo-sensor')
    expect(data.platformName).toBe('remo-sensor')
    expect(data.constructor.name).toBe('NatureRemoSensor')
    expect(data.dynamic).toBe(true)
  })
  describe('NatureRemoSensor Class', function () {
    afterEach(function () {
      jest.resetModules()
      nock.cleanAll()
    })
    const _create = (conf = {}) => {
      const originalRequest = jest.requireActual('axios')
      const mockRequest = jest.fn(function () {
        return originalRequest.apply(this, arguments)
      })
      jest.doMock('axios', () => { return mockRequest })

      const init = require('../index.js')
      let data
      homebridgeMock.registerAccessory.mockImplementationOnce(function (pluginName, platformName, constructor, dynamic) {
        data = { pluginName, platformName, constructor, dynamic }
      })
      init(homebridgeMock)

      const log = jest.fn()
      const natureRemoSensor = new data.constructor(log, conf)
      natureRemoSensor._spyRequestMethod = jest.spyOn(natureRemoSensor, 'request')
      natureRemoSensor._mockRequestModule = mockRequest

      return natureRemoSensor
    }
    it('Constructor (Config file available)', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[0])

      expect(natureRemoSensor.config).toBe(config.accessories[0])
      expect(natureRemoSensor.name).toBe('sensor')
      expect(natureRemoSensor.deviceName).toBe('Remo in living room')
      expect(natureRemoSensor.schedule).toBe('*/10 * * * *')
      expect(natureRemoSensor.cache).toBe(false)
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.accessToken).toBe('xxxxxxxxxxxxxxx')
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeDefined()
      expect(natureRemoSensor.temperatureSensorService).toBeDefined()
      expect(natureRemoSensor.lightSensorService).toBeDefined()
      expect(natureRemoSensor.job).toBeDefined()
      expect(natureRemoSensor.previousSensorValue).toBeNull()
    })
    it('Constructor (Config file available | When Remo is mini)', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[2])

      expect(natureRemoSensor.config).toBe(config.accessories[2])
      expect(natureRemoSensor.name).toBe('sensor3(mini)')
      expect(natureRemoSensor.deviceName).toBe('Remo in living room(mini)')
      expect(natureRemoSensor.schedule).toBe('*/10 * * * *')
      expect(natureRemoSensor.cache).toBe(false)
      expect(natureRemoSensor.mini).toBe(true)
      expect(natureRemoSensor.accessToken).toBe('xxxxxxxxxxxxxxx')
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeNull()
      expect(natureRemoSensor.temperatureSensorService).toBeDefined()
      expect(natureRemoSensor.lightSensorService).toBeNull()
      expect(natureRemoSensor.job).toBeDefined()
      expect(natureRemoSensor.previousSensorValue).toBeNull()
    })
    it('Constructor (Config file available | When only the temperature sensor is disabled)', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[3])

      expect(natureRemoSensor.config).toBe(config.accessories[3])
      expect(natureRemoSensor.name).toBe('sensor4(Temperature sensor disabled)')
      expect(natureRemoSensor.deviceName).toBe('Remo in living room(Temperature sensor disabled)')
      expect(natureRemoSensor.schedule).toBe('*/10 * * * *')
      expect(natureRemoSensor.cache).toBe(false)
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.accessToken).toBe('xxxxxxxxxxxxxxx')
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeDefined()
      expect(natureRemoSensor.temperatureSensorService).toBeNull()
      expect(natureRemoSensor.lightSensorService).toBeDefined()
      expect(natureRemoSensor.job).toBeDefined()
      expect(natureRemoSensor.previousSensorValue).toBeNull()
    })
    it('Constructor (Config file available | When only the humidity sensor is disabled)', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[4])

      expect(natureRemoSensor.config).toBe(config.accessories[4])
      expect(natureRemoSensor.name).toBe('sensor5(Humidity sensor disabled)')
      expect(natureRemoSensor.deviceName).toBe('Remo in living room(Humidity sensor disabled)')
      expect(natureRemoSensor.schedule).toBe('*/10 * * * *')
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.cache).toBe(false)
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.accessToken).toBe('xxxxxxxxxxxxxxx')
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeNull()
      expect(natureRemoSensor.temperatureSensorService).toBeDefined()
      expect(natureRemoSensor.lightSensorService).toBeDefined()
      expect(natureRemoSensor.job).toBeDefined()
      expect(natureRemoSensor.previousSensorValue).toBeNull()
    })
    it('Constructor (Config file available | When only the illuminance sensor is disabled)', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[5])

      expect(natureRemoSensor.config).toBe(config.accessories[5])
      expect(natureRemoSensor.name).toBe('sensor6(Illuminance sensor disabled)')
      expect(natureRemoSensor.deviceName).toBe('Remo in living room(Illuminance sensor disabled)')
      expect(natureRemoSensor.schedule).toBe('*/10 * * * *')
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.cache).toBe(false)
      expect(natureRemoSensor.accessToken).toBe('xxxxxxxxxxxxxxx')
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeDefined()
      expect(natureRemoSensor.temperatureSensorService).toBeDefined()
      expect(natureRemoSensor.lightSensorService).toBeNull()
      expect(natureRemoSensor.job).toBeDefined()
      expect(natureRemoSensor.previousSensorValue).toBeNull()
    })
    it('Constructor (Config file available | When Cache is true)', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[6])

      expect(natureRemoSensor.config).toBe(config.accessories[6])
      expect(natureRemoSensor.name).toBe('sensor7(Use Cache)')
      expect(natureRemoSensor.deviceName).toBe('Remo in living room(Use Cache)')
      expect(natureRemoSensor.schedule).toBe('*/10 * * * *')
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.cache).toBe(true)
      expect(natureRemoSensor.accessToken).toBe('xxxxxxxxxxxxxxx')
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeDefined()
      expect(natureRemoSensor.temperatureSensorService).toBeDefined()
      expect(natureRemoSensor.lightSensorService).toBeDefined()
      expect(natureRemoSensor.job).toBeDefined()
      expect(natureRemoSensor.previousSensorValue).toBeNull()
    })
    it('Constructor (No config file)', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      expect(natureRemoSensor.config).toEqual({})
      expect(natureRemoSensor.name).not.toBeDefined()
      expect(natureRemoSensor.deviceName).not.toBeDefined()
      expect(natureRemoSensor.schedule).toBe('*/5 * * * *')
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.cache).toBe(false)
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.accessToken).not.toBeDefined()
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeDefined()
      expect(natureRemoSensor.lightSensorService).toBeDefined()
      expect(natureRemoSensor.job).toBeDefined()
      expect(natureRemoSensor.previousSensorValue).toBeNull()
    })
    it('getServices', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      const services = natureRemoSensor.getServices()
      expect(services).toContain(natureRemoSensor.informationService)
      expect(services).toContain(natureRemoSensor.humiditySensorService)
      expect(services).toContain(natureRemoSensor.temperatureSensorService)
      expect(services).toContain(natureRemoSensor.lightSensorService)
      expect(services.length).toBe(4)
    })
    it('getServices (When Remo is mini)', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[2])

      const services = natureRemoSensor.getServices()
      expect(services).toContain(natureRemoSensor.informationService)
      expect(services).toContain(natureRemoSensor.temperatureSensorService)
      expect(services.length).toBe(2)
    })
    it('getServices (When only the temperature sensor is disabled)', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[3])

      const services = natureRemoSensor.getServices()
      expect(services).toContain(natureRemoSensor.informationService)
      expect(services).toContain(natureRemoSensor.humiditySensorService)
      expect(services).toContain(natureRemoSensor.lightSensorService)
      expect(services.length).toBe(3)
    })
    it('getServices (When only the humidity sensor is disabled)', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[4])

      const services = natureRemoSensor.getServices()
      expect(services).toContain(natureRemoSensor.informationService)
      expect(services).toContain(natureRemoSensor.temperatureSensorService)
      expect(services).toContain(natureRemoSensor.lightSensorService)
      expect(services.length).toBe(3)
    })
    it('getServices (When only the illuminance sensor is disabled)', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[5])

      const services = natureRemoSensor.getServices()
      expect(services).toContain(natureRemoSensor.informationService)
      expect(services).toContain(natureRemoSensor.humiditySensorService)
      expect(services).toContain(natureRemoSensor.temperatureSensorService)
      expect(services.length).toBe(3)
    })
    it('getHumidity', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: { hu: { val: 100 }, te: { val: 35 }, il: { val: 29.2 } } }])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      natureRemoSensor.getHumidity((e, value) => {
        expect(value).toBe(100)
        done()
      })
    })
    it('getHumidity (error)', function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      natureRemoSensor.getHumidity((e, value) => {
        expect(e).not.toBeNull()
        done()
      })
    })
    it('getTemperature', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: { hu: { val: 100 }, te: { val: 35 }, il: { val: 29.2 } } }])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      natureRemoSensor.getTemperature((e, value) => {
        expect(value).toBe(35)
        done()
      })
    })
    it('getTemperature (error)', function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      natureRemoSensor.getTemperature((e, value) => {
        expect(e).not.toBeNull()
        done()
      })
    })
    it('getLight', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: { hu: { val: 100 }, te: { val: 35 }, il: { val: 29.2 } } }])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      natureRemoSensor.getLight((e, value) => {
        expect(value).toBe(29.2)
        done()
      })
    })
    it('getLight (error)', function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      natureRemoSensor.getLight((e, value) => {
        expect(e).not.toBeNull()
        done()
      })
    })
    it('Execute getTemperature, getHumidity and getLight simultaneously', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: { hu: { val: 100 }, te: { val: 35 }, il: { val: 29.2 } } }])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })

      const natureRemoSensor = _create()

      const promise1 = new Promise(function (resolve) {
        natureRemoSensor.getHumidity((e, value) => {
          expect(value).toBe(100)
          resolve()
        })
      })
      const promise2 = new Promise(function (resolve) {
        natureRemoSensor.getTemperature((e, value) => {
          expect(value).toBe(35)
          resolve()
        })
      })
      const promise3 = new Promise(function (resolve) {
        natureRemoSensor.getLight((e, value) => {
          expect(value).toBe(29.2)
          resolve()
        })
      })

      Promise.all([promise1, promise2, promise3]).then(() => {
        expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(3)
        done()
      })
    })
    it('request (No deviceName specified)', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ name: '寝室のRemo', newest_events: { hu: { val: 100 } } }, { name: 'Remo in living room', newest_events: { hu: { val: 10 } } }])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[1])

      natureRemoSensor.getHumidity((e, value) => {
        expect(value).toBe(100)
        done()
      })
    })
    it('request (deviceName is specified)', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ name: '寝室のRemo', newest_events: { hu: { val: 100 } } }, { name: 'Remo in living room', newest_events: { hu: { val: 10 } } }])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[0])

      natureRemoSensor.getHumidity((e, value) => {
        expect(value).toBe(10)
        done()
      })
    })
    it('request (empty response)', function (done) {
      nock(/.*/).get(/.*/).reply(200, '')
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[0])

      natureRemoSensor.getHumidity((e, value) => {
        expect(value).toBeNull()
        done()
      })
    })
    it('request (No temperature, humidity, and illumination information)', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: {} }])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[0])

      natureRemoSensor.getHumidity((e, value) => {
        expect(value).toBeNull()
        done()
      })
    })
    it('request (Timeout - Delay the response)', function (done) {
      nock(/.*/).get(/.*/).delay(3000).reply(200, [{ newest_events: {} }])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[0])

      natureRemoSensor.getHumidity((e, value) => {
        expect(e.code).toMatch(/E(?:(?:SOCKET)?TIMEDOUT|CONNABORTED)/)
        done()
      })
    })
    it('request (Timeout - Delay the connection)', function (done) {
      nock(/.*/).get(/.*/).delayConnection(3000).reply(200, [{ newest_events: {} }])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[0])

      natureRemoSensor.getHumidity((e, value) => {
        expect(e.code).toMatch(/E(?:(?:SOCKET)?TIMEDOUT|CONNABORTED)/)
        done()
      })
    })
    it('request (Timeout - Has previousSensorValue)', function (done) {
      nock(/.*/).get(/.*/).delay(3000).reply(200, [{ newest_events: {} }])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[0])

      natureRemoSensor.previousSensorValue = { humidity: 20 }
      natureRemoSensor.getHumidity((e, value) => {
        expect(value).toBe(20)
        done()
      })
    })
    it('request (No Refresh and no previousSensorValue)', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: { hu: { val: 100 } } }])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[6])

      natureRemoSensor.getHumidity((e, value) => {
        expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
        expect(value).toBe(100)

        nock.cleanAll()
        nock(/.*/).get(/.*/).reply(200, [{ newest_events: { hu: { val: 20 } } }])
        natureRemoSensor.getHumidity((e, value) => {
          expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(2)
          expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(2)
          expect(value).toBe(20)
          done()
        })
      })
    })
    it('request (No Refresh and has previousSensorValue)', function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[6])

      natureRemoSensor.getHumidity((e, value) => {
        expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
        expect(e).not.toBeNull()

        natureRemoSensor.previousSensorValue = { humidity: 20 }
        natureRemoSensor.getHumidity((e, value) => {
          expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
          expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
          expect(value).toBe(20)
          done()
        })
      })
    })
    it('onTick', async function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: {} }])
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { setTimeout(conf.onTick, 0) } } } })

      const natureRemoSensor = _create(config.accessories[0])

      await waitForExpect(() => {
        expect(natureRemoSensor.log).toHaveBeenCalledWith('> [Schedule] finish')
      })

      expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.humiditySensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.lightSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      done()
    })
    it('onTick (When Remo is mini)', async function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: {} }])
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { setTimeout(conf.onTick, 0) } } } })
      const natureRemoSensor = _create(config.accessories[2])

      await waitForExpect(() => {
        expect(natureRemoSensor.log).toHaveBeenCalledWith('> [Schedule] finish')
      })

      expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.humiditySensorService).toBeNull()
      expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.lightSensorService).toBeNull()
      done()
    })
    it('onTick (When only the temperature sensor is disabled)', async function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: {} }])
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { setTimeout(conf.onTick, 0) } } } })
      const natureRemoSensor = _create(config.accessories[3])

      await waitForExpect(() => {
        expect(natureRemoSensor.log).toHaveBeenCalledWith('> [Schedule] finish')
      })

      expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.humiditySensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.temperatureSensorService).toBeNull()
      expect(natureRemoSensor.lightSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      done()
    })
    it('onTick (When only the humidity sensor is disabled)', async function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: {} }])
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { setTimeout(conf.onTick, 0) } } } })
      const natureRemoSensor = _create(config.accessories[4])

      await waitForExpect(() => {
        expect(natureRemoSensor.log).toHaveBeenCalledWith('> [Schedule] finish')
      })

      expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.humiditySensorService).toBeNull()
      expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.lightSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      done()
    })
    it('onTick (When only the illuminance sensor is disabled)', async function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: {} }])
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { setTimeout(conf.onTick, 0) } } } })
      const natureRemoSensor = _create(config.accessories[5])

      await waitForExpect(() => {
        expect(natureRemoSensor.log).toHaveBeenCalledWith('> [Schedule] finish')
      })

      expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.humiditySensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.lightSensorService).toBeNull()
      done()
    })
    it('onTick (request failed)', async function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { setTimeout(conf.onTick, 0) } } } })
      const natureRemoSensor = _create(config.accessories[0])

      await waitForExpect(() => {
        expect(natureRemoSensor.log).toHaveBeenCalledWith('> [Schedule] finish')
      })

      expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.humiditySensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.lightSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      done()
    })
    it('onTick (request failed | When Remo is mini)', async function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { setTimeout(conf.onTick, 0) } } } })
      const natureRemoSensor = _create(config.accessories[2])

      await waitForExpect(() => {
        expect(natureRemoSensor.log).toHaveBeenCalledWith('> [Schedule] finish')
      })

      expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.humiditySensorService).toBeNull()
      expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.lightSensorService).toBeNull()
      done()
    })
    it('onTick (request failed | When only the temperature sensor is disabled)', async function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { setTimeout(conf.onTick, 0) } } } })
      const natureRemoSensor = _create(config.accessories[3])

      await waitForExpect(() => {
        expect(natureRemoSensor.log).toHaveBeenCalledWith('> [Schedule] finish')
      })

      expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.humiditySensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.temperatureSensorService).toBeNull()
      expect(natureRemoSensor.lightSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      done()
    })
    it('onTick (request failed | When only the humidity sensor is disabled)', async function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { setTimeout(conf.onTick, 0) } } } })
      const natureRemoSensor = _create(config.accessories[4])

      await waitForExpect(() => {
        expect(natureRemoSensor.log).toHaveBeenCalledWith('> [Schedule] finish')
      })

      expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.humiditySensorService).toBeNull()
      expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.lightSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      done()
    })
    it('onTick (request failed | When only the illuminance sensor is disabled)', async function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { setTimeout(conf.onTick, 0) } } } })
      const natureRemoSensor = _create(config.accessories[5])

      await waitForExpect(() => {
        expect(natureRemoSensor.log).toHaveBeenCalledWith('> [Schedule] finish')
      })

      expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.humiditySensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
      expect(natureRemoSensor.lightSensorService).toBeNull()
      done()
    })
    it('request after onTick (Always Refresh)', async function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: { hu: { val: 100 }, te: { val: 35 }, il: { val: 29.2 } } }])
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { setTimeout(conf.onTick, 0) } } } })
      const natureRemoSensor = _create(config.accessories[0])

      await waitForExpect(() => {
        expect(natureRemoSensor.log).toHaveBeenCalledWith('> [Schedule] finish')
      })

      expect(natureRemoSensor.previousSensorValue).toEqual({ humidity: 100, temperature: 35, light: 29.2 })
      nock.cleanAll()
      nock(/.*/).get(/.*/).reply(500, {})
      natureRemoSensor.getHumidity((e, value) => {
        expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(2)
        expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(2)
        expect(e).not.toBeNull()
        done()
      })
    })
    it('request after onTick (No Refresh)', async function (done) {
      nock(/.*/).get(/.*/).reply(200, [{ newest_events: { hu: { val: 100 }, te: { val: 35 }, il: { val: 29.2 } } }])
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { setTimeout(conf.onTick, 0) } } } })
      const natureRemoSensor = _create(config.accessories[6])

      await waitForExpect(() => {
        expect(natureRemoSensor.log).toHaveBeenCalledWith('> [Schedule] finish')
      })

      expect(natureRemoSensor.previousSensorValue).toEqual({ humidity: 100, temperature: 35, light: 29.2 })
      nock.cleanAll()
      nock(/.*/).get(/.*/).reply(500, {})
      natureRemoSensor.getHumidity((e, value) => {
        expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(1)
        expect(value).toBe(100)
        done()
      })
    })

    it('Whether the operation continues after an error occurs.', function (done) {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[0])

      nock(/.*/).get(/.*/).replyWithError({ code: 'ECONNABORTEDs' })

      natureRemoSensor.getHumidity((e, value) => {
        expect(e.code).toMatch(/E(?:(?:SOCKET)?TIMEDOUT|CONNABORTED)/)

        nock.cleanAll()
        nock(/.*/).get(/.*/).reply(200, [{ newest_events: { hu: { val: 100 } } }])

        natureRemoSensor.getHumidity((e, value) => {
          expect(natureRemoSensor._mockRequestModule).toHaveBeenCalledTimes(2)
          expect(natureRemoSensor._spyRequestMethod).toHaveBeenCalledTimes(2)
          expect(value).toBe(100)
          done()
        })
      })
    })
  })
})
