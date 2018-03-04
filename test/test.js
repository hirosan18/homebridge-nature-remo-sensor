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
      expect(natureRemoSensor.accessToken).toBe('xxxxxxxxxxxxxxx')
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeDefined()
      expect(natureRemoSensor.temperatureSensorService).toBeDefined()
      expect(natureRemoSensor.job).toBeDefined()
    })
    it('コンストラクタ 設定なし', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      expect(natureRemoSensor.config).toEqual({})
      expect(natureRemoSensor.name).not.toBeDefined()
      expect(natureRemoSensor.deviceName).not.toBeDefined()
      expect(natureRemoSensor.schedule).toBe('*/5 * * * *')
      expect(natureRemoSensor.accessToken).not.toBeDefined()
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeDefined()
      expect(natureRemoSensor.temperatureSensorService).toBeDefined()
      expect(natureRemoSensor.job).toBeDefined()
    })
    it('コンストラクタ 設定なし', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      expect(natureRemoSensor.config).toEqual({})
      expect(natureRemoSensor.name).not.toBeDefined()
      expect(natureRemoSensor.deviceName).not.toBeDefined()
      expect(natureRemoSensor.schedule).toBe('*/5 * * * *')
      expect(natureRemoSensor.accessToken).not.toBeDefined()
      expect(natureRemoSensor.informationService).toBeDefined()
      expect(natureRemoSensor.humiditySensorService).toBeDefined()
      expect(natureRemoSensor.temperatureSensorService).toBeDefined()
      expect(natureRemoSensor.job).toBeDefined()
    })
    it('getServices', function () {
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create()

      const services = natureRemoSensor.getServices()
      expect(services).toContain(natureRemoSensor.informationService)
      expect(services).toContain(natureRemoSensor.humiditySensorService)
      expect(services).toContain(natureRemoSensor.temperatureSensorService)
    })
    it('getHumidity', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {hu: {val: 100}, te: {val: 35}}}])
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
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {hu: {val: 100}, te: {val: 35}}}])
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
    it('getTemperatureとgetHumidityを同時実行', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{newest_events: {hu: {val: 100}, te: {val: 35}}}])
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

      Promise.all([promise1, promise2]).then(() => {
        done()
      })
    })
    it('request deviceName 指定なし', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{name: '寝室のRemo', newest_events: {hu: {val: 100}, te: {val: 35}}}, {name: 'リビングのRemo', newest_events: {hu: {val: 10}, te: {val: 1}}}])
      jest.doMock('cron', () => { return { CronJob: function () { this.start = jest.fn() } } })
      const natureRemoSensor = _create(config.accessories[1])

      natureRemoSensor.getHumidity((e, value) => {
        expect(value).toBe(100)
        done()
      })
    })
    it('request deviceName 指定あり', function (done) {
      nock(/.*/).get(/.*/).reply(200, [{name: '寝室のRemo', newest_events: {hu: {val: 100}, te: {val: 35}}}, {name: 'リビングのRemo', newest_events: {hu: {val: 10}, te: {val: 1}}}])
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
    it('request 温度湿度情報なし', function (done) {
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
        done()
      }, 400)
    })
  })
})
