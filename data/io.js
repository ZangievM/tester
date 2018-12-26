var socket = require('socket.io-client')('http://localhost:7000')
const token = 'eWQtn4I5iqlmGcxARecuWJwW5jnwzTcH'
const clientID = 'admin'
var model  = require('./model')
socket.on('connect', function () {
    socket.emit('register',clientID,token,socket.id)
});
socket.on('testrun', function (data) {
    console.log(data);

});
socket.on('disconnect', function () {
    console.log('disconnect');
});
var emit = (action, data) => {
    socket.emit(action, JSON.stringify(data))
}
module.exports = {
    emit
}