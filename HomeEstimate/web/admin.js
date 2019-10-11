'use strict';

var log4js = global.log4js;
var app = global.app;
var config = global.config;

var ejs = require("ejs");
var md5 = require("md5");
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var moment = require('moment');

var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var _ = require('underscore');
var request = require('request');
var xpath = require('xpath')
var dom = require('xmldom').DOMParser

var app = global.app;
var db = global.db;

var logger = log4js.getLogger();

//----------begin of admin---------------
//login
app.post('/admin/login', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var userName = req.body['userName'];
    var password = req.body['password'];

    if (userName == null || userName == '') {
        res.end(JSON.stringify({ success: false, msg: 'user name is required' }));
        return;
    }
    if (password == null || password == '') {
        res.end(JSON.stringify({ success: false, msg: 'password is required' }));
        return;
    }

    password = md5(password);

    db.Admin.findOne({ userName: userName }, function (err, doc) {
        if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

        if (doc == null) {
            res.end(JSON.stringify({ success: false, msg: 'user not found', data: doc }));
            return;
        }

        if (doc.password != password) {
            res.end(JSON.stringify({ success: false, msg: 'password is incorrect', data: doc }));
            return;
        }

        var token = jwt.sign({
            _id: doc._id
        }, config.jwt_secret, {
                expiresIn: 10 * 60 * 60 //秒到期时间
            });

        res.end(JSON.stringify({ success: true, msg: 'login success', data: token }));
    });
});


app.post('/admin/create', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var userName = req.body['userName'];
    var password = req.body['password'];

    if (userName == null || userName == '') {
        res.end(JSON.stringify({ success: false, msg: 'user name is required' }));
        return;
    }
    if (password == null || password == '') {
        res.end(JSON.stringify({ success: false, msg: 'password is required' }));
        return;
    }

    password = md5(password);

    db.Admin.findOne({ userName: userName }, function (err, doc) {
        if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

        if (doc != null) {
            res.end(JSON.stringify({ success: false, msg: 'user already exists', data: doc }));
            return;
        }

        db.Admin.create({
            userName: userName,
            password: password
        }, function (err, doc) {
            if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

            res.end(JSON.stringify({ success: true, msg: 'create admin success', data: doc }));
        });
    });
});

app.post('/admin/updatePwd', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var _id = req.body['_id'];
    var password = req.body['password'];

    if (_id == null || _id == '') {
        res.end(JSON.stringify({ success: false, msg: '_id is required' }));
        return;
    }
    if (password == null || password == '') {
        res.end(JSON.stringify({ success: false, msg: 'password is required' }));
        return;
    }

    password = md5(password);

    db.Admin.findByIdAndUpdate(_id, {
        password: password
    }, function (err, doc) {
        if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

        db.Admin.findById(doc._id, function (err, doc) {
            if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

            res.end(JSON.stringify({ success: true, msg: 'update password success', data: doc }));
        });
    });
});

app.post('/admin/delete', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var _id = req.body['_id'];

    if (_id == null || _id == '') {
        res.end(JSON.stringify({ success: true, msg: '_id required' }));
        return;
    }

    db.Admin.findById(_id, function (err, doc) {
        if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'delete error:' + err })); return; }
        if (doc == null) {
            res.end(JSON.stringify({ success: true, msg: 'admin doesn\'t exists' }));
            return;
        } else {
            db.Admin.remove({ _id: _id }, function (err) {
                if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'delete error:' + err })); return; }
                res.end(JSON.stringify({ success: true, msg: 'delete success' }));
            })
        }
    })
});

//admin page
app.post('/admin/adminPage', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var userName = req.body['userName'];
    var page = req.body['page'];
    var rows = req.body['rows'];

    if (page == null || page == '') {
        page = 1;
    } else {
        page = Number(page);
    }

    if (rows == null || rows == '') {
        rows = 10;
    } else {
        rows = Number(rows);
    }

    var searchObj = {};
    if (userName != null && userName != '') {
        searchObj.userName = new RegExp(userName);
    }
    db.Admin.find(searchObj, function (err, docs) {
        if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

        db.Admin.count(searchObj, function (err, c) {
            if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

            res.end(JSON.stringify({ success: true, msg: 'get success', rows: docs, total: c }));
        });
    }).limit(rows).skip((page - 1) * rows).exec();
});

//address page
app.post('/admin/addressPage', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var firstName = req.body['firstName'];
    var lastName = req.body['lastName'];
    var email = req.body['email'];
    var phone = req.body['phone'];
    var beginEstimatePrice = req.body['beginEstimatePrice'];
    var endEstimatePrice = req.body['endEstimatePrice'];
    var isAgreeToUse = req.body['isAgreeToUse'];
    var beginDebt = req.body['beginDebt'];
    var endDebt = req.body['endDebt'];
    var page = req.body['page'];
    var rows = req.body['rows'];

    if (page == null || page == '') {
        page = 1;
    } else {
        page = Number(page);
    }

    if (rows == null || rows == '') {
        rows = 10;
    } else {
        rows = Number(rows);
    }

    var searchObj = {};
    if (firstName != null && firstName != '') {
        searchObj.firstName = new RegExp(firstName);
    }
    if (lastName != null && lastName != '') {
        searchObj.lastName = new RegExp(lastName);
    }
    if (email != null && email != '') {
        searchObj.email = new RegExp(email);
    }
    if (phone != null && phone != '') {
        searchObj.phone = new RegExp(phone);
    }
    if (beginEstimatePrice != null && beginEstimatePrice != '') {
        if (searchObj['estimates.estimatePrice'] == undefined) {
            searchObj['estimates.estimatePrice'] = {};
        }

        searchObj['estimates.estimatePrice']['$gte'] = Number(beginEstimatePrice);
    }
    if (endEstimatePrice != null && endEstimatePrice != '') {
        if (searchObj['estimates.estimatePrice'] == undefined) {
            searchObj['estimates.estimatePrice'] = {};
        }

        searchObj['estimates.estimatePrice']['$lte'] = Number(endEstimatePrice);
    }
    if (isAgreeToUse != null && isAgreeToUse != '') {
        searchObj.isAgreeToUse = Boolean(isAgreeToUse);
    }
    if (beginDebt != null && beginDebt != '') {
        if (searchObj.debt == undefined) {
            searchObj.debt = {};
        }

        searchObj.debt['$gte'] = Number(beginEstimatePrice);
    }
    if (endEstimatePrice != null && endEstimatePrice != '') {
        if (searchObj.debt == undefined) {
            searchObj.debt = {};
        }

        searchObj.debt['$lte'] = Number(endEstimatePrice);
    }

    db.Admin.find(searchObj, function (err, docs) {
        if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

        db.Contact.count(searchObj, function (err, c) {
            if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

            res.end(JSON.stringify({ success: true, msg: 'get success', rows: docs, total: c }));
        });
    }).limit(rows).skip((page - 1) * rows).exec();
});

//----------end of admin---------------


//----------get current admin ----------

global.getCurrentAdmin = function (req, callback) {
    console.log(req.headers);
    var token = req.headers['authorization'].split(' ')[1];
    var obj = jwt.verify(token, config.jwt_secret);

    db.Admin.findById(obj._id, callback);
}
var getCurrentAdmin = global.getCurrentAdmin;
//----------end get current admin ----------