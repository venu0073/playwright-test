pipeline {

agent any

tools {
    nodejs 'NodeJS-24'
}

parameters {

    choice(
        name: 'ENV',
        choices: ['QA', 'UAT', 'PROD'],
        description: 'Select Environment'
    )

    choice(
        name: 'BROWSER',
        choices: ['chromium', 'firefox', 'webkit'],
        description: 'Select Browser'
    )

    booleanParam(
        name: 'RUN_AZURE',
        defaultValue: true,
        description: 'Run using Azure Playwright Workspace'
    )

    string(
        name: 'WORKERS',
        defaultValue: '4',
        description: 'Number of Playwright Workers'
    )
}

triggers {

    // Every weekday at 9 AM
    cron('H 9 * * 1-5')

    // Alternative examples:
    // cron('H/15 * * * *')   Every 15 minutes
    // cron('H 2 * * *')      Daily at 2 AM
    // cron('H H * * 0')      Every Sunday
}

options {

    timestamps()

    timeout(
        time: 90,
        unit: 'MINUTES'
    )

    buildDiscarder(
        logRotator(
            numToKeepStr: '20'
        )
    )
}

environment {

    PLAYWRIGHT_SERVICE_URL =
        credentials('PLAYWRIGHT_SERVICE_URL')

}

stages {

    stage('Cleanup Workspace') {

        steps {

            cleanWs()

        }

    }

    stage('Checkout Source') {

        steps {

            checkout scm

        }

    }

    stage('Verify Environment') {

        steps {

            bat 'node -v'
            bat 'npm -v'
            bat 'git --version'

        }

    }

    stage('Install Dependencies') {

        steps {

            bat 'npm ci'

        }

    }

    stage('Install Playwright Browsers') {

        steps {

            bat 'npx playwright install'

        }

    }
    stage('Azure Login') {
    steps {
        withCredentials([
            string(credentialsId: 'AZURE_CLIENT_ID', variable: 'AZURE_CLIENT_ID'),
            string(credentialsId: 'AZURE_CLIENT_SECRET', variable: 'AZURE_CLIENT_SECRET'),
            string(credentialsId: 'AZURE_TENANT_ID', variable: 'AZURE_TENANT_ID')
        ]) {

            bat """
            az login --service-principal ^
              --username %AZURE_CLIENT_ID% ^
              --password %AZURE_CLIENT_SECRET% ^
              --tenant %AZURE_TENANT_ID%
            """

            bat "az account show"
        }
    }
}

    stage('Run Playwright Tests') {

        steps {

            script {

                if (params.RUN_AZURE) {
                    catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                        bat """
                        npx playwright test ^
                        --config=playwright.service.config.js ^
                        --workers=${params.WORKERS}
                        """
                    }

                }
                else {

                    bat """
                    npx playwright test ^
                    --project=${params.BROWSER} ^
                    --workers=${params.WORKERS}
                    """

                }
            }
        }
    }

    stage('Archive Test Results') {

        steps {

            archiveArtifacts(
                artifacts: 'test-results/**/*',
                allowEmptyArchive: true
            )

        }

    }
    post {
    always {

        archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true

        publishHTML([
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'playwright-report',
            reportFiles: 'index.html',
            reportName: 'Playwright Report'
        ])
    }
}
}

}
