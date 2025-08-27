# Infrastructure as Code (IaC) - AI Generation Prompt

## Project Overview
**Category:** Cloud & DevOps  
**Project Name:** {{projectName}}  
**Cloud Provider:** {{cloudProvider}}  
**Environment:** {{environment}}

## Technical Requirements

### Core Technology Stack
{{#techStack}}
- {{.}}
{{/techStack}}

### Infrastructure Components
- {{#hasCompute}}Virtual machines, containers, or serverless compute{{/hasCompute}}
- {{#hasStorage}}Object storage, block storage, and database storage{{/hasStorage}}
- {{#hasNetworking}}VPC, subnets, load balancers, and security groups{{/hasNetworking}}
- {{#hasMonitoring}}Logging, metrics, and alerting infrastructure{{/hasMonitoring}}
- {{#hasSecurity}}IAM roles, encryption, and security policies{{/hasSecurity}}

### Features to Implement
{{#featureFlags}}
- {{.}}
{{/featureFlags}}

## Detailed Implementation Instructions

### 1. Project Structure
Generate a complete IaC project with the following structure:
```
{{projectName}}-infrastructure/
├── terraform/                   # Terraform configurations
│   ├── environments/           # Environment-specific configs
│   │   ├── dev/
│   │   ├── staging/
│   │   └── production/
│   ├── modules/                # Reusable Terraform modules
│   │   ├── compute/
│   │   ├── networking/
│   │   ├── storage/
│   │   └── security/
│   ├── main.tf                 # Main Terraform configuration
│   ├── variables.tf            # Input variables
│   ├── outputs.tf              # Output values
│   └── versions.tf             # Provider versions
├── ansible/                    # Configuration management
│   ├── playbooks/
│   ├── roles/
│   └── inventory/
├── kubernetes/                 # K8s manifests (if applicable)
│   ├── namespaces/
│   ├── deployments/
│   ├── services/
│   └── ingress/
├── scripts/                    # Deployment scripts
│   ├── deploy.sh
│   ├── destroy.sh
│   └── validate.sh
├── docs/                       # Documentation
│   ├── architecture.md
│   ├── deployment-guide.md
│   └── runbook.md
└── .github/                    # CI/CD workflows
    └── workflows/
        ├── terraform-plan.yml
        └── terraform-apply.yml
```

### 2. Terraform Configuration

#### Main Configuration (main.tf)
```hcl
terraform {
  required_version = ">= 1.0"
  
  {{#hasRemoteState}}
  backend "{{backendType}}" {
    {{#backendConfig}}
    {{key}} = "{{value}}"
    {{/backendConfig}}
  }
  {{/hasRemoteState}}
  
  required_providers {
    {{#cloudProvider}}
    {{#isAWS}}
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    {{/isAWS}}
    {{#isAzure}}
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    {{/isAzure}}
    {{#isGCP}}
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    {{/isGCP}}
    {{/cloudProvider}}
  }
}

# Provider configuration
{{#cloudProvider}}
{{#isAWS}}
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "{{projectName}}"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
{{/isAWS}}
{{#isAzure}}
provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}
{{/isAzure}}
{{#isGCP}}
provider "google" {
  project = var.project_id
  region  = var.region
}
{{/isGCP}}
{{/cloudProvider}}
```

#### Variables Configuration
Create comprehensive variable definitions for:
- Environment-specific settings
- Resource naming conventions
- Security configurations
- Scaling parameters
- Cost optimization settings

#### Modules Structure
{{#hasCompute}}
**Compute Module**: EC2/VM instances, auto-scaling groups, load balancers
{{/hasCompute}}
{{#hasNetworking}}
**Networking Module**: VPC, subnets, route tables, security groups
{{/hasNetworking}}
{{#hasStorage}}
**Storage Module**: S3 buckets, RDS databases, caching layers
{{/hasStorage}}
{{#hasSecurity}}
**Security Module**: IAM roles, policies, encryption configurations
{{/hasSecurity}}

### 3. Environment Management

#### Development Environment
- Minimal resource allocation for cost optimization
- Relaxed security policies for development ease
- Automated cleanup schedules

#### Staging Environment
- Production-like configuration for testing
- Blue-green deployment capabilities
- Performance testing infrastructure

#### Production Environment
- High availability and disaster recovery
- Enhanced security and compliance
- Monitoring and alerting systems

### 4. Security Implementation

#### Access Control
```hcl
# IAM role for applications
resource "aws_iam_role" "app_role" {
  name = "{{projectName}}-app-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Security groups with least privilege
resource "aws_security_group" "app_sg" {
  name_prefix = "{{projectName}}-app-"
  vpc_id      = module.networking.vpc_id
  
  # Only allow necessary ports
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

#### Encryption and Compliance
- Encryption at rest and in transit
- Key management and rotation
- Compliance with industry standards (SOC 2, GDPR, HIPAA)

### 5. Monitoring and Observability

#### CloudWatch/Monitor Setup
```hcl
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "{{projectName}}-dashboard"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization"],
            ["AWS/ApplicationELB", "RequestCount"]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "EC2 and ALB Metrics"
        }
      }
    ]
  })
}
```

#### Alerting Configuration
- CPU and memory thresholds
- Application error rates
- Security incident alerts
- Cost anomaly detection

### 6. Deployment Automation

#### CI/CD Integration
```yaml
# .github/workflows/terraform-plan.yml
name: Terraform Plan
on:
  pull_request:
    branches: [main]
    paths: ['terraform/**']

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: hashicorp/setup-terraform@v2
      - name: Terraform Plan
        run: |
          cd terraform
          terraform init
          terraform plan -var-file="environments/${{ github.event.pull_request.base.ref }}.tfvars"
```

#### Deployment Scripts
Create automated scripts for:
- Infrastructure validation
- Rolling deployments
- Rollback procedures
- Health checks

### 7. Cost Optimization

#### Resource Tagging Strategy
```hcl
locals {
  common_tags = {
    Project     = "{{projectName}}"
    Environment = var.environment
    Owner       = var.owner
    CostCenter  = var.cost_center
    CreatedBy   = "Terraform"
  }
}
```

#### Cost Controls
- Reserved instances for predictable workloads
- Spot instances for non-critical workloads
- Auto-scaling policies
- Scheduled resource management

## Constraints and Considerations
{{#constraints}}
- {{.}}
{{/constraints}}

## Success Criteria
The generated infrastructure should:
1. ✅ Deploy successfully across all target environments
2. ✅ Pass security and compliance scans
3. ✅ Include comprehensive monitoring and alerting
4. ✅ Support automated scaling and recovery
5. ✅ Maintain cost efficiency within budget constraints
6. ✅ Include disaster recovery capabilities
7. ✅ Provide complete documentation and runbooks

## Additional Notes
- Follow cloud provider best practices and well-architected principles
- Implement infrastructure as code principles with version control
- Include comprehensive testing and validation
- Ensure idempotent deployments
- Document all manual intervention procedures

---
*Generated by Qoder Universal Prompt Generator on {{date.iso}}*