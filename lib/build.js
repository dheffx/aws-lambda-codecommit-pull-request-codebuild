const AWS = require('aws-sdk')
AWS.config.update({ region: 'us-east-2' });
const codebuild = new AWS.CodeBuild()

module.exports.run = (pullreq) => {
    console.log(pullreq)
    let pullRequest = pullreq.pullRequest
    if (pullRequest.pullRequestStatus !== 'OPEN') return "CLOSED"
    
    return codebuild.startBuild({
        projectName: process.env.CODEBUILD_PROJECT_NAME,
        artifactsOverride: { type: 'NO_ARTIFACTS' },
        environmentVariablesOverride: [
            {
                name: 'PULL_REQUEST_ID',
                value: pullRequest.pullRequestId,
                type: 'PLAINTEXT'
            },
            {
                name: 'SOURCE_COMMIT_ID',
                value: pullRequest.pullRequestTargets[0].sourceCommit,
                type: 'PLAINTEXT'
            }
        ],
        sourceVersion: pullRequest.pullRequestTargets.sourceReference
    }).promise()
}
