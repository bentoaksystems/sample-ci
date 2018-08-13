pipeline {
  agent any
  stages {
    stage('clone repository') {
      steps {
        git(url: 'https://github.com/eabasir/his-test.git', branch: env.BRANCH_NAME)
      }
    }
    stage('build composer') {
      steps {
        sh 'npm install'
        sh 'node ./scripts/docker-compose-builder.js'
      }
    }
    stage('run server') {
      steps {
        sh 'docker-compose up -d'
      }
    }
    stage('warm up') {
      steps {
        timeout(time: 20, unit: 'SECONDS') {

          sh 'echo  "`wget -qO- http://localhost:$((80 + BUILD_NUMBER))/api/ready`"'
          // waitUntil {
          //   script {
          //     def r = sh script: 'wget -q http://localhost:$((80 + BUILD_NUMBER))/api/ready -O /dev/null', returnStatus: true
          //     return (r == 0);
          //   }
          // }
        }
      }
    }
    stage('tests') {
      steps {
        sh 'docker exec -i his-$BUILD_NUMBER sh -c "npm test"'
      }
    }
  }
  environment {
    NODE_ENV = 'test'
    APP_NAME = 'HIS'
    PORT = '3000'
    DATABASE = 'his'
    DB_PORT = 5432
    REDIS_PORT = 6379
    DB_USER = credentials('DB_USER')
    DB_PASS = credentials('DB_PASS')
    APP_ADDRESS = sh(returnStdout: true, script: 'echo http://his-$BUILD_NUMBER:3000')
    DB_HOST = sh(returnStdout: true, script: 'echo db-$BUILD_NUMBER')
    REDIS_HOST = sh(returnStdout: true, script: 'echo redis-$BUILD_NUMBER')
  }
  post {
    always {
      sh 'chmod 777 ./scripts/cleanup.sh && sh ./scripts/cleanup.sh'
    }

  }
}