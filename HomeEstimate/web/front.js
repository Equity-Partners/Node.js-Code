'use strict';
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

app.get('/', function (req, res) {
    res.redirect('./public/index.html');
})

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
                            estimatePrice = null;
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
                                console.log(eee);
                                logger.error(eee);
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
                                                useCode: useCode,
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
                                    if(err) res.end(JSON.stringify({ success: false, msg: 'post address error:' + err }));

                                    res.end(JSON.stringify({ success: true, msg: 'post address success', data: resDoc2 }));
                                });
                            }
                        }

                        insertEstimate(1);
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
