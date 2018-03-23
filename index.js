'use strict'

const buildEvent = require('./lib/build-event')
const pullEvent = require('./lib/pull-event')

/**
  Detect which event type is received and route it to the correct handler
*/
exports.handler = (event, context, callback) => {
  if (event.source === "aws.codebuild" && event['detail-type'] === "CodeBuild Build State Change") {
    buildEvent.handle(event.detail)
      .then(result => {
        callback(null, result)
      })
      .catch(err => {
        console.log("error on buildEvent", event, err)
        callback(err, null)
      })
  } else if (event.source === "aws.codecommit" && event['detail-type'] === "CodeCommit Pull Request State Change") {
    pullEvent.handle(event.detail)
      .then(result => {
        callback(null, result)
      })
      .catch(err => {
        console.log("error on pullEvent", event, err)
        callback(err, null)
      })
  } else {
    console.log("unsupported event received", event)
    callback("unsupported event received:" + event['detail-type'], null)
  }
}
