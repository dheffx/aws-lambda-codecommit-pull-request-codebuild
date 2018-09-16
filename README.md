# AWS Pull Request Builder

## How it works

Lambda invoked by CloudWatch Events for CodeCommit and CodeBuild

codecommit pull request -> start codebuild

codebuild state change -> post comment to codecommit pull request

## Set up

requires serverless: `npm i -g serverless`

edit serverless.yml to set:

* AWSAccountId
* AWSRegion
* CodeCommitRepositoryName
* CodeBuildProjectName

```shell
npm install
sls webpack
sls deploy
```
