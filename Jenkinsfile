pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = "img-resizer"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    docker.image('node:24-alpine').inside {
                        sh 'npm ci'
                    }
                }
            }
        }

        stage('Quality Check') {
            parallel {
                stage('Lint') {
                    steps {
                        script {
                            docker.image('node:24-alpine').inside {
                                sh 'npm run lint'
                            }
                        }
                    }
                }
                stage('Type Check') {
                    steps {
                        script {
                            docker.image('node:24-alpine').inside {
                                sh 'npm run type-check'
                            }
                        }
                    }
                }
            }
        }

        stage('Build & Dockerize') {
            steps {
                script {
                    dockerImage = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                }
            }
        }

        stage('Cleanup') {
            steps {
                sh "docker image prune -f"
            }
        }
    }

    post {
        success {
            echo "Build and Dockerization successful!"
        }
        failure {
            echo "Pipeline failed. Please check logs."
        }
    }
}
