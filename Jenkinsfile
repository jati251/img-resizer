pipeline {
  agent any

  environment {
    IMAGE_NAME = 'image-tool'
    CONTAINER_NAME = 'image-tool'
    TAG = 'latest'
    REMOTE_USER = 'jati'
    REMOTE_HOST = '192.168.1.200'
    REMOTE_DIR = '/home/jati/img-resizer'
    REPO_URL = 'https://github.com/jati251/img-resizer.git'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Deploy to VM') {
      steps {
        sshagent(credentials: ['ssh-app']) {
          sh """
            ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "
              set -e
              mkdir -p $REMOTE_DIR
              cd $REMOTE_DIR

              if [ ! -d .git ]; then
                git clone $REPO_URL .
              else
                git remote set-url origin $REPO_URL
                git fetch origin master
                git reset --hard origin/master
              fi

              docker stop $CONTAINER_NAME || true
              docker rm $CONTAINER_NAME || true
              docker build -t $IMAGE_NAME:$TAG .
              docker run -d --restart always --name $CONTAINER_NAME -p 5173:80 $IMAGE_NAME:$TAG
              docker image prune -f
            "
          """
        }
      }
    }
  }

  post {
    success {
      echo "Build and Deployment successful!"
    }
    failure {
      echo "Pipeline failed. Please check logs."
    }
  }
}
