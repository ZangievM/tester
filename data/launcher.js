const exec = require('child_process').exec

function execute(command) {
  return new Promise((resolve,reject)=>{
    exec(command,
    (error, stdout, stderr) => {
      console.log(`stdout: ${stdout.trim()}`);
      console.log(`stderr: ${stderr.trim()}`);
      console.log(`exec error: ${error}`);
      resolve( {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        error:error
      })

    });
  })
  
}
async function installApk(path){
    let result = await execute(`adb install  -t -r  ${path}`)
    return result
}
async function uninstallApk(packageName){
  let result = await execute(`adb uninstall ${packageName}`)
  return result
}
async function launchTest(packageName) {
  let result = await execute(`adb shell am instrument -w ${packageName}/android.support.test.runner.AndroidJUnitRunner`)
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
module.exports = {
  getConnectedDevices
}