pipeline {
  agent any

  environment {
    IMAGE_NAME = "img-resizer"
    CONTAINER_NAME = "img-resizer-container"
    TAG = "latest"
    REMOTE_USER = "jati"        // change this
    REMOTE_HOST = "192.168.1.4" // change this
    REMOTE_DIR = "/home/jati/img-resizer" // or wherever on VM B
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
    stage('Deploy to VM B') {
      steps {
        sshagent(credentials: ['vm-b-ssh-pass']) {
          sh """
            ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST '
              mkdir -p $REMOTE_DIR &&
              cd $REMOTE_DIR &&
              if [ ! -d .git ]; then git clone https://github.com/jati251/img-resizer.git .; else git pull; fi &&
              docker rm -f $CONTAINER_NAME || true &&
              docker build -t $IMAGE_NAME:$TAG . &&
              docker run -d --name $CONTAINER_NAME -p 80:80 $IMAGE_NAME:$TAG
            '
          """
        }
      }
    }
  }
}
