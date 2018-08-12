pipeline {
  agent any
  stages {
    stage('fetch') {
      steps {
        git(url: 'https://github.com/eabasir/his-test.git', branch: env.BRANCH_NAME)
      }
    }
    stage('build composer') {
      steps {
        sh 'npm install'
        sh 'node docker-compose-builder.js'
      }
    }
    stage('setup containers') {
      steps {
        sh 'docker-compose up'
      }
    }
  }
  post {
        always {
            sh 'docker stop redis-$BUILD_NUMBER db-$BUILD_NUMBER his-$BUILD_NUMBER'
            sh 'docker rmi -f redis-$BUILD_NUMBER db-$BUILD_NUMBER his-$BUILD_NUMBER'
            sh 'docker rmi $(docker images -f "dangling=true" -q)'
            deleteDir() /* clean up our workspace */
        }
  }
  environment {
    NODE_ENV = 'test'
    DB_USER = credentials('DB_USER')
    DB_PASS = credentials('DB_PASS')
  }
}