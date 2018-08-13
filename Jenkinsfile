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
    APP_ADDRESS = 'http://173.249.11.153'
    PORT = '3000'
    DATABASE = 'his'
    DB_PORT = 5432
    REDIS_PORT = 6379
    DB_USER = credentials('DB_USER')
    DB_PASS = credentials('DB_PASS')
    DB_HOST = sh(returnStdout: true, script: 'echo db-$BUILD_NUMBER')
    REDIS_HOST = sh(returnStdout: true, script: 'echo redis-$BUILD_NUMBER')
  }
  post {
    always {
      sh 'docker stop redis-$BUILD_NUMBER || echo "failed to stop redis-${BUILD_NUMBER}"'
      sh 'docker stop db-$BUILD_NUMBER || echo "failed to stop db-${BUILD_NUMBER}"'
      sh 'docker stop his-$BUILD_NUMBER || echo "failed to stop his-${BUILD_NUMBER}"'
      sh 'docker ps -aq --no-trunc -f status=exited | xargs docker rm || echo "failed to remove stopped containers"'
      sh 'docker rmi -f redis-$BUILD_NUMBER || echo "failed to remove redis-${BUILD_NUMBER}"'
      sh 'docker rmi -f db-$BUILD_NUMBER || echo "failed to remove db-${BUILD_NUMBER}"'
      sh 'docker rmi -f his-$BUILD_NUMBER || echo "failed to remove his-${BUILD_NUMBER}"'

    }

  }
}