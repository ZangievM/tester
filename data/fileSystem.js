const fs = require('fs')
const util = require('util')
const rimraf = require('rimraf')
const replacer = util.promisify(fs.rename)
const remover = util.promisify(fs.unlink)
const folderRemover = util.promisify(rimraf)
const path = require('path')
var rootPath =  __dirname.replace('data',"")
var spoonPath = ''
var cachePath = ''
const parseRoot = path.parse(rootPath)

if (parseRoot.root[0] >= 'a' && parseRoot.root[0] <= 'z'){
    rootPath = rootPath.replace(parseRoot.root[0], parseRoot.root[0].toUpperCase())
    cachePath = rootPath+'cache\\'
    spoonPath = rootPath+'helpers\\'
}
    

async function replace(oldPath, newPath) {
    try {
        await replacer(oldPath, newPath)
        await remove(oldPath)
    } catch (error) {
        console.log('Error in replace '+error)
    }
}
async function remove(path) {
    try {
        await remover(path)
    } catch (error) {
        console.log('Error in delete '+error);
    }
}
async function removeFolder(path){
    try {
        await folderRemover(path)
    } catch (error) {
        console.log('Error in delete folder '+error);
    }
}
module.exports = {
    replace,
    remove,
    spoonPath,
    cachePath,
    removeFolder
}