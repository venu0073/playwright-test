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

    stage('Run Playwright Tests') {

        steps {

            script {

                if (params.RUN_AZURE) {

                    bat """
                    npx playwright test ^
                    --config=playwright.service.config.js ^
                    --workers=${params.WORKERS}
                    """

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
}

}
