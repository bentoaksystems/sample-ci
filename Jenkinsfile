pipeline {
  agent any
  stages {
    stage('hello') {
      steps {
        git(url: 'https://github.com/eabasir/his-test.git', branch: env.BRANCH_NAME)
        sh '''set +x
              printenv '''
      }
    }
  }
  environment {
    NODE_ENV = 'test'
    MY_SECRET     = credentials('MY_SECRET')
  }
}