'use strict'
const AWS = require('aws-sdk')
const codecommit = new AWS.CodeCommit()
const codebuild = new AWS.CodeBuild()

exports.handler = (event, context) => {
    let pullreq = event.detail
    if (pullreq.pullRequestStatus !== 'Open') return
    build(pullreq)
      .then(buildResponse => {
        return postComment(pullreq, buildResponse.build)
      })
      .catch(e => console.error(e))
}

function postComment(pullreq, build) {
  let url = `https://console.aws.amazon.com/codebuild/home?region=${process.env.AWS_REGION}#/builds/${build.id}/view/new`
  let content = "CodeBuild: " + build.buildStatus + "\n" + url
  return codecommit.postCommentForPullRequest({
    afterCommitId: pullreq.destinationCommit,
    beforeCommitId: pullreq.sourceCommit,
    content: content,
    pullRequestId: pullreq.pullRequestId,
    repositoryName: pullreq.repositoryNames[0]
  }).promise()
}

function build(pullreq) {
  return codebuild.startBuild({
    projectName: process.env.CODEBUILD_PROJECT_NAME,
    artifactsOverride: { type: 'NO_ARTIFACTS' },
    environmentVariablesOverride: [
      {
        name: 'CODECOMMIT_REPOSITORY_NAME',
        value: pullreq.repositoryNames[0],
        type: 'PLAINTEXT'
      },
      {
        name: 'CODECOMMIT_PULL_REQUEST_ID',
        value: pullreq.pullRequestId,
        type: 'PLAINTEXT'
      },
      {
        name: 'CODECOMMIT_SOURCE_COMMIT_ID',
        value: pullreq.sourceCommit,
        type: 'PLAINTEXT'
      },
      {
        name: 'CODECOMMIT_DESTINATION_COMMIT_ID',
        value: pullreq.destinationCommit,
        type: 'PLAINTEXT'
      }
    ],
    sourceVersion: pullreq.sourceCommit
  }).promise()
}
