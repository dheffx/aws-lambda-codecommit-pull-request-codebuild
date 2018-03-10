# CodeCommit Pull Request to CodeBuild

A process to trigger a CodeBuild job when a CodeCommit pull request is made
This is achieved by setting an SNS notification on the CodeCommit project,
and subscribing the lambda to it that will start the build

## Example
 * Add project as a CodeCommit repository
 * Create CodeBuild job using the CodeCommit repository as a source
 * Create SNS topic on CodeCommit repository for pull request events
 * Create a Lambda function that subscribes to the SNS topic
 * Set the source of this project as the Lambda function

## Lambda
### Environment Variables
 * CODEBUILD_PROJECT_NAME

### Required Permissions
 * codecommit:GetPullRequest
 * codebuild:StartBuild

## Deploying
```
npm test
npm run zip
CODEBUILD_PROJECT_NAME=<yournamehere> npm run deploy
```

## Exercising it
 * Create a branch and push it to your CodeCommit repository
 * Create a pull request for that branch - this should trigger CodeBuild
 * Update that branch by pushing another change to it - this should also trigger CodeBuild
 * Close a pull request - this should NOT trigger CodeBuild

### Test example
By default it should be a successful CodeBuild job
Set an environment variable on the CodeBuild job of TEST_CASE=FAILURE in order to force it to fail

### Dockerfile
Useful for making sure the lambda compiles for nodejs 6
```
npm run tar
docker build -t compile-lambda .
docker run compile-lambda
```
