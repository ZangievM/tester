const exec = require('child_process').exec
var queue = []
function execute(command) {
  return new Promise((resolve,reject)=>{
    exec(command, {maxBuffer: 1024 * 2048},
    (error, stdout, stderr) => {
      console.log(`stdout: ${stdout.trim()}`);
      console.log(`stderr: ${stderr.trim()}`);
      console.log(`error: ${error}`);
      resolve( {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        error:error
      })

    });
  })
  
}
async function installApk(device,path){
    let result = await execute(`adb -s ${device} install  -t -r  ${path}`)
    return result
}
async function uninstallApk(device,packageName){
  let result = await execute(`adb -s ${device} uninstall ${packageName}`)
  return result
}
async function launchTest(device, packageName) {
  let result = await execute(`adb -s ${device} shell am instrument -w ${packageName}/android.support.test.runner.AndroidJUnitRunner`)
  return result
}
async function getConnectedDevices(){
  let devices = await execute(`adb devices -l`)
  let result = []
  if(devices.stdout){
    let arr = devices.stdout.split('\r\n')
    for (let i = 1; i < arr.length; i++) {
      const element = arr[i].split(' ');
      if(element[0].length){
        let manufacturer = await execute(` adb -s ${element[0]} shell getprop ro.product.manufacturer`)
        manufacturer = manufacturer.stdout.split('\r\n')[0]
        let model = await execute(` adb -s ${element[0]} shell getprop ro.product.model`)
        model = model.stdout.split('\r\n')[0]
        let os = await execute(` adb -s ${element[0]} shell getprop ro.build.version.release`)
        os = os.stdout.split('\r\n')[0]
        let sdk = await execute(` adb -s ${element[0]} shell getprop ro.build.version.sdk`)
        sdk= sdk.stdout.split('\r\n')[0]
        result.push({
          id:element[0],
          manufacturer:manufacturer,
          model:model,
          os: os,
          sdk:sdk
        })
      }
        
    }
  }
  return result

}
async function run(device){
  let start = await execute('adb start-server')
  let appInstall = await installApk(device,'C:\\Users\\zmar1\\Documents\\GitHub\\xogameAndroid\\app\\build\\outputs\\apk\\debug\\app-debug.apk')
  let testAppInstall = await installApk(device,"C:\\Users\\zmar1\\Documents\\GitHub\\xogameAndroid\\app\\build\\outputs\\apk\\androidTest\\debug\\app-debug-androidTest.apk")
  let testLaunch = await launchTest(device,'zm.xosocket.test')
  let uninstallApp = await uninstallApk(device,'zm.xosocket')
  let uninstallTestApp = await uninstallApk(device,'zm.xosocket.test')
  return [start,appInstall,testAppInstall,testLaunch,uninstallApp,uninstallTestApp]
}

function enqueue(){

}
module.exports = {
  getConnectedDevices
}