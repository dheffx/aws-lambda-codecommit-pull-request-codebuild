import AWS from 'aws-sdk'
const codebuild = new AWS.CodeBuild()

/**
* Pass the pull request information as environment variables
* They will be used by the build state change events to post comments
*/
exports.handler = async (event) => {
  try {
    return await codebuild.startBuild({
      projectName: process.env.CODEBUILD_PROJECT_NAME,
      sourceVersion: event.detail.sourceCommit,
      environmentVariablesOverride: [
        {
          name: 'CODECOMMIT_REPOSITORY_NAME',
          value: event.detail.repositoryNames[0],
          type: 'PLAINTEXT'
        },
        {
          name: 'CODECOMMIT_PULL_REQUEST_ID',
          value: event.detail.pullRequestId,
          type: 'PLAINTEXT'
        },
        {
          name: 'CODECOMMIT_SOURCE_COMMIT_ID',
          value: event.detail.sourceCommit,
          type: 'PLAINTEXT'
        },
        {
          name: 'CODECOMMIT_DESTINATION_COMMIT_ID',
          value: event.detail.destinationCommit,
          type: 'PLAINTEXT'
        }
      ]
    }).promise()
  } catch (e) {
    console.log("failed to start codebuild", e.message, e.stack)
    return e
  }
};
