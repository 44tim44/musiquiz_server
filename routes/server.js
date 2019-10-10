
var express = require('express');
var router = express.Router();
const io = require('socket.io')(8040);

io.on('connection', socket => {
    console.log('new User');
    socket.emit('chat-message', 'hello user');
    socket.on('send-chat-message', message => {
        console.log(message);
    })
})
