const codeCommitSNSRegex = /CodeCommit repository: (.*?)\. (.*?) (made|updated) the following PullRequest (\d+)\./

module.exports.parse = (message) => {
    let match = codeCommitSNSRegex.exec(message)
    return {
        projectName: match[1],
        initiatorArn: match[2],
        stateIndicator: match[3],
        pullRequestId: match[4]
    }
}
