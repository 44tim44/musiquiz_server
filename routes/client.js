var express = require('express');
var router = express.Router();
const io = require('socket.io-client');

const socket = io.connect('http://localhost:8040');

socket.on('chat-message', data => {
    console.log(data);
});

router.post('/', (req, res) => {
    //res.send(`Full name is:${req.body.fname} ${req.body.lname} Timestamp: ${Date.now()}.`);

    //Lägg till: Spara formulär-data i servern

    res.redirect('/lobby');
});
router.get('/', function(req, res) {
    res.render('client.html', { title: 'Musiquiz'});
});

module.exports = router;
