'use strict';

require('./log.js');
var log4js = global.log4js;
var express = require('express');

var ejs = require("ejs");
var md5 = require("md5");
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var moment = require('moment');
require('./common.js');
var config = require('./config.js');
global.config = config;

var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var jwt_secret = 'home-estimate-1diefhch3';
var _ = require('underscore');
var request = require('request');
var xpath = require('xpath')
var dom = require('xmldom').DOMParser



var app = express();
global.app = app;

app.all("*", function (req, res, next) {
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin", "*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers", "content-type");
    //跨域允许的请求方式 
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    next();
});

const session = require("express-session");
const FileStore = require('session-file-store')(session);
const sessionMiddleware = session({
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
    secret: 'home_estimate',
    cookie: {
        path: '/',
        maxAge: 10 * 24 * 60 * 60 * 1000
    }
});

app.use(sessionMiddleware);

app.use(expressJwt({
    secret: jwt_secret
}).unless(function (req) {
    if (req.url.startsWith('/')) {
        return true;
    }

    if (req.url.startsWith('/web')) {
        return true;
    }

    if (req.url.startsWith('/admin/login')) {
        return true;
    }

    if (req.url.startsWith('/public')) {
        return true;
    }
}));

app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        res.status(401).end(JSON.stringify({ success: false, msg: 'not authorized', code: 401 }));
    } else {
        next();
    }
});

app.use('/public', express.static(__dirname + '/public'));

require('./db.js');
var db = global.db;
var logger = log4js.getLogger();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(log4js.connectLogger(log4js.getLogger('console'), { level: log4js.levels.INFO }));

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    logger.error(err);
    ejs.renderFile("views/error.html", { title: "website error", err: err }, function (err, data) {
        if (err) { logger.error(err); res.end('there\'s error：' + err); return; }
        res.end(data);
    });
});

require('./web/admin.js');
require('./web/front.js');

var server = app.listen(config.port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("application start at http://%s:%s", host, port);
})

