'use strict';
const assert = require('assert');
const AWS = require('aws-sdk')
const codecommit = new AWS.CodeCommit()
const codebuild = new AWS.CodeBuild()
const codeCommitSNSRegex = /CodeCommit repository:.*?(?:made|updated) the following PullRequest (\d+)\./

exports.handler = (event, context) => {
    let pullRequestId = codeCommitSNSRegex.exec(event.Records[0].Sns.Message)[1]
    assert.notEqual(pullRequestId, undefined)
    codecommit.getPullRequest({
      pullRequestId: pullRequestId
    }).promise().then(pullRequestResponse => {
      let pullRequest = pullRequestResponse.pullRequest
      if (pullRequest.pullRequestStatus !== 'OPEN') return
      let target = pullRequest.pullRequestTargets[0]
      return build(pullRequest.pullRequestId, target)
        .then(buildResponse => {
          return postComment(pullRequest.pullRequestId, target, buildResponse.build)
        })
    }).catch(e => console.error(e))
}

function postComment(pullRequestId, target, build) {
  let url = `https://console.aws.amazon.com/codebuild/home?region=${process.env.AWS_REGION}#/builds/${build.id}/view/new`
  let content = "CodeBuild: " + build.buildStatus + "\n" + url
  return codecommit.postCommentForPullRequest({
    afterCommitId: target.destinationCommit,
    beforeCommitId: target.sourceCommit,
    content: content,
    pullRequestId: pullRequestId,
    repositoryName: target.repositoryName
  }).promise();
}

function build(pullRequestId, target) {
  return codebuild.startBuild({
    projectName: process.env.CODEBUILD_PROJECT_NAME,
    artifactsOverride: { type: 'NO_ARTIFACTS' },
    environmentVariablesOverride: [
      {
        name: 'CODECOMMIT_REPOSITORY_NAME',
        value: target.repositoryName,
        type: 'PLAINTEXT'
      },
      {
        name: 'CODECOMMIT_PULL_REQUEST_ID',
        value: pullRequestId,
        type: 'PLAINTEXT'
      },
      {
        name: 'CODECOMMIT_SOURCE_COMMIT_ID',
        value: target.sourceCommit,
        type: 'PLAINTEXT'
      },
      {
        name: 'CODECOMMIT_DESTINATION_COMMIT_ID',
        value: target.destinationCommit,
        type: 'PLAINTEXT'
      }
    ],
    sourceVersion: target.sourceCommit
  }).promise()
}
