# CI/CD Pipeline - AI Generation Prompt

## Project Overview
**Category:** Cloud & DevOps  
**Project Name:** {{projectName}}  
**Pipeline Platform:** {{pipelinePlatform}}  
**Deployment Target:** {{deploymentTarget}}

## Technical Requirements

### Core Technology Stack
{{#techStack}}
- {{.}}
{{/techStack}}

### Pipeline Components
- {{#hasSourceControl}}Source code management and branching strategy{{/hasSourceControl}}
- {{#hasBuild}}Automated build and compilation process{{/hasBuild}}
- {{#hasTesting}}Comprehensive testing pipeline (unit, integration, e2e){{/hasTesting}}
- {{#hasSecurity}}Security scanning and vulnerability assessment{{/hasSecurity}}
- {{#hasDeployment}}Multi-environment deployment automation{{/hasDeployment}}
- {{#hasMonitoring}}Pipeline monitoring and alerting{{/hasMonitoring}}

### Features to Implement
{{#featureFlags}}
- {{.}}
{{/featureFlags}}

## Detailed Implementation Instructions

### 1. Project Structure
Generate a complete CI/CD setup with the following structure:
```
{{projectName}}-cicd/
├── .github/workflows/          # GitHub Actions workflows
│   ├── ci.yml                 # Continuous Integration
│   ├── cd.yml                 # Continuous Deployment
│   ├── security-scan.yml      # Security scanning
│   ├── release.yml            # Release automation
│   └── cleanup.yml            # Environment cleanup
├── .gitlab-ci.yml             # GitLab CI configuration
├── azure-pipelines.yml        # Azure DevOps pipelines
├── jenkins/                   # Jenkins pipeline configs
│   ├── Jenkinsfile
│   ├── shared-library/
│   └── pipeline-scripts/
├── docker/                    # Container configurations
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
├── scripts/                   # Pipeline scripts
│   ├── build.sh
│   ├── test.sh
│   ├── deploy.sh
│   └── rollback.sh
├── config/                    # Environment configs
│   ├── dev.env
│   ├── staging.env
│   └── prod.env
└── docs/
    ├── pipeline-guide.md
    └── deployment-runbook.md
```

### 2. GitHub Actions Workflow

#### Continuous Integration Pipeline
```yaml
name: CI Pipeline
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '{{nodeVersion}}'
  {{#hasDocker}}
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
  {{/hasDocker}}

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Check formatting
        run: npm run format:check

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        run: npm audit --audit-level high
      
      - name: Run SAST scan
        uses: github/codeql-action/analyze@v2
        with:
          languages: javascript
      
      {{#hasDocker}}
      - name: Build Docker image for scanning
        run: docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest .
      
      - name: Run container security scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          format: 'sarif'
          output: 'trivy-results.sarif'
      {{/hasDocker}}

  build:
    needs: [lint-and-format, test, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/
          retention-days: 30

  {{#hasDocker}}
  docker-build:
    needs: [build]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
  {{/hasDocker}}
```

#### Continuous Deployment Pipeline
```yaml
name: CD Pipeline
on:
  workflow_run:
    workflows: ["CI Pipeline"]
    types: [completed]
    branches: [main]

jobs:
  deploy-staging:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: dist/
      
      {{#deploymentTarget}}
      {{#isVercel}}
      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
          scope: ${{ secrets.TEAM_ID }}
      {{/isVercel}}
      {{#isAWS}}
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      
      - name: Deploy to AWS
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET_STAGING }} --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID_STAGING }} --paths "/*"
      {{/isAWS}}
      {{/deploymentTarget}}
      
      - name: Run smoke tests
        run: |
          npm run test:smoke -- --url=${{ secrets.STAGING_URL }}

  deploy-production:
    needs: [deploy-staging]
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: dist/
      
      {{#deploymentTarget}}
      {{#isVercel}}
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./
          scope: ${{ secrets.TEAM_ID }}
      {{/isVercel}}
      {{#isAWS}}
      - name: Deploy to AWS Production
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET_PROD }} --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID_PROD }} --paths "/*"
      {{/isAWS}}
      {{/deploymentTarget}}
      
      - name: Create release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          draft: false
          prerelease: false
```

### 3. Multi-Platform Support

#### GitLab CI Configuration
```yaml
stages:
  - build
  - test
  - security
  - deploy

variables:
  NODE_VERSION: "{{nodeVersion}}"
  DOCKER_DRIVER: overlay2

cache:
  paths:
    - node_modules/
    - .npm/

before_script:
  - apt-get update -qq && apt-get install -y -qq git curl libelf1
  - npm ci --cache .npm --prefer-offline

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  only:
    - main
    - develop
    - merge_requests

test:unit:
  stage: test
  script:
    - npm run test:unit
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

security:sast:
  stage: security
  image: registry.gitlab.com/gitlab-org/security-products/semgrep:latest
  script:
    - semgrep --config=auto --json --output=sast-results.json .
  artifacts:
    reports:
      sast: sast-results.json
  allow_failure: true

deploy:staging:
  stage: deploy
  script:
    - echo "Deploying to staging environment"
    - ./scripts/deploy.sh staging
  environment:
    name: staging
    url: https://staging.{{projectName}}.com
  only:
    - develop

deploy:production:
  stage: deploy
  script:
    - echo "Deploying to production environment"
    - ./scripts/deploy.sh production
  environment:
    name: production
    url: https://{{projectName}}.com
  when: manual
  only:
    - main
```

#### Jenkins Pipeline
```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '{{nodeVersion}}'
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_NAME = '{{projectName}}'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup') {
            steps {
                script {
                    def nodeHome = tool 'NodeJS'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
                sh 'npm ci'
            }
        }
        
        stage('Lint & Format') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('Format Check') {
                    steps {
                        sh 'npm run format:check'
                    }
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:unit'
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'test-results.xml'
                            publishCoverage adapters: [
                                coberturaAdapter('coverage/cobertura-coverage.xml')
                            ]
                        }
                    }
                }
                stage('Integration Tests') {
                    steps {
                        sh 'npm run test:integration'
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'npm audit --audit-level high'
                script {
                    def scanResult = sh(
                        script: 'npm audit --json',
                        returnStdout: true
                    )
                    writeFile file: 'audit-results.json', text: scanResult
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
                archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: false
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        sh './scripts/deploy.sh production'
                    } else {
                        sh './scripts/deploy.sh staging'
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        failure {
            emailext (
                subject: "Pipeline Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Build failed. Check console output at ${env.BUILD_URL}",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
```

### 4. Deployment Scripts

#### Universal Deployment Script
```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-staging}
PROJECT_NAME="{{projectName}}"

echo "🚀 Deploying $PROJECT_NAME to $ENVIRONMENT environment..."

# Load environment-specific configuration
source "config/${ENVIRONMENT}.env"

# Pre-deployment health check
echo "🔍 Running pre-deployment checks..."
./scripts/health-check.sh

# Build and deploy based on target
case $DEPLOYMENT_TARGET in
    "vercel")
        echo "📦 Deploying to Vercel..."
        npx vercel --prod --confirm --token $VERCEL_TOKEN
        ;;
    "aws")
        echo "☁️ Deploying to AWS..."
        aws s3 sync dist/ s3://$S3_BUCKET --delete
        aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
        ;;
    "kubernetes")
        echo "🚢 Deploying to Kubernetes..."
        kubectl apply -f kubernetes/${ENVIRONMENT}/
        kubectl rollout status deployment/${PROJECT_NAME} -n ${ENVIRONMENT}
        ;;
    *)
        echo "❌ Unknown deployment target: $DEPLOYMENT_TARGET"
        exit 1
        ;;
esac

# Post-deployment verification
echo "✅ Running post-deployment tests..."
npm run test:smoke -- --url=$DEPLOYMENT_URL

echo "🎉 Deployment completed successfully!"
```

### 5. Quality Gates and Governance

#### Branch Protection Rules
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes to main branch

#### Code Quality Metrics
- Minimum test coverage: 80%
- Security vulnerability threshold: Medium
- Code duplication limit: 5%
- Technical debt ratio: < 5%

## Success Criteria
The generated CI/CD pipeline should:
1. ✅ Automatically build and test all code changes
2. ✅ Include comprehensive security scanning
3. ✅ Support multi-environment deployments
4. ✅ Provide rollback capabilities
5. ✅ Include monitoring and alerting
6. ✅ Maintain audit trails and compliance
7. ✅ Support parallel execution for speed

## Additional Notes
- Include proper secret management
- Implement proper error handling and notifications
- Support feature flags and canary deployments
- Include performance testing in the pipeline
- Document all pipeline processes and procedures

---
*Generated by Qoder Universal Prompt Generator on {{date.iso}}*