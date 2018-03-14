'use strict'
const AWS = require('aws-sdk')
const cloudwatchlogs = new AWS.CloudWatchLogs()
const codecommit = new AWS.CodeCommit()

/**
* Fetch the most recent logs from CloudWatchLogs
*/
function getLogEvents(groupName, streamName) {
  return cloudwatchlogs.getLogEvents({
    logGroupName: groupName,
    logStreamName: streamName,
    limit: 30,
    startFromHead: false
  }).promise()
}

/**
* Mark up the build event details into a comment to be posted on the pull request
*
* If the build failed, get the logs from CloudWatchLogs
* If the build succeeded, post links to the artifacts
*/
function createComment(build_detail, buildenv) {
  let buildArn = build_detail['build-id']
  let buildId = buildArn.split('/').pop()
  let buildStatus = build_detail['build-status']
  let url = `https://console.aws.amazon.com/codebuild/home?region=${process.env.AWS_REGION}#/builds/${buildId}/view/new`
  let base_content = `# CodeBuild\n\n**${buildStatus}**\n\n${url}\n\nSource Commit: ${buildenv.CODECOMMIT_SOURCE_COMMIT_ID}`
  let logs = build_detail['additional-information'].logs
  let requestToken = buildArn + buildStatus

  return new Promise((resolve, reject) => {
    if (isFailedBuild(buildStatus) && logs) {
      let failed_content = "\n\nYou must resolve the issue before the branch can be merged.\n\n"
      getLogEvents(logs['group-name'], logs['stream-name'])
        .then(logsResp => {
          let logLines = logsResp.events.map(event => event.message).join("")
          let log_content = "\n```\n" + logLines + "\n```\n"
          resolve(base_content + failed_content + log_content)
        })
    } else if (buildStatus === 'SUCCEEDED') {
      let s3_artifact = getS3Artifact(build_detail['additional-information'].artifact)
      let s3_url = `https://s3.console.aws.amazon.com/s3/buckets/${s3_artifact}/?region=${process.env.AWS_REGION}&tab=overview`
      let success_content = "\n\n## Build Results\n\nArtifact: " + s3_url
      resolve(base_content + success_content)
    } else {
      resolve(base_content)
    }
  }).then(comment => {
    codecommit.postCommentForPullRequest({
      afterCommitId: buildenv.CODECOMMIT_DESTINATION_COMMIT_ID,
      beforeCommitId: buildenv.CODECOMMIT_SOURCE_COMMIT_ID,
      clientRequestToken: requestToken,
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

/**
* Translate the environment variable list into a dict
*/
function getEnv(vars) {
  let buildenv = {}
  for (let i = 0, len = vars.length; i < len; i++) {
    buildenv[vars[i].name] = vars[i].value
  }
  return buildenv
}

/**
* Pull the s3 artifact from the artifact location
* Ex) arn:aws:s3:::aws-pullreq-cicd-test/7c6ec574-1e4f-4843-8892-c4dd45fad4a7/artifact
*/
function getS3Artifact(artifact) {
  return artifact.location.split(':').slice(5)
}

module.exports.handle = (detail) => {
  let buildenv = getEnv(detail['additional-information'].environment['environment-variables'])
  if (!buildenv.CODECOMMIT_PULL_REQUEST_ID) console.log("Not a pull request build")
  else createComment(detail, buildenv)
}
