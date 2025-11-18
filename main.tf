terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region                      = "us-east-1"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
  access_key                  = "mock_access_key"
  secret_key                  = "mock_secret_key"
}

# VIOLATION: Missing "Environment" tag
# VIOLATION: t2.micro is supposedly banned in production (if we had that tag)
resource "aws_instance" "web_server" {
  ami           = "ami-0c7217cdde317cfec" # Ubuntu 22.04
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer"
    # Missing Environment tag
  }
}

# VIOLATION: Ingress open to world on port 22
resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh"
  description = "Allow SSH inbound traffic"

  ingress {
    description = "SSH from VPC"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Violation
  }
}

resource "aws_s3_bucket" "data_bucket" {
  bucket = "my-digger-poc-bucket"
}
