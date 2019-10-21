const socket = require('socket.io')(8040);

socket.on('connection', socket => {

    console.log('New user connected');

    socket.on('Join', message => {
        console.log(message);
        //Save user with username "message.Username" to mySQL DB
        var pin = message.PIN;
        socket.join(pin);

        socket.emit('fromserver', {
            response: "Your data arrived!"
        });

    });

    socket.on('Answer', message => {
        console.log(message);
        // Handle message.Username, message.Answer & message.QuestionNo
        socket.emit('fromserver', {
            response: "Your data arrived!"
        });
    });

    socket.on('Quit', message => {
        //Remove user with username "message.Username" from mySQL DB
        socket.emit('fromserver', {
            response: "Your data arrived!"
        });
    });

});


function getSocket() {
    return socket;
}

module.exports = {
    getSocket
};