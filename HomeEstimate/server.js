﻿'use strict';

var express = require('express');
var log4js = require('log4js');
var ejs = require("ejs");
var md5 = require("md5");
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer({ dest: '/upload_temp' }); // for parsing multipart/form-data
var moment = require('moment');
require('./common.js');
var config = require('./config.js');

const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const jwt_secret = 'home-estimate-1diefhch3';
var _ = require('underscore');
var request = require('request');
const xpath = require('xpath')
const dom = require('xmldom').DOMParser



var app = express();

log4js.configure({
    appenders: {
        log: { type: 'file', filename: __dirname + '/log/all.log', maxLogSize: 100 * 1024 * 1024 },
        console: { type: 'console' }
    },
    categories: {
        console: {
            appenders: ['console'], level: 'trace'
        },
        default: {
            appenders: ['console', 'log'],
            level: 'debug'
        }
    }
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
global.logger = logger;

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

//get the address information
app.get('/web/address', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var address = req.query['q'];
    var _id = req.query['_id'];

    if (address == null || address == '') {
        if (_id != null || _id != '') {
            db.Contact.findOne({ _id: _id }, function (err, doc) {
                if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

                res.end(JSON.stringify({ success: true, msg: 'get address success', data: doc }));
            });
        } else {
            res.end(JSON.stringify({ success: true, msg: 'address is required for paramter q or id', data: doc }));
            return;
        }
    } else {
        db.Contact.findOne({ address: address }, function (err, doc) {
            res.end(JSON.stringify({ success: true, msg: 'get address success', data: doc }));
        });
    }
});

//post address information
app.post('/web/address', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var address = req.body['address'];

    if (address == null || address == '') {
        res.end(JSON.stringify({ success: true, msg: 'address is required' }));
        return;
    }

    db.Contact.findOne({ address: address }, function (err, doc) {
        if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

        var estimate = function (docAddress) {
            var arr = _.map(address.split(','), function (p) { return p.replace(/(^\s*)|(\s*$)/g, ''); });
            if (arr.length >= 3) {

                request(config.getZwsApiUrl(arr[0], arr[1]), function (error, response, body) {
                    if (error) {
                        logger.error(error);
                        res.end(JSON.stringify({ success: false, msg: 'post address error:' + error }));
                        return;
                    }
                    if (!error && response.statusCode == 200) {
                        var doc = new dom().parseFromString(body)
                        var msg = null;
                        var lastUpdate = null;
                        var oneWeekChange = null;
                        var valueChange = null;
                        var valueChangeDuration = null;
                        var street = null;
                        var zipcode = null;
                        var city = null;
                        var state = null;
                        var latitude = null;
                        var longitude = null;
                        var FIPScounty = null;
                        var taxAssessmentYear = null;
                        var FIPScounty = null;
                        var useCode = null;
                        var taxAssessmentYear = null;
                        var taxAssessment = null;
                        var yearBuilt = null;
                        var lotSizeSqFt = null;
                        var finishedSqFt = null;
                        var bathrooms = null;
                        var bedrooms = null;
                        var lastSoldDate = null;
                        var lastSoldPrice = null;
                        var estimatePrice = null;
                        var lowValuation = null;
                        var highValuation = null;
                        var percentile = null;
                        var estimatePrice = null;
                        msg = xpath.select("//message/text", doc)[0].childNodes[0].data;

                        var insertEstimate = function (i) {
                            try {
                                lastUpdate = xpath.select('//response/results/result[' + i + ']/zestimate/last-updated', doc)[0].childNodes[0].data;
                                oneWeekChange = xpath.select('//response/results/result[' + i + ']/zestimate/oneWeekChange[@deprecated]', doc)[0].attributes[0].nodeValue;
                                valueChange = xpath.select('//response/results/result[' + i + ']/zestimate/valueChange', doc)[0].childNodes[0].data;
                                valueChangeDuration = xpath.select('//response/results/result[' + i + ']/zestimate/valueChange[@duration]', doc)[0].attributes[0].nodeValue;
                                street = xpath.select('//response/results/result[' + i + ']/address/street', doc)[0].childNodes[0].data;
                                zipcode = Number(xpath.select('//response/results/result[' + i + ']/address/zipcode', doc)[0].childNodes[0].data);
                                city = xpath.select('//response/results/result[' + i + ']/address/city', doc)[0].childNodes[0].data;
                                state = xpath.select('//response/results/result[' + i + ']/address/state', doc)[0].childNodes[0].data;
                                latitude = Number(xpath.select('//response/results/result[' + i + ']/address/latitude', doc)[0].childNodes[0].data);
                                longitude = Number(xpath.select('//response/results/result[' + i + ']/address/longitude', doc)[0].childNodes[0].data);
                                FIPScounty = xpath.select('//response/results/result[' + i + ']/FIPScounty', doc)[0].childNodes[0].data;
                                taxAssessmentYear = xpath.select('//response/results/result[' + i + ']/taxAssessmentYear', doc)[0].childNodes[0].data;
                                FIPScounty = xpath.select('//response/results/result[' + i + ']/FIPScounty', doc)[0].childNodes[0].data;
                                useCode = xpath.select('//response/results/result[' + i + ']/useCode', doc)[0].childNodes[0].data;
                                taxAssessmentYear = xpath.select('//response/results/result[' + i + ']/taxAssessmentYear', doc)[0].childNodes[0].data;
                                taxAssessment = xpath.select('//response/results/result[' + i + ']/taxAssessment', doc)[0].childNodes[0].data;
                                yearBuilt = xpath.select('//response/results/result[' + i + ']/yearBuilt', doc)[0].childNodes[0].data;
                                lotSizeSqFt = xpath.select('//response/results/result[' + i + ']/lotSizeSqFt', doc)[0].childNodes[0].data;
                                finishedSqFt = xpath.select('//response/results/result[' + i + ']/finishedSqFt', doc)[0].childNodes[0].data;
                                bathrooms = xpath.select('//response/results/result[' + i + ']/bathrooms', doc)[0].childNodes[0].data;
                                bedrooms = xpath.select('//response/results/result[' + i + ']/bedrooms', doc)[0].childNodes[0].data;
                                lastSoldDate = xpath.select('//response/results/result[' + i + ']/lastSoldDate', doc)[0].childNodes[0].data;
                                lastSoldPrice = xpath.select('//response/results/result[' + i + ']/lastSoldPrice', doc)[0].childNodes[0].data;
                                estimatePrice = xpath.select('//response/results/result[' + i + ']/zestimate/amount', doc)[0].childNodes[0].data;
                                lowValuation = xpath.select('//response/results/result[' + i + ']/zestimate/valuationRange/low', doc)[0].childNodes[0].data;
                                highValuation = xpath.select('//response/results/result[' + i + ']/zestimate/valuationRange/high', doc)[0].childNodes[0].data;
                                percentile = xpath.select('//response/results/result[' + i + ']/zestimate/percentile', doc)[0].childNodes[0].data;
                            } catch (eee) {
                                //if throw an exception, that means no other nodes to read, the estimatePrice var will be null, then end
                            }

                            if (estimatePrice != null) {
                                if (_.filter(docAddress.estimates, function (p) {
                                    return p.lastUpdate != null && new Date(lastUpdate).getTime() == new Date(p.lastUpdate).getTime();
                                }).length == 0 || docAddress.estimates.length == 0) {
                                    db.Contact.findByIdAndUpdate(docAddress._id, {
                                        $push: {
                                            estimates: {
                                                lastUpdate: lastUpdate,
                                                oneWeekChange: oneWeekChange,
                                                valueChange: valueChange,
                                                valueChangeDuration: valueChangeDuration,
                                                street: street,
                                                zipcode: zipcode,
                                                city: city,
                                                state: state,
                                                latitude: latitude,
                                                longitude: longitude,
                                                FIPScounty: FIPScounty,
                                                taxAssessmentYear: taxAssessmentYear,
                                                FIPScounty: FIPScounty,
                                                taxAssessmentYear: taxAssessmentYear,
                                                FIPScounty: FIPScounty,
                                                useCode: useCode,
                                                taxAssessmentYear: taxAssessmentYear,
                                                taxAssessment: taxAssessment,
                                                yearBuilt: yearBuilt,
                                                lotSizeSqFt: lotSizeSqFt,
                                                finishedSqFt: finishedSqFt,
                                                bathrooms: bathrooms,
                                                bedrooms: bedrooms,
                                                lastSoldDate: lastSoldDate,
                                                lastSoldPrice: lastSoldPrice,
                                                estimatePrice: estimatePrice,
                                                lowValuation: lowValuation,
                                                highValuation: highValuation,
                                                percentile: percentile,
                                                formularCalcPrice: null
                                            }
                                        }
                                    }, function (err, resDoc) {
                                        i++;
                                        insertEstimate(i);
                                    });
                                } else {
                                    i++;
                                    insertEstimate(i);
                                }
                            } else {
                                db.Contact.findOne({ _id: docAddress._id }, function (err, resDoc2) {
                                    res.end(JSON.stringify({ success: false, msg: 'post address error:' + error }));

                                    res.end(JSON.stringify({ success: true, msg: 'post address success', data: resDoc2 }));
                                });
                            }
                        }

                        insertEstimate(0);
                    } else {
                        res.end(JSON.stringify({ success: false, msg: 'post address error', data: docAddress }));
                    }
                });
            } else {
                res.end(JSON.stringify({ success: false, msg: '地址有误，无法估价' }));
            }
        }

        if (doc == null) {
            db.Contact.create({ address: address }, function (err, docAddress) {
                estimate(docAddress);
            });
        } else {
            estimate(doc);
        }
    });
});

