pipeline {
  agent any
  stages {
    stage('hello') {
      steps {
        git(url: 'https://github.com/eabasir/his-test.git', branch: env.BRANCH_NAME)
      }
    }
  }
  environment {
    NODE_ENV = 'test'
  }
}