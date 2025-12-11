pipeline {
    agent any

    environment {
        
        DOCKER_USERNAME = 'abhijeet55'
        MANIFEST_GIT_REPO = 'https://github.com/Abhijeet4147/k8s-manifests.git'
        DOCKERHUB_CREDENTIALS = 'dockerhub-login'
        GIT_CREDENTIALS = 'github-git-creds'
    }
    stages {

        stage('build frontend image'){

                steps {
                    script {
                        def frontendImage = "${DOCKER_USERNAME}/frontend:${BUILD_NUMBER}"
                        sh "docker build -t ${frontendImage} ."

                        echo 'Pushing to DockerHub'
                        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'USERNAME',passwordVariable:'PASSWORD')]) {
                            sh 'echo $PASSWORD | docker login -u $USERNAME --password-stdin'
                            sh "docker push ${frontendImage}"
                        }
                        echo 'frontend image pushed successfully.'
                    }
                }

        }
        stage('Update Kubernetes Manifests'){

                steps {
                    script {
                        echo 'cloning manifest repository.'
                        sh "rm -rf k8s-repo" //remove the old folder if it exits 
                        sh "git clone ${MANIFEST_GIT_REPO} k8s-repo"
                        dir('k8s-repo'){
                            echo 'updating image tags in kubernetes manifests'

                            sh 'git config user.email "jenkins@bot.com"'
                            sh 'git config user.name "Jenkins Pipeline"'

                            //THIS UPDATE FRONTEND DEPLOYMENT
                            sh """
                            sed -i 's|image: .*/frontend:.*|image: ${DOCKER_USERNAME}/frontend:${BUILD_NUMBER}|g' \
                            k8s/charts/frontend/deployment.yaml
                            """

                            echo 'Committiog changes to manifest repo.'
                            sh 'git add .'
                            sh "git commit -m 'Update image tag to build ${BUILD_NUMBER}' || echo 'No changes to commit'"

                            withCredentials([usernamePassword(credentialsId:"${GIT_CREDENTIALS}",usernameVariable:'GIT_USERNAME',passwordVariable:'GIT_TOKEN')]){
                            sh """
                                git push https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/Abhijeet4147/k8s-manifests.git HEAD:main
                            """
                            }
                            echo 'Manifest repository updated.'
                        }
                    }
                }
            }
        }


        post {
            success {
                echo 'Pipeline completed successfully.Image build and manifest updated'
            }
            failure {
                echo 'Pipeline failed.'
            }
            always {
                echo 'cleaning up workspace.'
                cleanWs()
            }
        }

}