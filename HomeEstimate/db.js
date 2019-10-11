'use strict';
var log4js = global.log4js;
var logger = log4js.getLogger('default');
var md5 = require("md5");

// 导入mongoose 模块
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
// 设置mongodb 连接地址
const mongoURL = "mongodb://127.0.0.1:27017/homeEstimate";
// 连接mongodb 设置
mongoose.connect(mongoURL, {
});

// 获取连接信息 并输出
var db = mongoose.connection;

db.on('error', function (err) {
    logger.error(err);
})

var db = {};

db.Admin = mongoose.model('Admin', {
    userName: { type: String }, //user name of adminstrator
    password: { type: String } //password of administrator
}, 'Admin');

db.Contact = mongoose.model('Contact', {
    address: { type: String }, //address of the house
    firstName: { type: String, default: null }, //first name
    lastName: { type: String, default: null }, //last name
    email: { type: String, default: null }, //email
    phone: { type: String, default: null }, //phone number
    estimates: [{
        lastUpdate: { type: Date, default: Date.now }, //the time of estimating moment
        oneWeekChange: { type: Boolean, default: null },
        valueChange: { type: Number, default: null },
        valueChangeDuration: { type: Number, default: null },
        
        street: { type: String, default: null },
        zipcode: { type: Number, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        FIPScounty: { type: String, default: null },
        useCode: { type: String, default: null },
        taxAssessmentYear: { type: Number, default: null },
        taxAssessment: { type: Number, default: null },
        yearBuilt: { type: Number, default: null },
        lotSizeSqFt: { type: Number, default: null },
        finishedSqFt: { type: Number, default: null },
        bathrooms: { type: Number, default: null },
        bedrooms: { type: Number, default: null },
        lastSoldDate: { type: Date, default: null },
        lastSoldPrice: { type: Number, default: null },
        lowValuation: { type: Number, default: null },
        highValuation: { type: Number, default: null },
        percentile: { type: Number, default: null },
        estimatePrice: { type: Number, default: null },
        formularCalcPrice: { type: Number, default: null } //the result of formular calculating
    }],
    isAgreeToUse: { type: Boolean, default: true }, //do the user allow you to use the information of commiting
    givePercent: { type: Number, default: 100 }, // the percentage of giving price to the platform, default to set 100
    debt: { type: Number, default: null } //bank arrears
}, 'Contact');

db.Admin.findOne({ userName: 'admin' }, function (err, doc) {
    if (err) { logger.error(err); return; }

    if (doc == null) {
        db.Admin.create({ userName: 'admin', password: md5('admin123456') });
    }
});

global.db = db;