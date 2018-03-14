'use strict'
const AWS = require('aws-sdk')
const cloudwatchlogs = new AWS.CloudWatchLogs()
const codecommit = new AWS.CodeCommit()

function getLogEvents(groupName, streamName) {
  return cloudwatchlogs.getLogEvents({
    logGroupName: groupName,
    logStreamName: streamName,
    limit: 30,
    startFromHead: false
  }).promise()
}

function createComment(build_detail, buildenv) {
  //This will only exist in CodeBuild response
  let buildArn = build_detail['build-id']
  // Lefthand side is CodeBuild event, Righthand side is CodeCommit event
  let buildId = buildArn.split('/').pop()
  let buildStatus = build_detail['build-status']
  let url = `https://console.aws.amazon.com/codebuild/home?region=${process.env.AWS_REGION}#/builds/${buildId}/view/new`
  let content = `CodeBuild: **${buildStatus}**\n${url}`
  let logs = build_detail['additional-information'].logs
  let requestToken = buildArn + buildStatus;

  return new Promise((resolve, reject) => {
    if (isFailedBuild(buildStatus) && logs) {
      content += "<h1>Your branch has failed</h1>.\nYou must resolve the issue before the branch can be merged.\n"
      getLogEvents(logs['group-name'], logs['stream-name'])
        .then(logsResp => {
          let logLines = logsResp.events.map(event => event.message).join("")
          let log_content = "\n```\n" + logLines + "\n```\n"
          resolve(content + log_content)
        })
    } else {
      if (buildStatus === 'SUCCESS') content += "Build Complete"
      resolve(content)
    }
  }).then(comment => {
    codecommit.postCommentForPullRequest({
      afterCommitId: buildenv.CODECOMMIT_DESTINATION_COMMIT_ID,
      beforeCommitId: buildenv.CODECOMMIT_SOURCE_COMMIT_ID,
      content: comment,
      pullRequestId: buildenv.CODECOMMIT_PULL_REQUEST_ID,
      repositoryName: buildenv.CODECOMMIT_REPOSITORY_NAME
    }).promise()
  })
}

function isFailedBuild(buildStatus) {
  return (buildStatus !== 'IN_PROGRESS' &&
    buildStatus !== 'SUCCEEDED' &&
    buildStatus !== 'STOPPED')
}

function getEnv(vars) {
  let buildenv = {}
  for (let i = 0, len = vars.length; i < len; i++) {
    buildenv[vars[i].name] = vars[i].value
  }
  return buildenv
}

function eventHandler(detail) {
  let buildenv = getEnv(detail['additional-information'].environment['environment-variables'])
  if (!buildenv.CODECOMMIT_PULL_REQUEST_ID) throw Error("Not a pull request build")
  createComment(detail, buildenv)
}

module.exports.handle = eventHandler
