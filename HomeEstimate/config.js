'use strict';
var format = require('string-format')

var config = {
    zwsid: 'X1-ZWz19qpbqq1ibv_5cfwc',
    zwsApiUrl: 'https://www.zillow.com/webservice/GetDeepSearchResults.htm?zws-id=X1-ZWz19qpbqq1ibv_5cfwc&address={0}&citystatezip={1}',
    getZwsApiUrl: function (address, citystatezip) {
        return format(config.zwsApiUrl, address, citystatezip);
    },
    port: 8081
}

module.exports = config;