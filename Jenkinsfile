pipeline {
  agent any
  stages {
    stage('hello') {
      steps {
        git(url: 'https://github.com/eabasir/his-test.git', branch: env.BRANCH_NAME)
        sh 'set +x /r echo "My secret is $MY_SECRET"'
      }
    }
  }
  environment {
    NODE_ENV = 'test'
  }
}