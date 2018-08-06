pipeline {
  agent any
  stages {
    stage('hello') {
      steps {
        git(url: 'https://github.com/eabasir/his-test.git', branch: env.BRANCH_NAME)
        sh 'echo "My secret is $some-secret-id"'
      }
    }
  }
  environment {
    NODE_ENV = 'test'
  }
}