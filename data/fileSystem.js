const fs = require('fs')
const util = require('util')
const replacer = util.promisify(fs.rename)
const remover = util.promisify(fs.unlink)
async function replace(oldPath,newPath){
    try {
        await replacer(oldPath,newPath)
        await remove(oldPath)
    } catch (error) {
        console.log('Error in replace')
    }
}
async function remove(path){
    try{
        await remover(path)
    }catch(error){
        console.log('Error in delete');
    }
}
module.exports={
    replace,
    remove
}