pipeline {
  agent any

  environment {
    IMAGE_NAME = 'image-tool'                    // standardized image name
    CONTAINER_NAME = 'image-tool'                // standard container name
    TAG = 'latest'
    REMOTE_USER = 'jati'
    REMOTE_HOST = '192.168.1.4'
    REMOTE_DIR = '/home/jati/img-resizer'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout([$class: 'GitSCM',
            userRemoteConfigs: [[
                url: 'https://github.com/jati251/img-resizer.git',
                credentialsId: 'github-credentials'
            ]],
            branches: [[name: '*/master']]
        ])
      }
    }

    stage('Deploy to VM dockerized-app') {
      steps {
        sshagent(credentials: ['ssh-app']) {
          sh """
            ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST '
              set -e

              mkdir -p $REMOTE_DIR &&
              cd $REMOTE_DIR &&

              if [ ! -d .git ]; then
                git clone https://github.com/jati251/img-resizer.git .
              else
                git pull
              fi &&

              docker rm -f $CONTAINER_NAME || true &&
              docker image rm -f $IMAGE_NAME:$TAG || true &&
              docker image prune -f &&
              docker build -t $IMAGE_NAME:$TAG . &&
              docker run -d --name $CONTAINER_NAME -p 5173:80 $IMAGE_NAME:$TAG
            '
          """
        }
      }
    }
  }
}
