'use strict'
const AWS = require('aws-sdk')
const codebuild = new AWS.CodeBuild()

/**
* Pass the pull request information as environment variables
* They will be used by the build state change events to post comments
*/
function startBuild(pull_detail) {
  return codebuild.startBuild({
    projectName: process.env.CODEBUILD_PROJECT_NAME,
    sourceVersion: pull_detail.sourceCommit,
    environmentVariablesOverride: [
      {
        name: 'CODECOMMIT_REPOSITORY_NAME',
        value: pull_detail.repositoryNames[0],
        type: 'PLAINTEXT'
      },
      {
        name: 'CODECOMMIT_PULL_REQUEST_ID',
        value: pull_detail.pullRequestId,
        type: 'PLAINTEXT'
      },
      {
        name: 'CODECOMMIT_SOURCE_COMMIT_ID',
        value: pull_detail.sourceCommit,
        type: 'PLAINTEXT'
      },
      {
        name: 'CODECOMMIT_DESTINATION_COMMIT_ID',
        value: pull_detail.destinationCommit,
        type: 'PLAINTEXT'
      }
    ]
  }).promise()
}

module.exports.handle = (detail) => {
  if (detail.pullRequestStatus !== 'Open') console.log("Not an open pull request")
  else startBuild(detail).catch(e => console.error("Error starting CodeBuild", e, e.stack))
}
