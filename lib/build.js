const AWS = require('aws-sdk')
const codebuild = new AWS.CodeBuild()

module.exports.run = (pullreq) => {
    let pullRequest = pullreq.pullRequest
    let target = pullRequest.pullRequestTargets[0]
    return codebuild.startBuild({
        projectName: process.env.CODEBUILD_PROJECT_NAME,
        artifactsOverride: { type: 'NO_ARTIFACTS' },
        environmentVariablesOverride: [
            {
                name: 'REPOSITORY_NAME',
                value: target.repositoryName,
                type: 'PLAINTEXT'
            },
            {
                name: 'PULL_REQUEST_ID',
                value: pullRequest.pullRequestId,
                type: 'PLAINTEXT'
            },
            {
                name: 'BEFORE_COMMIT_ID',
                value: target.sourceCommit,
                type: 'PLAINTEXT'
            },
            {
                name: 'AFTER_COMMIT_ID',
                value: target.destinationCommit,
                type: 'PLAINTEXT'
            }
        ],
        sourceVersion: target.sourceReference.split("/")[2]
    }).promise()
}
