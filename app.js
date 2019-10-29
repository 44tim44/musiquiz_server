var createError = require('http-errors');
var fs = require('fs');
var https = require('https');
var http = require('http');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const initDB = require("./public/javascripts/database").initDB;
const getDB = require("./public/javascripts/database").getDB;
initDB();

var app = express();
app.set('local', 0);
if(process.env.LOCAL = 1) {
    app.set('local', 1);
    console.log("It's localhost!")
}

var port = 8040;

var server;

if(app.get('local') == 1) {
    server = http.createServer(app);
}
else {
    var credentials = {
        key: fs.readFileSync('privkey1.pem'),
        cert: fs.readFileSync('cert1.pem'),
        ca: fs.readFileSync('chain1.pem')
    };
    server = https.createServer(credentials, app);
}

var socketConnection = require("./public/javascripts/socketConnection").initSocket(server,app.get('local'));


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var questionRouter = require('./routes/question');
var storeRouter = require('./routes/store');
var spotifyRouter = require('./routes/spotify')
var lobbyRouter = require('./routes/lobby');

//app.use(socketConnection);

/*
const socket = require('socket.io')(8040);

socket.on('connection', socket => {
  console.log('New user connected');

  socket.on('data', message => {
    console.log(message);

    socket.emit('fromserver', {
      response: "Your data arrived!"
    });

  });

});
*/

// app.js
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', spotifyRouter);
app.use('/users', usersRouter);
app.use('/question', questionRouter);
app.use('/store', storeRouter);
//app.use('/spotify', spotifyRouter);
app.use('/lobby', lobbyRouter);
app.get('/client', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/client/main.html'));
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', { errmsg: err.message });
});

server.listen(port, function() {
    console.log('listening externally on %s port', port);
});

module.exports = app;
