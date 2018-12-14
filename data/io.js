var socket = require('socket.io-client')('http://localhost:7000')
socket.on('connect', function () {
    console.log('connected');
    socket.emit('devices',"mi a1")
});
socket.on('testrun', function (data) {
    console.log(data);
    
});
socket.on('disconnect', function () {
    console.log('disconnect');
    
});