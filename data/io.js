var userData = {
    token: 'eWQtn4I5iqlmGcxARecuWJwW5jnwzTcH',
    clientID: 'admin',
    socketID: ''
}
var model = require('./model')
var socket = require('socket.io-client')('http://localhost:7000', {
    query: {
        token: userData.token,
        clientID: userData.clientID
    }
})

socket.on('connect', function () {
    userData.socketID = socket.id
    emit('devices',model.getDevices())
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