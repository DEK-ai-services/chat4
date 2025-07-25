#!/bin/bash

# Quick LibreChat Deployment Script for Ubuntu Server
# Usage: ./quick-deploy.sh

set -e

echo "🚀 Quick LibreChat deployment on Ubuntu server..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker $USER
    print_warning "Docker installed. You may need to log out and back in."
else
    print_status "Docker is already installed"
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose is already installed"
fi

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 3080/tcp
sudo ufw reload

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from example..."
    cp .env.example .env
    
    # Update .env for production
    sed -i 's/HOST=localhost/HOST=0.0.0.0/' .env
    sed -i 's/DOMAIN_CLIENT=.*/DOMAIN_CLIENT=http:\/\/167.99.133.236:3080/' .env
    sed -i 's/DOMAIN_SERVER=.*/DOMAIN_SERVER=http:\/\/167.99.133.236:3080/' .env
    sed -i 's/NO_INDEX=true/NO_INDEX=false/' .env
    sed -i 's/DEBUG_LOGGING=true/DEBUG_LOGGING=false/' .env
fi

# Generate MeiliSearch master key
print_status "Generating MeiliSearch master key..."
MEILI_MASTER_KEY=$(openssl rand -hex 32)
sed -i "s/your_meili_master_key_here/$MEILI_MASTER_KEY/" docker-compose.simple.yml
sed -i "s/MEILI_MASTER_KEY=.*/MEILI_MASTER_KEY=$MEILI_MASTER_KEY/" .env

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p {data-node,meili_data_v1.12,images,uploads,logs}

# Start the application
print_status "Starting LibreChat application..."
docker-compose -f docker-compose.yml -f docker-compose.simple.yml up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check if services are running
print_status "Checking service status..."
docker-compose -f docker-compose.yml -f docker-compose.simple.yml ps

# Final status check
print_status "Performing final status check..."
sleep 10

if curl -f http://localhost:3080 > /dev/null 2>&1; then
    print_status "✅ LibreChat is running successfully!"
    echo ""
    echo "🌐 Access your LibreChat application at:"
    echo "   http://167.99.133.236:3080"
    echo ""
    print_warning "Don't forget to:"
    echo "   1. Configure your API keys in .env file"
    echo "   2. Restart the application after adding API keys:"
    echo "      docker-compose -f docker-compose.yml -f docker-compose.simple.yml restart"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: docker-compose -f docker-compose.yml -f docker-compose.simple.yml logs -f"
    echo "   Restart: docker-compose -f docker-compose.yml -f docker-compose.simple.yml restart"
    echo "   Stop: docker-compose -f docker-compose.yml -f docker-compose.simple.yml down"
    echo "   Update: docker-compose -f docker-compose.yml -f docker-compose.simple.yml pull && docker-compose -f docker-compose.yml -f docker-compose.simple.yml up -d"
else
    print_warning "❌ LibreChat may not be running properly"
    echo "Check logs with: docker-compose -f docker-compose.yml -f docker-compose.simple.yml logs"
fi

print_status "Quick deployment completed! 🎉" 