# AWS Lambda for CodeCommit Pull Request to CodeBuild

A process to trigger a CodeBuild job when a CodeCommit pull request is made
This is achieved by setting an CloudWatch Event on the CodeCommit project for pull requests,
and subscribing the lambda to it that will start the build

A status and link are commented to the pull request when the build begins,
and a success/failure comment is added after the build

## TLDR
```
export CODEBUILD_PROJECT_NAME=my-codebuild-project
export CODECOMMIT_REPOSITORY_NAME=my-codecommit-repo
export CLOUDFORMATION_STACK_NAME=my-stack-name
export LAMBDA_NAME=my-stack-name-pullrequest-builder
./formation/create
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
The lambda created will be of the same name as the stack, with a suffix of "-pullrequest-builder"

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

## Known issues

Currently, there does not seem (that I can find) to be a way to make the CloudWatch Event for CodeBuild
specify a specific resource, so the event triggers on any CodeBuild job.

I opened this thread https://forums.aws.amazon.com/thread.jspa?threadID=276055 maybe by the time you read this there will be a solution.

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
