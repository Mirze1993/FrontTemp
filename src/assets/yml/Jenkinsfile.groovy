pipeline {
    environment {
        dockerimagename = "mirze1993/front-temp-ui:B${BUILD_NUMBER}"
        dockerImage = ""
    }
    agent any

    stages {
        stage('Hello') {
            steps {
                echo 'Start'
            }
        }
        stage('Checkout Source') {
            steps {
                git credentialsId: 'github',branch: 'main', url: 'https://github.com/Mirze1993/FrontTemp.git'
            }
        }


        stage('Build image') {
            steps{
                // sh "sed -i 's/5193/5010/' src/assets/env/url-env.json"
                // sh "sed -i 's/7225/4444/' src/assets/env/url-env.json"
                // sh "sed -i 's/4205/4204/' src/assets/env/url-env.json"
                // sh "sed -i 's/https/http/' src/assets/env/url-env.json"
                // sh "cat src/assets/env/url-env.json"
                script {
                    dockerImage = docker.build("${dockerimagename}", "-f src/Dockerfile .")
                }
            }
        }

        stage('Pushing Image') {
            environment {
                registryCredential = 'dockerhub'
            }
            steps{
                script {
                    docker.withRegistry( 'https://registry.hub.docker.com', registryCredential ) {
                        dockerImage.push("B${BUILD_NUMBER}")
                    }
                }
            }
       }
    //   stage ('Run'){
    //         steps{
    //             script{
    //                 docker.image(dockerimagename).withRun('-p :80:4204'){
    //                     echo "Running tests against MySQL on port 4204"
    //                 }
    //             }
    //         }

    //     }

        stage('docker compose up'){
            steps{
                sh "docker compose -f src/assets/yml/docker-compose.yaml down"
                sh "docker compose -f src/assets/yml/docker-compose.yaml up -d"
            }
        }



    }
}