//personal information to input
app.post('/web/personal', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var _id = req.body['_id'];
    var firstName = req.body['firstName'];
    var lastName = req.body['lastName'];
    var email = req.body['email'];


    if (_id == null || _id == '') {
        res.end(JSON.stringify({ success: false, msg: '_id is required' }));
        return;
    }
    if (firstName == null || firstName == '') {
        res.end(JSON.stringify({ success: false, msg: 'first name is required' }));
        return;
    }
    if (lastName == null || lastName == '') {
        res.end(JSON.stringify({ success: false, msg: 'last name is required' }));
        return;
    }
    if (email == null || email == '') {
        res.end(JSON.stringify({ success: false, msg: 'email is required' }));
        return;
    }


    db.Contact.findOne({ _id: _id }, function (err, doc) {
        if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

        if (doc == null) {
            res.end(JSON.stringify({ success: true, msg: 'cannot find any address info', data: doc }));
        } else {
            db.Contact.findByIdAndUpdate(_id, { $set: { firstName: firstName, lastName: lastName, email: email } }, function (err, doc) {
                res.end(JSON.stringify({ success: true, msg: 'post personal information success', data: doc }));
            })
        }
    });
});

app.post('/web/debt', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var _id = req.body['_id'];
    var debt = req.body['debt'];

    if (_id == null || _id == '') {
        res.end(JSON.stringify({ success: false, msg: '_id is required' }));
        return;
    }
    if (debt == null || debt == '') {
        res.end(JSON.stringify({ success: false, msg: 'debt is required' }));
        return;
    }

    db.Contact.findOne({ _id: _id }, function (err, doc) {
        if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

        if (doc == null) {
            res.end(JSON.stringify({ success: true, msg: 'cannot find any address info', data: doc }));
        } else {
            db.Contact.findByIdAndUpdate(_id, { $set: { debt: new Number(debt) } }, function (err, doc) {
                if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

                res.end(JSON.stringify({ success: true, msg: 'post debt information success', data: doc }));
            })
        }
    });
});

