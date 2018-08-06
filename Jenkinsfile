pipeline {
  agent any
  stages {
    stage('hello') {
      steps {
        git(url: 'https://github.com/eabasir/his-test.git', branch: env.BRANCH_NAME)
        sh '''set +x
echo "My secret is $MY_SECRET" >test.txt '''
      }
    }
    stage('cleaninig') {
      steps {
        deleteDir()
        cleanWs(cleanWhenAborted: true, cleanWhenFailure: true, cleanWhenNotBuilt: true, cleanWhenSuccess: true, cleanWhenUnstable: true, cleanupMatrixParent: true, deleteDirs: true)
      }
    }
  }
  environment {
    NODE_ENV = 'test'
    MY_SECRET = credentials('MY_SECRET')
  }
}