const AWS = require('aws-sdk')
AWS.config.update({ region: 'us-east-2' })
const codecommit = new AWS.CodeCommit()

get = (snsResponse) => {
  return codecommit.getPullRequest({
    pullRequestId: snsResponse.pullRequestId
  }).promise()
}

post_comment = (pullreq, buildInfo) => {
  let region = process.env.AWS_REGION
  let url = `https://console.aws.amazon.com/codebuild/home?region=${region}#/builds/${buildInfo.build.id}/view/new`
  let content = "CodeBuild: " + buildInfo.build.buildStatus + "\n" + url
  return codecommit.postCommentForPullRequest({
    afterCommitId: pullreq.pullRequest.pullRequestTargets[0].destinationCommit,
    beforeCommitId: pullreq.pullRequest.pullRequestTargets[0].sourceCommit,
    content: content,
    pullRequestId: pullreq.pullRequest.pullRequestId,
    repositoryName: pullreq.pullRequest.pullRequestTargets[0].repositoryName,
  }).promise();
}

module.exports = {
    get: get,
    post_comment: post_comment
}
