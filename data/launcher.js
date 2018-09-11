const exec = require('child_process').exec
var database = require('./database')
const fs = require('fs')
const util = require('util')
let executor = util.promisify(exec)
var queue = []

function execute(command, cwd) {
  let options = {
    maxBuffer: 1024 * 2048
  }
  if (cwd) {
    command = `cd ${cwd} & ${command}`
  }
  return executor(command, options).then(output => {
    console.log(output)
    return output

  }).catch(error => {
    return error

  })

}
async function installApk(device, path) {
  let result = await execute(`adb -s ${device} install  -t -r  ${path}`)
  return result
}
async function uninstallApk(device, packageName) {
  let result = await execute(`adb -s ${device} uninstall ${packageName}`)
  return result
}
async function launchTest(device, packageName) {
  let result = await execute(`adb -s ${device} shell am instrument -w ${packageName}/android.support.test.runner.AndroidJUnitRunner`)
  return result
}
async function getConnectedDevices() {
  let devices = await execute(`adb devices -l`)
  let result = []
  if (devices.stdout) {
    let arr = devices.stdout.split('\r\n')
    for (let i = 1; i < arr.length; i++) {
      const element = arr[i].split(' ');
      if (element[0].length) {
        let manufacturer = await execute(` adb -s ${element[0]} shell getprop ro.product.manufacturer`)
        manufacturer = manufacturer.stdout.split('\r\n')[0]
        let model = await execute(` adb -s ${element[0]} shell getprop ro.product.model`)
        model = model.stdout.split('\r\n')[0]
        let os = await execute(` adb -s ${element[0]} shell getprop ro.build.version.release`)
        os = os.stdout.split('\r\n')[0]
        let sdk = await execute(` adb -s ${element[0]} shell getprop ro.build.version.sdk`)
        sdk = sdk.stdout.split('\r\n')[0]
        result.push({
          id: element[0],
          manufacturer: manufacturer,
          model: model,
          os: os,
          sdk: sdk
        })
      }

    }
  }
  return result

}

async function getPackageNameOfApp(path) {
  let androidHome = process.env.ANDROID_HOME + '\\build-tools\\'
  let files = fs.readdirSync(androidHome)
  androidHome += files[0]
  return await execute('.\\aapt dump badging C:\\Users\\zmar1\\Documents\\GitHub\\xogameAndroid\\app\\build\\outputs\\apk\\androidTest\\debug\\app-debug-androidTest.apk', androidHome)
}
async function run(device, apkPath, testApkPath) {
  let packageName = await getPackageNameOfApp(apkPath)
  let testPackageName = await getPackageNameOfApp(testApkPath)
  let start = await execute('adb start-server')
  let appInstall = await installApk(device, apkPath)
  let testAppInstall = await installApk(device, testApkPath)
  let testLaunch = await launchTest(device, testPackageName)
  let uninstallApp = await uninstallApk(device, packageName)
  let uninstallTestApp = await uninstallApk(device, testPackageName)
  return [start, appInstall, testAppInstall, testLaunch, uninstallApp, uninstallTestApp]
}

async function enqueue() {

}
enqueue()
module.exports = {
  getConnectedDevices
}