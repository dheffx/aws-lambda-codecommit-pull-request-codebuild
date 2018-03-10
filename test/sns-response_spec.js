const expect = require('chai').expect
const SNSResponse = require('../lib/sns-response')

describe('parse', function() {
    it('pull request - new', function() {
        let message = 'A pull request event occurred in the following AWS CodeCommit repository: pull-request-cicd-test. arn:aws:iam::123333333:test made the following PullRequest 3. The pull request was created with the following information: Pull Request ID as 3 and title as Test #3. For more information, go to the AWS CodeCommit console https://us-east-2.console.aws.amazon.com/codecommit/home?region=us-east-2#/repository/pull-request-cicd-test/pull-request/3'
        let expected = {
            initiatorArn: 'arn:aws:iam::123333333:test',
            projectName: 'pull-request-cicd-test',
            pullRequestId: '3',
            stateIndicator: 'made'
        }
        let actual = SNSResponse.parse(message)
        expect(actual).to.deep.equal(expected)
    })
    it('pull request - update', function() {
        let message = 'A pull request event occurred in the following AWS CodeCommit repository: pull-request-cicd-test. arn:aws:iam::123333333:test updated the following PullRequest 2. The pull request merge status has been updated. The status is merged. For more information, go to the AWS CodeCommit console https://us-east-2.console.aws.amazon.com/codecommit/home?region=us-east-2#/repository/pull-request-cicd-test/pull-request/2'
        let expected = {
            initiatorArn: 'arn:aws:iam::123333333:test',
            projectName: 'pull-request-cicd-test',
            pullRequestId: '2',
            stateIndicator: 'updated'
        }
        let actual = SNSResponse.parse(message)
        expect(actual).to.deep.equal(expected)
    })
})