//personal information to confirm
app.post('/web/personalConfirm', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var _id = req.body['_id'];
    var firstName = req.body['firstName'];
    var lastName = req.body['lastName'];
    var email = req.body['email'];
    var phone = req.body['phone'];

    if (_id == null || _id == '') {
        res.end(JSON.stringify({ success: false, msg: '_id is required' }));
        return;
    }
    if (firstName == null || firstName == '') {
        res.end(JSON.stringify({ success: false, msg: 'first name is required' }));
        return;
    }
    if (lastName == null || lastName == '') {
        res.end(JSON.stringify({ success: false, msg: 'last name is required' }));
        return;
    }
    if (email == null || email == '') {
        res.end(JSON.stringify({ success: false, msg: 'email is required' }));
        return;
    }
    if (phone == null || phone == '') {
        res.end(JSON.stringify({ success: false, msg: 'phone is required' }));
        return;
    }

    db.Contact.findOne({ _id: _id }, function (err, doc) {
        if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

        if (doc == null) {
            res.end(JSON.stringify({ success: true, msg: 'cannot find any address info', data: doc }));
        } else {
            var obj = {};
            if (firstName != null && firstName != '') {
                obj.firstName = firstName;
            }
            if (lastName != null && lastName != '') {
                obj.lastName = lastName;
            }
            if (email != null && email != '') {
                obj.email = email;
            }
            if (phone != null && phone != '') {
                obj.phone = phone;
            }

            db.Contact.findByIdAndUpdate(_id, { $set: obj }, function (err, doc) {
                if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'update error:' + err })); return; }

                db.Contact.findOne({ _id: _id }, function (err, doc) {
                    if (err) { logger.error(err); res.end(JSON.stringify({ success: false, msg: 'get error:' + err })); return; }

                    res.end(JSON.stringify({ success: true, msg: 'post personal information success', data: doc }));
                });
            })
        }
    });
});

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
        }, jwt_secret, {
                expiresIn: 10 * 60 * 60 //秒到期时间
            });

        res.end(JSON.stringify({ success: true, msg: 'login success' + err, data: token }));
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

var getCurrentAdmin = function (req, callback) {
    console.log(req.headers);
    var token = req.headers['authorization'].split(' ')[1];
    var obj = jwt.verify(token, jwt_secret);

    db.Admin.findById(obj._id, callback);
}
//----------end get current admin ----------

var server = app.listen(config.port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("application start at http://%s:%s", host, port);
})

