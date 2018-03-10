{ 
    pullRequest: { 
        pullRequestId: '10',
        title: 'dddd',
        description: 'dddddddd',
        lastActivityDate: 2018-03-10T04:19:25.531Z,
        creationDate: 2018-03-10T03:42:10.072Z,
        pullRequestStatus: 'OPEN',
        authorArn: 'arn:aws:iam::1121212141:test',
        pullRequestTargets: [ 
            { 
                repositoryName: 'codecommit-pull-request-codebuild',
                sourceReference: 'refs/heads/test2',
                destinationReference: 'refs/heads/master',
                destinationCommit: '63944b7772a6e90a77a1b577fc8ffa9492364576',
                sourceCommit: 'be5f4a6a316f65d2310ca000b4690317e790d0e4',
                mergeMetadata: { isMerged: false } 
            } 
        ] 
        clientRequestToken: 'xxxxxx' 
    } 
}
