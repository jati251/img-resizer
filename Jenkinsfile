pipeline {
  agent any

  environment {
    IMAGE_NAME     = 'image-tool'
    CONTAINER_NAME = 'image-tool'
    TAG            = 'latest'
    REMOTE_USER    = 'jati'
    REMOTE_HOST    = '192.168.1.4'
    REMOTE_DIR     = '/home/jati/img-resizer'
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
              # This makes the script exit immediately if any command fails
              set -e

              echo "[INFO] Moving to project directory..."
              mkdir -p $REMOTE_DIR
              cd $REMOTE_DIR

              echo "[INFO] Pulling latest code..."
              if [ ! -d .git ]; then
                git clone https://github.com/jati251/img-resizer.git .
              else
                git pull
              fi

              echo "[INFO] Stopping container if it is running..."
              # UPDATE: Stop the container first. The "|| true" prevents an error if it does not exist.
              docker stop $CONTAINER_NAME || true

              echo "[INFO] Removing old container..."
              # UPDATE: Now safely remove the stopped container.
              docker rm -f $CONTAINER_NAME || true

              echo "[INFO] Cleaning up old images..."
              docker image rm -f $IMAGE_NAME:$TAG || true
              docker image prune -f

              echo "[INFO] Building new image..."
              docker build -t $IMAGE_NAME:$TAG .

              echo "[INFO] Running new container..."
              docker run -d --name $CONTAINER_NAME -p 5173:80 $IMAGE_NAME:$TAG
            '
          """
        }
      }
    }
  }
}
