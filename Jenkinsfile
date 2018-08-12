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
            sh 'docker stop redis-$BUILD_NUMBER || docker stop db-$BUILD_NUMBER || docker stop his-$BUILD_NUMBER || docker ps -aq --no-trunc -f status=exited | xargs docker rm || echo containers stopped'
            sh 'docker rmi -f redis-$BUILD_NUMBER || docker rmi -f db-$BUILD_NUMBER || docker rmi -f his-$BUILD_NUMBER || docker rmi $(docker images -f "dangling=true" -q) || echo containers removed'
            deleteDir() /* clean up our workspace */
        }
  }
  environment {
    NODE_ENV = 'test'
    DB_USER = credentials('DB_USER')
    DB_PASS = credentials('DB_PASS')
  }
}