const nock = require('nock')
const config = require('./config.test.json')

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
  it('登録の確認', function () {
    const init = require('../index.js')
    let data

    homebridgeMock.registerAccessory.mockImplementationOnce(function (pluginName, platformName, constructor, dynamic) {
      data = {pluginName, platformName, constructor, dynamic}
    })
    init(homebridgeMock)

    expect(data.pluginName).toBe('homebridge-nature-remo-sensor')
    expect(data.platformName).toBe('remo-sensor')
    expect(data.constructor.name).toBe('NatureRemoSensor')
    expect(data.dynamic).toBe(true)
  })
  describe('NatureRemoSensorクラス', function () {
    afterAll(function () {
      nock.cleanAll()
    })
    const _create = (conf = {}) => {
      const init = require('../index.js')
      let data
      homebridgeMock.registerAccessory.mockImplementationOnce(function (pluginName, platformName, constructor, dynamic) {
        data = {pluginName, platformName, constructor, dynamic}
      })
      init(homebridgeMock)

      const log = jest.fn()
      return new data.constructor(log, conf)
    }
    it('コンストラクタ 設定あり', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[0])

      expect(natureRemoSensor.config).toBe(config.accessories[0])
      expect(natureRemoSensor.name).toBe('センサー')
      expect(natureRemoSensor.deviceName).toBe('リビングのRemo')
      expect(natureRemoSensor.schedule).toBe('*/10 * * * *')
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.accessToken).toBe('xxxxxxxxxxxxxxx')
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeDefined()
      expect(natureRemoSensor.temperatureSensorService).toBeDefined()
      expect(natureRemoSensor.lightSensorService).toBeDefined()
      expect(natureRemoSensor.job).toBeDefined()
    })
    it('コンストラクタ 設定あり（miniの場合）', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[2])

      expect(natureRemoSensor.config).toBe(config.accessories[2])
      expect(natureRemoSensor.name).toBe('センサー3(mini)')
      expect(natureRemoSensor.deviceName).toBe('リビングのRemo(mini)')
      expect(natureRemoSensor.schedule).toBe('*/10 * * * *')
      expect(natureRemoSensor.mini).toBe(true)
      expect(natureRemoSensor.accessToken).toBe('xxxxxxxxxxxxxxx')
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeNull()
      expect(natureRemoSensor.temperatureSensorService).toBeDefined()
      expect(natureRemoSensor.lightSensorService).toBeNull()
      expect(natureRemoSensor.job).toBeDefined()
    })
    it('コンストラクタ 設定あり（温度センサーのみ無効の場合）', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[3])

      expect(natureRemoSensor.config).toBe(config.accessories[3])
      expect(natureRemoSensor.name).toBe('センサー4(温度センサー無効)')
      expect(natureRemoSensor.deviceName).toBe('リビングのRemo(温度センサー無効)')
      expect(natureRemoSensor.schedule).toBe('*/10 * * * *')
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.accessToken).toBe('xxxxxxxxxxxxxxx')
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeDefined()
      expect(natureRemoSensor.temperatureSensorService).toBeNull()
      expect(natureRemoSensor.lightSensorService).toBeDefined()
      expect(natureRemoSensor.job).toBeDefined()
    })
    it('コンストラクタ 設定あり（湿度センサーのみ無効の場合）', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[4])

      expect(natureRemoSensor.config).toBe(config.accessories[4])
      expect(natureRemoSensor.name).toBe('センサー5(湿度センサー無効)')
      expect(natureRemoSensor.deviceName).toBe('リビングのRemo(湿度センサー無効)')
      expect(natureRemoSensor.schedule).toBe('*/10 * * * *')
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.accessToken).toBe('xxxxxxxxxxxxxxx')
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeNull()
      expect(natureRemoSensor.temperatureSensorService).toBeDefined()
      expect(natureRemoSensor.lightSensorService).toBeDefined()
      expect(natureRemoSensor.job).toBeDefined()
    })
    it('コンストラクタ 設定あり（照度センサーのみ無効の場合）', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[5])

      expect(natureRemoSensor.config).toBe(config.accessories[5])
      expect(natureRemoSensor.name).toBe('センサー6(照度センサー無効)')
      expect(natureRemoSensor.deviceName).toBe('リビングのRemo(照度センサー無効)')
      expect(natureRemoSensor.schedule).toBe('*/10 * * * *')
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.accessToken).toBe('xxxxxxxxxxxxxxx')
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeDefined()
      expect(natureRemoSensor.temperatureSensorService).toBeDefined()
      expect(natureRemoSensor.lightSensorService).toBeNull()
      expect(natureRemoSensor.job).toBeDefined()
    })
    it('コンストラクタ 設定なし', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      expect(natureRemoSensor.config).toEqual({})
      expect(natureRemoSensor.name).not.toBeDefined()
      expect(natureRemoSensor.deviceName).not.toBeDefined()
      expect(natureRemoSensor.schedule).toBe('*/5 * * * *')
      expect(natureRemoSensor.mini).toBe(false)
      expect(natureRemoSensor.accessToken).not.toBeDefined()
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeDefined()
      expect(natureRemoSensor.lightSensorService).toBeDefined()
      expect(natureRemoSensor.job).toBeDefined()
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
    it('getServices（miniの場合）', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[2])

      const services = natureRemoSensor.getServices()
      expect(services).toContain(natureRemoSensor.informationService)
      expect(services).toContain(natureRemoSensor.temperatureSensorService)
      expect(services.length).toBe(2)
    })
    it('getServices（温度センサーのみ無効の場合）', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[3])

      const services = natureRemoSensor.getServices()
      expect(services).toContain(natureRemoSensor.informationService)
      expect(services).toContain(natureRemoSensor.humiditySensorService)
      expect(services).toContain(natureRemoSensor.lightSensorService)
      expect(services.length).toBe(3)
    })
    it('getServices（湿度センサーのみ無効の場合）', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[4])

      const services = natureRemoSensor.getServices()
      expect(services).toContain(natureRemoSensor.informationService)
      expect(services).toContain(natureRemoSensor.temperatureSensorService)
      expect(services).toContain(natureRemoSensor.lightSensorService)
      expect(services.length).toBe(3)
    })
    it('getServices（照度センサーのみ無効の場合）', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[5])

      const services = natureRemoSensor.getServices()
      expect(services).toContain(natureRemoSensor.informationService)
      expect(services).toContain(natureRemoSensor.humiditySensorService)
      expect(services).toContain(natureRemoSensor.temperatureSensorService)
      expect(services.length).toBe(3)
    })
    it('getHumidity', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {hu: {val: 100}, te: {val: 35}, il: {val: 29.2}}}])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      natureRemoSensor.getHumidity((e, value) => {
        expect(value).toBe(100)
        done()
      })
    })
    it('getHumidity エラー', function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      natureRemoSensor.getHumidity((e, value) => {
        expect(e).toBeDefined()
        done()
      })
    })
    it('getTemperature', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {hu: {val: 100}, te: {val: 35}, il: {val: 29.2}}}])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      natureRemoSensor.getTemperature((e, value) => {
        expect(value).toBe(35)
        done()
      })
    })
    it('getTemperature エラー', function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      natureRemoSensor.getTemperature((e, value) => {
        expect(e).toBeDefined()
        done()
      })
    })
    it('getLight', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {hu: {val: 100}, te: {val: 35}, il: {val: 29.2}}}])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      natureRemoSensor.getLight((e, value) => {
        expect(value).toBe(29.2)
        done()
      })
    })
    it('getLight エラー', function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      natureRemoSensor.getLight((e, value) => {
        expect(e).toBeDefined()
        done()
      })
    })
    it('getTemperatureとgetHumidityとgetLightを同時実行', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {hu: {val: 100}, te: {val: 35}, il: {val: 29.2}}}])
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
        done()
      })
    })
    it('request deviceName 指定なし', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{name: '寝室のRemo', newest_events: {hu: {val: 100}, te: {val: 35}, il: {val: 29.2}}}, {name: 'リビングのRemo', newest_events: {hu: {val: 10}, te: {val: 1}, il: {val: 10}}}])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[1])

      natureRemoSensor.getHumidity((e, value) => {
        expect(value).toBe(100)
        done()
      })
    })
    it('request deviceName 指定あり', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{name: '寝室のRemo', newest_events: {hu: {val: 100}, te: {val: 35}, il: {val: 29.2}}}, {name: 'リビングのRemo', newest_events: {hu: {val: 10}, te: {val: 1}, il: {val: 10}}}])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[0])

      natureRemoSensor.getHumidity((e, value) => {
        expect(value).toBe(10)
        done()
      })
    })
    it('request レスポンス空', function (done) {
      nock(/.*/).get(/.*/).reply(200, '')
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[0])

      natureRemoSensor.getHumidity((e, value) => {
        expect(value).toBeDefined()
        done()
      })
    })
    it('request 温度湿度照度情報なし', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {}}])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[0])

      natureRemoSensor.getHumidity((e, value) => {
        expect(value).toBeDefined()
        done()
      })
    })
    it('onTick', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {}}])
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { conf.onTick() } } } })
      const natureRemoSensor = _create(config.accessories[0])

      setTimeout(() => {
        expect(natureRemoSensor.humiditySensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.lightSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        done()
      }, 400)
    })
    it('onTick（miniの場合）', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {}}])
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { conf.onTick() } } } })
      const natureRemoSensor = _create(config.accessories[2])

      setTimeout(() => {
        expect(natureRemoSensor.humiditySensorService).toBeNull()
        expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.lightSensorService).toBeNull()
        done()
      }, 400)
    })
    it('onTick（温度センサーのみ無効の場合）', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {}}])
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { conf.onTick() } } } })
      const natureRemoSensor = _create(config.accessories[3])

      setTimeout(() => {
        expect(natureRemoSensor.humiditySensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.temperatureSensorService).toBeNull()
        expect(natureRemoSensor.lightSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        done()
      }, 400)
    })
    it('onTick（湿度センサーのみ無効の場合）', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {}}])
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { conf.onTick() } } } })
      const natureRemoSensor = _create(config.accessories[4])

      setTimeout(() => {
        expect(natureRemoSensor.humiditySensorService).toBeNull()
        expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.lightSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        done()
      }, 400)
    })
    it('onTick（照度センサーのみ無効の場合）', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {}}])
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { conf.onTick() } } } })
      const natureRemoSensor = _create(config.accessories[5])

      setTimeout(() => {
        expect(natureRemoSensor.humiditySensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.lightSensorService).toBeNull()
        done()
      }, 400)
    })
    it('onTick request失敗', function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { conf.onTick() } } } })
      const natureRemoSensor = _create(config.accessories[0])

      setTimeout(() => {
        expect(natureRemoSensor.humiditySensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.lightSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        done()
      }, 400)
    })
    it('onTick request失敗（miniの場合）', function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { conf.onTick() } } } })
      const natureRemoSensor = _create(config.accessories[2])

      setTimeout(() => {
        expect(natureRemoSensor.humiditySensorService).toBeNull()
        expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.lightSensorService).toBeNull()
        done()
      }, 400)
    })
    it('onTick request失敗（温度センサーのみ無効の場合）', function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { conf.onTick() } } } })
      const natureRemoSensor = _create(config.accessories[3])

      setTimeout(() => {
        expect(natureRemoSensor.humiditySensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.temperatureSensorService).toBeNull()
        expect(natureRemoSensor.lightSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        done()
      }, 400)
    })
    it('onTick request失敗（湿度センサーのみ無効の場合）', function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { conf.onTick() } } } })
      const natureRemoSensor = _create(config.accessories[4])

      setTimeout(() => {
        expect(natureRemoSensor.humiditySensorService).toBeNull()
        expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.lightSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        done()
      }, 400)
    })
    it('onTick request失敗（照度センサーのみ無効の場合）', function (done) {
      nock(/.*/).get(/.*/).reply(500, {})
      jest.doMock('cron', () => { return { CronJob: function (conf) { this.start = () => { conf.onTick() } } } })
      const natureRemoSensor = _create(config.accessories[5])

      setTimeout(() => {
        expect(natureRemoSensor.humiditySensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.temperatureSensorService.getCharacteristic).toHaveBeenCalledTimes(1)
        expect(natureRemoSensor.lightSensorService).toBeNull()
        done()
      }, 400)
    })
  })
})
