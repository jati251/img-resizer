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
    // STAGE 1: Checkout code on the Jenkins Agent
    // This stage uses your 'github-credentials' (like a Personal Access Token)
    // to check out the code into the Jenkins workspace. This is good practice.
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

    // STAGE 2: Deploy to the Remote Virtual Machine
    // This stage connects to your VM using an SSH key ('ssh-app') and
    // runs all the necessary commands to update and restart the application.
    stage('Deploy to VM dockerized-app') {
      steps {
        sshagent(credentials: ['ssh-app']) {
          sh """
  ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST '
    # Use "set -e" to make the script exit immediately if any command fails.
    set -e

    echo "[INFO] Ensuring SSH directory exists and GitHub is a known host..."
    mkdir -p -m 700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts

    echo "[INFO] Creating project directory if it does not exist..."
    mkdir -p $REMOTE_DIR
    cd $REMOTE_DIR

    echo "[INFO] Setting up git repository..."
    # If the .git directory doesn't exist, clone the repo using the SSH URL.
    if [ ! -d .git ]; then
      echo "[INFO] Cloning new repository..."
      git clone git@github.com:jati251/img-resizer.git .
    # If it already exists, ensure the remote URL is set to SSH and pull the latest changes.
    else
      echo "[INFO] Updating existing repository..."
      git remote set-url origin git@github.com:jati251/img-resizer.git
      git pull
    fi

    echo "[INFO] --- Docker Operations ---"

    echo "[INFO] Stopping old container (if running)..."
    docker stop ${CONTAINER_NAME} || true

    echo "[INFO] Removing old container (if exists)..."
    docker rm -f ${CONTAINER_NAME} || true

    echo "[INFO] Removing old image (if exists)..."
    docker image rm -f ${IMAGE_NAME}:${TAG} || true

    echo "[INFO] Pruning unused docker images..."
    docker image prune -f

    echo "[INFO] Building new Docker image..."
    docker build -t ${IMAGE_NAME}:${TAG} .

    echo "[INFO] Running new container..."
    docker run -d --name ${CONTAINER_NAME} -p 5173:80 ${IMAGE_NAME}:${TAG}

    echo "[INFO] --- Deployment Successful ---"
  '
"""
        }
      }
    }
  }
}
