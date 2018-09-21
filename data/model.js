var fs = require('fs')
var uuid = require('uuid').v1
var launcher = require('./launcher')
var fileSystem = require('./fileSystem')
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
            manufacturer: this.manufacturer,
            model: this.model,
            os: this.os,
            sdk: this.sdk
        }
    }
}

class TestRun {
    constructor(device, apkPath, testApkPath) {
        this.id = uuid()
        this.device = device
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
            await fileSystem.remove(testRuns[i].apkPath)
            await fileSystem.remove(testRuns[i].testApkPath)
        }
        return r
    })
}
async function startOnSpoon(testRuns) {
    let resultArray = []
    for (const item of testRuns) {
        let tmpResult = launcher.runOnSpoon(item.id, item.device, item.apkPath, item.testApkPath)
        item.start()
        resultArray.push(tmpResult)
    }
    return Promise.all(resultArray).then(async r => {
        for (let i = 0; i < r.length; i++) {
            const element = r[i];
            testRuns[i].stop()
            queue.splice(queue.indexOf(testRuns[i]),1)
            queue.next(testRuns[i].device)
            await fileSystem.remove(testRuns[i].apkPath)
            await fileSystem.remove(testRuns[i].testApkPath)
        }
        return r
    })
}
function enqueue(testRun){
    queue.push(testRun)
    next(testRun.device)
}
function next(device){
    let x = queue.find(element=> element.device ===device)
    if(x) startOnSpoon(x)
}

async function refreshDevices() {
    let result = await launcher.getConnectedDevices()
    devices = []
    result.forEach(device => {
        devices.push(new Device(device))
    })

}
function getTestRuns(){
    return tests
}
// setInterval(() => {
//     refreshDevices()
// }, 5000)
module.exports = {
    Device,
    TestRun,
    createTestRuns,
    getTestRuns
}