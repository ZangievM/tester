var loki = require('lokijs')
var db = new Loki('db')
var testRuns = db.getCollection('tests')

function init() {
    if (!testRuns) {
        testRuns = db.addCollection('tests', {
            unique: ['id']
        })
    }
}
var insertData = (data) => {
    let res = testRuns.insert(data)
    if (res) return true
    return false
}
var updateData = (data) => {
    let res = testRuns.update(data)
    if (res) return true
    return false
}
var removeData = (data) => {
    let res = testRuns.remove(data)
    if (res) return true
    return false
}
var query = (query)=>{
    let res = testRuns.find(query)
    if (res) return res
    return null
}
init()
module.exports = {
    insertData,
    updateData,
    query,
    remove
}