var fs = require('fs')
var uuid = require('uuid').v1
var launcher = require('./launcher')
var devices = new Map()
var tests = []
var queue = new Map()

class Device {
    constructor(id, manufacturer, model, os, sdk) {
        this.id = id,
            this.manufacturer = manufacturer
        this.model = model
        this.os = os
        this.sdk = sdk
    }
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
    constructor(devices, apkPath, testApkPath) {
        this.id = uuid()
        this.devices = devices
        this.apkPath = apkPath
        this.testApkPath = testApkPath
        this.status = 'none'
        this.result = ''
    }
    start() {
        this.status = 'started'
    }
    stop() {
        this.status = 'stopped'
    }
    setResult(result) {
        this.status = 'done'
        this.result = result
    }
}

var enqueue = function (testRun) {
    tests.push(testRun)
    let flag = false
    queue.forEach(element => {
        element.devices.forEach(device => {

        })
    })

}

function next(device) {

}

var createTestRun = (devices, apkPath, testApkPath) => {
    let tmp = new TestRun(devices, apkPath, testApkPath)
    enqueue(tmp)
}

async function refreshDevices() {
    let result = await launcher.getConnectedDevices()
    devices = []
    result.forEach(device => {
        devices.push(new Device(device))
    })
    
}
setInterval(() => {
    refreshDevices()
}, 5000)
module.exports = {
    Device,
    TestRun
}