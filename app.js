var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const initDB = require("./public/javascripts/database").initDB;
const getDB = require("./public/javascripts/database").getDB;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var questionRouter = require('./routes/question');
var storeRouter = require('./routes/store');
var spotifyRouter = require('./routes/spotify')
var lobbyRouter = require('./routes/lobby');

var app = express();
var port = 3000;

const socket = require('socket.io')(8040);

socket.on('connection', socket => {
  console.log('New user connected');

  socket.on('data', message => {
    console.log(message);
    socket.emit('fromserver', {
      response: "Your data arrived!"
    });
  })
});



initDB();

// app.js
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/question', questionRouter);
app.use('/store', storeRouter);
app.use('/spotify', spotifyRouter);
app.use('/lobby', lobbyRouter);



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



module.exports = app;
