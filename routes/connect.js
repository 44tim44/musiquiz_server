/*var express = require('express');
var router = express.Router();
const io = require('socket.io')(8040);

io.on('connection', socket => {
    socket.emit('chat-message', 'hello user')
})

*/

/*
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
var router = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));

users = [];
connections = [];

const port = 8040;

server.listen(process.env.PORT || port);
console.log('server running..');

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
});

app.post('/connect', (req, res) => {
    res.send(`Full name is:${req.body.fname} ${req.body.lname} Timestamp: ${Date.now()}.`);
});


const port = 8040;

app.listen(port, () => {
    console.log(`Connect your mobile device on port ${port}`);
});

router.get('/', function(req, res, next) {
    res.render('connect.html', { title: 'Connect' });
});



module.exports = router;
*/