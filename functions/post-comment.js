import AWS from 'aws-sdk'
const cloudwatchlogs = new AWS.CloudWatchLogs()
const codecommit = new AWS.CodeCommit()

exports.handler = async (event) => {
  const buildenv = getEnv(event.detail['additional-information'].environment['environment-variables'])
  if (!buildenv.CODECOMMIT_PULL_REQUEST_ID) {
    return "Not a pull request build"
  }
  try {
    const requestToken = event.detail['build-id'] + event.detail['build-status']
    const comment = await createComment(event.detail, buildenv)
    return await codecommit.postCommentForPullRequest({
      afterCommitId: buildenv.CODECOMMIT_DESTINATION_COMMIT_ID,
      beforeCommitId: buildenv.CODECOMMIT_SOURCE_COMMIT_ID,
      clientRequestToken: requestToken,
      content: comment,
      pullRequestId: buildenv.CODECOMMIT_PULL_REQUEST_ID,
      repositoryName: buildenv.CODECOMMIT_REPOSITORY_NAME
    }).promise()
  } catch (e) {
    console.log("error posting build status to pull request", e.message, e.stack)
    return e
  }
}

/**
* Mark up the build event details into a comment to be posted on the pull request
*
* If the build failed, get the logs from CloudWatchLogs
* If the build succeeded, post links to the artifacts
*/
// eslint-disable-next-line max-statements
async function createComment(detail, buildenv) {
  let buildArn = detail['build-id']
  let buildId = buildArn.split('/').pop()
  let buildStatus = detail['build-status']
  let url = `https://console.aws.amazon.com/codebuild/home?region=${process.env.AWS_REGION}#/builds/${buildId}/view/new`
  let comment = `# Pull Request Builder\n\n**${buildStatus}**\n\n${url}\n\nSource Commit: ${buildenv.CODECOMMIT_SOURCE_COMMIT_ID}`
  let logs = detail['additional-information'].logs
  let artifact = detail['additional-information'].artifact
  try {
    if (isFailedBuild(buildStatus) && logs) {
      comment += "\n\nYou must resolve the issue before the branch can be merged.\n\n"
      try {
        const logLines = await getLogEvents(logs['group-name'], logs['stream-name'])
                                .events.map(event => event.message).join("")
        comment += "\n```\n" + logLines + "\n```\n"
      } catch (e) {
        console.log("Failed to retrieve log events", e)
        comment += `\nFailed to retrieve log events: ${e.message}`
      }
    } else if (buildStatus === 'SUCCEEDED' && hasS3Artifact(artifact)) {
      comment += "\n\n## Results\n\nArtifact: " + getArtifactUrl(artifact)
    }
  } catch (e) {
    comment += `Error creating comment text:\n${e.message}\n\n${e.stack}`
  }
  return comment
}

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
  return artifact.location.split(':')[5]
}

function hasS3Artifact(artifact) {
  return artifact.location.substr(0, 10) === 'arn:aws:s3'
}

function getArtifactUrl(artifact) {
  let s3_artifact = getS3Artifact(artifact)
  return `https://s3.console.aws.amazon.com/s3/buckets/${s3_artifact}/?region=${process.env.AWS_REGION}&tab=overview`
}
