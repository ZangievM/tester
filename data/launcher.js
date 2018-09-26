const exec = require('child_process').exec
const spawn = require('child_process').spawn
const fs = require('fs')
const fileSystem = require('./fileSystem')

const spoonPath = fileSystem.spoonPath
const cachePath = fileSystem.cachePath

function createChildProcess(command, cwd) {
  command.trim()
  let flags = command.split(' ')
  let action = flags.splice(0,1)[0]
  let proc = spawn(action,flags,{cwd:cwd});
  proc.stdout.on('data', data => {
    console.log(`stdout: ${data}`);
  });

  proc.stderr.on('data', data => {
    console.log(`stderr: ${data}`);
  });

  proc.on('close', code => {
    console.log(`child process exited with code ${code}`);
  });
  return proc
}

function execute(command, cwd) {
  let options = {
    maxBuffer: 1024 * 2048
  }
  if (cwd) {
    command = `cd ${cwd} & ${command}`
  }
  return new Promise((resolve,reject)=>{
    exec(command, options,(error,stdout,stderr)=>{
      resolve({
        stdout:stdout,
        stderr:stderr,
        error:error
      })
    })  
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
async function launchTestOnSpoon(id,device,apk,testApk){
  let output = cachePath+id
  let result = await execute(`java -jar spoon-runner-1.7.1-jar-with-dependencies.jar --apk ${apk} --test-apk ${testApk} -serial ${device} --shard --output ${output}`,spoonPath)
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
  let res = await execute(`.\\aapt dump badging ${path}` , androidHome)
  let package = res.stdout.split(/(package: name=)|(')|(\s)/).filter(element=>{
    if(element && element.length>1 && element!='\'') return element
  })[1]
  return package
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
  return testLaunch
}
async function runOnSpoon(id,device, apkPath, testApkPath){
  let packageName = await getPackageNameOfApp(apkPath)
  let testPackageName = await getPackageNameOfApp(testApkPath)
  let start = await execute('adb start-server')
  let testLaunch = await launchTestOnSpoon(id,device,apkPath,testApkPath)
  await uninstallApk(device, packageName)
  await uninstallApk(device, testPackageName)
  return testLaunch
}

async function enqueue(devices, apkPath, testApkPath) {
  let resultArray = []
  for (const item of devices) {
    let tmpResult = run(item,apkPath,testApkPath)
    resultArray.push(tmpResult)
  }
  return Promise.all(resultArray).then(r=>{
    return r
  })
}
async function enqueueOnSpoon(devices, apkPath, testApkPath) {
  let resultArray = []
  for (const item of devices) {
    let tmpResult = runOnSpoon(item,apkPath,testApkPath)
    resultArray.push(tmpResult)
  }
  return Promise.all(resultArray).then(r=>{
    return r
  })
}
module.exports = {
  getConnectedDevices,
  run,
  runOnSpoon,
  enqueue,
  enqueueOnSpoon,
  execute,
  createChildProcess
}