# AWS Lambda for CodeCommit Pull Request to CodeBuild

A process to trigger a CodeBuild job when a CodeCommit pull request is made.

This is achieved by setting an CloudWatch Events on both
 - CodeCommit pull request state changes
 - CodeBuild build state changes

A lambda is created that subscribes to these events

On pull request, the CodeBuild job will be started, passing some environment variables
along with it that contain information about the pull request. These variables
are then used on build state changes to post comments back to the pull request.

When the build begins, its status and link to it are commented to the pull request.
On success, a comment will be written to that includes a link to the artifact produced, if it is an S3 artifact.
On failure, a snip of the logs from CloudWatch will be written as a comment back to the pull request.

## TLDR
```
export CODEBUILD_PROJECT_NAME=my-codebuild-project
export CODECOMMIT_REPOSITORY_NAME=my-codecommit-repo
export CLOUDFORMATION_STACK_NAME=my-stack-name
./formation/create

export LAMBDA_NAME=my-stack-name-lambda
npm run deploy
```

## CloudFormation
### Parameters
 * CODEBUILD_PROJECT_NAME
 * CODECOMMIT_REPOSITORY_NAME

### Create
```
CLOUDFORMATION_STACK_NAME=my-stack-name ./formation/create
```

### Update
```
CLOUDFORMATION_STACK_NAME=my-stack-name ./formation/update
```

## Lambda
### Environment Variables
 * CODEBUILD_PROJECT_NAME

### Required Permissions
 * codebuild:StartBuild
 * codecommit:PostCommentForPullRequest
 * logs:CreateLogGroup
 * logs:CreateLogStream
 * logs:GetLogEvents
 * logs:PutLogEvents

### Deploying
```
LAMBDA_NAME=<yournamehere> npm run deploy
```

## CodeBuild
### Environment Variables
Supplied to the job via Lambda

 * CODECOMMIT_REPOSITORY_NAME
 * CODECOMMIT_PULL_REQUEST_ID
 * CODECOMMIT_SOURCE_COMMIT_ID
 * CODECOMMIT_DESTINATION_COMMIT_ID

## Exercising it
 * Create a branch and push it to your CodeCommit repository
 * Create a pull request for that branch - this should trigger CodeBuild
 * Update that branch by pushing another change to it - this should also trigger CodeBuild
 * Close a pull request - this should NOT trigger CodeBuild

### Test buildspec example
By default it should be a successful CodeBuild job
Set an environment variable on the CodeBuild job of IS_TEST_FAILURE in order to force it to fail

### Dockerfile
Useful for making sure the lambda compiles for nodejs 6
```
docker build -t compile-lambda .
docker run compile-lambda
```

## Citations
https://github.com/tatums/pull-request-builder
I did not fork this repo directly, but I certainly used it to get started of how to pull this off, and then referred back to it as a resource (especially for the CloudFormation piece which I was not familiar with prior to this)

https://github.com/aws-samples/aws-codecommit-pull-request-utils
I found this when I was about halfway through to the point I am now. It works very similar to
my implementation, and I took the idea to go to CloudWatchLogs from her project.
