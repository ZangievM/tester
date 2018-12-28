var fs = require('fs')
var uuid = require('uuid').v1
var launcher = require('./launcher')
var fileSystem = require('./fileSystem')
var database = require('./localDatabase')
// var io = require('./io')
const cache = fileSystem.cachePath
var devices = new Map()
var tests = []
var queue = []


class Device {
    // constructor(id, manufacturer, model, os, sdk) {
    //     this.id = id,
    //         this.manufacturer = manufacturer
    //     this.model = model
    //     this.os = os
    //     this.sdk = sdk
    // }
    constructor(device) {
        this.id = device.id
        this.manufacturer = device.manufacturer
        this.model = device.model
        this.os = device.os
        this.sdk = device.sdk
    }
    toPojo() {
        return {
            id: this.id,
            manufacturer: this.manufacturer,
            model: this.model,
            os: this.os,
            sdk: this.sdk
        }
    }
    toString() {
        return `${this.manufacturer} ${this.model} (Android ${this.os}, SDK ${this.sdk})`
    }
}

class TestRun {
    constructor(device, apkPath, testApkPath) {
        this.id = uuid()
        this.device = device
        this.deviceDesc = devices.get(device).toString()
        this.apkPath = apkPath
        this.testApkPath = testApkPath
        this.status = 'none'
        this.result = ''
    }
    start() {
        this.status = 'in progress...'
    }
    stop() {
        this.status = 'done'
    }
    setResult(result) {
        this.status = 'done'
        this.result = result
    }
    toPojo() {

    }
}

function createTestRuns(devices, apk, testApk) {
    let result = []
    for (const item of devices) {
        let tmp = new TestRun(item, apk, testApk)
        result.push(tmp)
    }
    tests = tests.concat(result)
    for (const item of result) {
        enqueue(item)
    }

}

async function deleteTestRun(id) {
    let index = tests.findIndex(element => element.id === id)
    let testRun = tests[index]
    tests.splice(index, 1)
    await fileSystem.remove(testRun.apkPath)
    await fileSystem.remove(testRun.testApkPath)
    await fileSystem.removeFolder(cache + id)
    // await database.remove(testRun.toPojo())

}
async function startOnAdb(testRuns) {
    let resultArray = []
    for (const item of testRuns) {
        let tmpResult = launcher.run(item.device, item.apkPath, item.testApkPath)
        item.start()
        resultArray.push(tmpResult)
    }
    return Promise.all(resultArray).then(async r => {
        for (let i = 0; i < r.length; i++) {
            const element = r[i];
            testRuns[i].stop()
        }
        return r
    })
}
async function startOnSpoon(item) {
    let tmpResult = launcher.runOnSpoon(item.id, item.device, item.apkPath, item.testApkPath)
    item.start()
    return tmpResult.then(async r => {
        item.stop()
        queue.splice(queue.indexOf(item), 1)
        next(item.device)
        return r
    })
}

function enqueue(testRun) {
    let x = queue.find(element => element.device === testRun.device)
    queue.push(testRun)
    if (!x)
        next(testRun.device)
}

function next(device) {
    let x = queue.find(element => element.device === device)
    if (x) startOnSpoon(x)
}

async function refreshDevices() {
    devices.clear()
    let result = await launcher.getConnectedDevices()
    result.forEach(device => {
        devices.set(device.id, new Device(device))
    })

}

function getDevices() {
    return [...devices.values()]
}

function getTestRuns() {
    return tests
}

function getTest(id) {
    return tests.find(element => element.id === id)
}
setInterval(() => {
    refreshDevices()
}, 5000)
module.exports = {
    Device,
    TestRun,
    createTestRuns,
    getTestRuns,
    getTest,
    deleteTestRun,
    getDevices
}