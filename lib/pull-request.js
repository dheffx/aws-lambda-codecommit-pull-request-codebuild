const AWS = require('aws-sdk')
AWS.config.update({ region: 'us-east-2' })
const codecommit = new AWS.CodeCommit()

module.exports.get = (snsResponse) => {
    return codecommit.getPullRequest({ pullRequestId: snsResponse.pullRequestId }).promise()
}
