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
  environment {
    NODE_ENV = 'test'
    DB_USER = credentials('DB_USER')
    DB_PASS = credentials('DB_PASS')
  }
}