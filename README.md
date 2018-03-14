# AWS Lambda for CodeCommit Pull Request to CodeBuild

A process to trigger a CodeBuild job when a CodeCommit pull request is made
This is achieved by setting an CloudWatch Event on the CodeCommit project for pull requests,
and subscribing the lambda to it that will start the build

A status and link are commented to the pull request when the build begins,
and a success/failure comment is added after the build

## Setup
 * Add project as a CodeCommit repository
 * Create a CodeBuild project using the CodeCommit repository as a source
 * Create a CloudWatch Event on the CodeCommit repository for pull request state change events
 * Create a CloudWatch Event on the CodeBuild project for build state change events
 * Create a Lambda function that subscribes to both of the CloudWatch Events
 * Set the source of this project as the Lambda function

## Lambda
### Environment Variables
 * CODEBUILD_PROJECT_NAME

### Required Permissions
 * codebuild:StartBuild
 * codecommit:PostCommentForPullRequest

## CodeBuild
### Environment Variables
Supplied to the job via Lambda

 * CODECOMMIT_REPOSITORY_NAME
 * CODECOMMIT_PULL_REQUEST_ID
 * CODECOMMIT_SOURCE_COMMIT_ID
 * CODECOMMIT_DESTINATION_COMMIT_ID

## Deploying
```
LAMBDA_NAME=<yournamehere> npm run deploy
```

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
