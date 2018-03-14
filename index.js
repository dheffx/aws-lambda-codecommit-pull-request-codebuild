'use strict'

const buildEvent = require('./lib/build-event')
const pullEvent = require('./lib/pull-event')

/**
  Detect which event type is received and route it to the correct handler
*/
exports.handler = (event) => {
  try {
    if (event.source === "aws.codebuild" && event['detail-type'] === "CodeBuild Build State Change") {
      buildEvent.handle(event.detail)
    } else if (event.source === "aws.codecommit" && event['detail-type'] === "CodeCommit Pull Request State Change") {
      pullEvent.handle(event.detail)
    } else {
      console.error("unspecified event received", event.source, event["detail-type"])
    }
  } catch (e) {
    console.error(e)
  }
}
