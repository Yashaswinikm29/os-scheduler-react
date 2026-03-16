pipeline {
    agent any

    environment {
        APP_NAME = 'os-scheduler'
        WAR_FILE = "target\\os-scheduler.war"
        TOMCAT   = "C:\\tomcat\\webapps"
    }

    triggers {
        githubPush()
    }

    stages {

        stage('Checkout') {
            steps {
                echo '==============================='
                echo ' STAGE 1: Cloning from GitHub'
                echo '==============================='
                checkout scm
                echo "Branch: ${env.GIT_BRANCH}"
                echo "Commit: ${env.GIT_COMMIT}"
            }
        }

        stage('Build') {
            steps {
                echo '==============================='
                echo ' STAGE 2: Maven Build'
                echo '==============================='
                bat 'mvn clean compile -B'
            }
            post {
                success { echo 'Build successful' }
                failure { echo 'Build failed' }
            }
        }

        stage('Test') {
            steps {
                echo '==============================='
                echo ' STAGE 3: Running JUnit Tests'
                echo '==============================='
                bat 'mvn test -B'
            }
            post {
                always {
                    junit 'target/surefire-reports/*.xml'
                }
                success { echo 'All tests passed' }
                failure { echo 'Tests failed'; error('Test failure') }
            }
        }

        stage('Package') {
            steps {
                echo '==============================='
                echo ' STAGE 4: Packaging WAR File'
                echo '==============================='
                bat 'mvn package -DskipTests -B'
                echo "WAR generated: ${env.WAR_FILE}"
            }
        }

        stage('Validate') {
            steps {
                echo '==============================='
                echo ' STAGE 5: Validating WAR'
                echo '==============================='
                bat "if exist target\\os-scheduler.war (echo WAR validation passed) else (exit 1)"
            }
        }

        stage('Deploy to DEV') {
            steps {
                echo '==============================='
                echo ' STAGE 6: Deploying to DEV'
                echo '==============================='
                bat "copy /Y target\\os-scheduler.war \"C:\\tomcat\\webapps\\os-scheduler-DEV.war\""
                echo 'Deployed to DEV environment'
            }
        }

        stage('Deploy to TEST') {
            steps {
                echo '==============================='
                echo ' STAGE 7: Deploying to TEST'
                echo '==============================='
                bat "copy /Y target\\os-scheduler.war \"C:\\tomcat\\webapps\\os-scheduler-TEST.war\""
                echo 'Deployed to TEST environment'
            }
        }

        stage('Deploy to PROD') {
            input {
                message "Deploy to PRODUCTION?"
                ok "Yes, deploy"
            }
            steps {
                echo '==============================='
                echo ' STAGE 8: Deploying to PROD'
                echo '==============================='
                bat "copy /Y target\\os-scheduler.war \"C:\\tomcat\\webapps\\os-scheduler-PROD.war\""
                echo 'Deployed to PROD environment'
            }
        }
    }

    post {
        success {
            echo '============================================'
            echo ' PIPELINE COMPLETE - All stages passed!'
            echo '============================================'
        }
        failure {
            echo '============================================'
            echo ' PIPELINE FAILED - Check logs above'
            echo '============================================'
        }
        always {
            echo "Build #${env.BUILD_NUMBER} finished"
        }
    }
}
