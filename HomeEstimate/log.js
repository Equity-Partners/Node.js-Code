var log4js = require('log4js');

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

global.log4js = log4js;