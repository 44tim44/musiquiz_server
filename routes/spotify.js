var express = require('express');
var path = require('path');
var request = require('request'); // "Request" library
var querystring = require('querystring');
var router = express.Router();

var client_id = '727abe78888841138efa90ffe40ee81d'; // Your client id
var client_secret = '95e3d8921acc4cc88d316f02153fe0bf'; // Your secret
var redirect_uri = 'http://localhost:3000/spotify/callback'; // Your redirect uri

const getDB = require("../public/javascripts/database").getDB;


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var stateKey = 'spotify_auth_state';

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('spotify.html', { title: 'Spotify' });
});

/* GET home page. */
router.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email streaming app-remote-control';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

router.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                // use the access token to access the Spotify Web API
                request.get(options, function(error, response, body) {
                    console.log(body);
                    res.app.set('user_id', body.id);
                    //addUser(body.id, body.display_name);
                    var spotifyId = body.id;
                    var display_name = body.display_name;
                    var con = getDB();

                    var sql = "SELECT * FROM user WHERE SpotifyID = ?";
                    con.query(sql, spotifyId, function (err, result) {
                        if (err) throw err;

                        if(result[0] == undefined) {
                            var now = new Date();
                            var sql3 = "INSERT INTO user (SpotifyID, Username, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?)";
                            con.query(sql3, [spotifyId, display_name, now, now], function (err, rows, result) {
                                if (err) throw err;
                                console.log("New user inserted to database.");
                                res.app.set('access_token', access_token);
                                res.app.set('refresh_token', refresh_token);

                                // we can also pass the token to the browser to make requests from there
                                res.redirect('/store');
                            });
                        }

                        else console.log("User already exists in database.");
                        res.app.set('access_token', access_token);
                        res.app.set('refresh_token', refresh_token);

                        // we can also pass the token to the browser to make requests from there
                        res.redirect('/store');
                    });

                });

                res.app.set('access_token', access_token);
                res.app.set('refresh_token', refresh_token);

                // we can also pass the token to the browser to make requests from there
                /*res.redirect('/#' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));*/
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

router.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

module.exports = router;
