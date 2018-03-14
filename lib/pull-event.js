'use strict'
const AWS = require('aws-sdk')
const codebuild = new AWS.CodeBuild()

function startBuild(pull_detail) {
  return codebuild.startBuild({
    projectName: process.env.CODEBUILD_PROJECT_NAME,
    sourceVersion: pull_detail.sourceCommit,
    artifactsOverride: { type: 'NO_ARTIFACTS' },
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

function eventHandler(detail) {
  if (detail.pullRequestStatus !== 'Open') throw Error ("Not an open pull request")
  startBuild(detail).catch(e => console.error("Error creating CodeCommit comment", e, e.stack))
}

module.exports.handle = eventHandler
