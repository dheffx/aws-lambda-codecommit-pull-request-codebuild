'use strict';
const snsResp = require('./lib/sns-response')
const pullReq = require('./lib/pull-request')
const build = require('./lib/build')

exports.handler = (event, context) => {
    let message = snsResp.parse(event.Records[0].Sns.Message)
    pullReq.get(message)
            .then(build.run)
            .then(resp => console.log(resp))
            .catch(e => console.error(e))
}
