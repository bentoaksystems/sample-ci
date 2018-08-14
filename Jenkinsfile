pipeline {
  agent any
  stages {
    stage('clone repository') {
      parallel {
          stage('clone server') {
            steps {
              git(url: 'https://github.com/eabasir/his-test.git', branch: env.BRANCH_NAME)        
            }
          }
          stage('clone client') {
            steps {
              git(
                url: 'https://github.com/aminazar/his-client.git',
                credentialsId: 'GIT_CLIENT_CREDENTIALS' 
              )   
            }
          }
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
         }
      }
    }
    stage('tests') {
      steps {
        sh 'docker exec -i his-$BUILD_NUMBER sh -c "npm test"'
      }
    }
    stage('temprory publish') {
      when {
         not {
           branch 'master'
        }
      }
      steps {
          notifyBuild(currentBuild.result)
          sh 'sleep 1d'
      }
    }
    stage('deploy production') {
      when {
           branch 'master'
      }
      steps {
          sh 'sleep 1d'
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
    GIT_CLIENT_REPO = 'https://github.com/aminazar/his-client.git'
    DB_USER = credentials('DB_USER')
    DB_PASS = credentials('DB_PASS')
    GIT_CLIENT_CREDENTIALS = credentials('GIT_CLIENT_CREDENTIALS')
    APP_ADDRESS = sh(returnStdout: true, script: 'echo http://his-$BUILD_NUMBER:3000')
    DB_HOST = sh(returnStdout: true, script: 'echo db-$BUILD_NUMBER')
    REDIS_HOST = sh(returnStdout: true, script: 'echo redis-$BUILD_NUMBER')
  }
  post {
    always {
      sh 'chmod 777 ./scripts/cleanup.sh && sh ./scripts/cleanup.sh'
    }
    unstable {
            notifyBuild(currentBuild.result)
    }
        failure {
            notifyBuild(currentBuild.result)
    }


  }
}

def notifyBuild(String buildStatus = 'STARTED') {
  // build status of null means successful
  buildStatus =  buildStatus ?: 'SUCCESSFUL'
 
  // Default values
  def colorName = 'RED'
  def colorCode = '#FF0000'
  def serverPort = 80  +  (env.BUILD_NUMBER as int)
  def subject = "${buildStatus}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
  def summary = ""
  
  if(buildStatus == 'SUCCESSFUL')
    summary = "${subject} check logs on: ${env.BUILD_URL}consoleText \r App is accessible for 24h on: http://173.249.11.153:${serverPort}"
  else
    summary = "${subject} check logs on: ${env.BUILD_URL}consoleText"
  
  // Override default values based on build status
  if (buildStatus == 'STARTED') {
    color = 'YELLOW'
    colorCode = '#FFFF00'
  } else if (buildStatus == 'SUCCESSFUL') {
    color = 'GREEN'
    colorCode = '#00FF00'  
  } else {
    color = 'RED'
    colorCode = '#FF0000'
  } 
 
  // Send notifications
  slackSend (color: colorCode, message: summary)
}