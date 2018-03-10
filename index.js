'use strict';
const snsResp = require('./lib/sns-response')
const pullReq = require('./lib/pull-request')
const build = require('./lib/build')

exports.handler = (event, context) => {
  let message = snsResp.parse(event.Records[0].Sns.Message)
  pullReq.get(message)
    .then(prResp => {
      if (prResp.pullRequest.pullRequestStatus !== 'OPEN') return "CLOSED"
      return build.run(prResp)
        .then(buildResp => {
            return pullReq.post_comment(prResp, buildResp)
              .then(result => console.log(result))
        })
    })
    .catch(e => console.error(e))
}
