#!/bin/bash

# LibreChat Deployment Script for Ubuntu Server
# Usage: ./deploy.sh

set -e

echo "🚀 Starting LibreChat deployment on Ubuntu server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    git \
    ufw

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker $USER
    print_warning "Docker installed. You may need to log out and back in for group changes to take effect."
else
    print_status "Docker is already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose is already installed"
fi

# Create application directory
APP_DIR="/opt/librechat"
print_status "Creating application directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Copy application files
print_status "Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p {data-node,meili_data_v1.12,images,uploads,logs,ssl}

# Set proper permissions
print_status "Setting proper permissions..."
chmod 755 $APP_DIR
chmod 644 $APP_DIR/.env

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3080/tcp
sudo ufw reload

# Generate MeiliSearch master key
print_status "Generating MeiliSearch master key..."
MEILI_MASTER_KEY=$(openssl rand -hex 32)
sed -i "s/your_meili_master_key_here/$MEILI_MASTER_KEY/" docker-compose.production.yml

# Update .env file for production
print_status "Updating .env file for production..."
if [ -f .env ]; then
    # Backup original .env
    cp .env .env.backup
    
    # Update production settings
    sed -i 's/HOST=localhost/HOST=0.0.0.0/' .env
    sed -i 's/PORT=3080/PORT=3080/' .env
    sed -i 's/DOMAIN_CLIENT=.*/DOMAIN_CLIENT=http:\/\/167.99.133.236:3080/' .env
    sed -i 's/DOMAIN_SERVER=.*/DOMAIN_SERVER=http:\/\/167.99.133.236:3080/' .env
    sed -i 's/NO_INDEX=true/NO_INDEX=false/' .env
    sed -i 's/DEBUG_LOGGING=true/DEBUG_LOGGING=false/' .env
    sed -i 's/CONSOLE_JSON=false/CONSOLE_JSON=false/' .env
    
    # Update MongoDB URI for authentication
    sed -i 's|MONGO_URI=.*|MONGO_URI=mongodb://admin:librechat2024@mongodb:27017/LibreChat?authSource=admin|' .env
    
    # Update MeiliSearch master key
    sed -i "s/MEILI_MASTER_KEY=.*/MEILI_MASTER_KEY=$MEILI_MASTER_KEY/" .env
else
    print_error ".env file not found. Please create one from .env.example"
    exit 1
fi

# Start the application
print_status "Starting LibreChat application..."
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check if services are running
print_status "Checking service status..."
docker-compose -f docker-compose.yml -f docker-compose.production.yml ps

# Create systemd service for auto-start
print_status "Creating systemd service for auto-start..."
sudo tee /etc/systemd/system/librechat.service > /dev/null <<EOF
[Unit]
Description=LibreChat Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.yml -f docker-compose.production.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable librechat.service
sudo systemctl start librechat.service

# Create maintenance script
print_status "Creating maintenance script..."
tee $APP_DIR/maintenance.sh > /dev/null <<EOF
#!/bin/bash

# LibreChat Maintenance Script
# Usage: ./maintenance.sh [backup|restore|update|logs|restart]

case "\$1" in
    backup)
        echo "Creating backup..."
        tar -czf backup_\$(date +%Y%m%d_%H%M%S).tar.gz data-node meili_data_v1.12 images uploads logs .env
        echo "Backup created: backup_\$(date +%Y%m%d_%H%M%S).tar.gz"
        ;;
    restore)
        if [ -z "\$2" ]; then
            echo "Usage: ./maintenance.sh restore <backup_file>"
            exit 1
        fi
        echo "Restoring from \$2..."
        tar -xzf "\$2"
        docker-compose -f docker-compose.yml -f docker-compose.production.yml restart
        ;;
    update)
        echo "Updating LibreChat..."
        git pull
        docker-compose -f docker-compose.yml -f docker-compose.production.yml down
        docker-compose -f docker-compose.yml -f docker-compose.production.yml pull
        docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
        ;;
    logs)
        docker-compose -f docker-compose.yml -f docker-compose.production.yml logs -f
        ;;
    restart)
        echo "Restarting LibreChat..."
        docker-compose -f docker-compose.yml -f docker-compose.production.yml restart
        ;;
    *)
        echo "Usage: ./maintenance.sh [backup|restore|update|logs|restart]"
        ;;
esac
EOF

chmod +x $APP_DIR/maintenance.sh

# Final status check
print_status "Performing final status check..."
sleep 10

if curl -f http://localhost:3080/health > /dev/null 2>&1; then
    print_status "✅ LibreChat is running successfully!"
    echo ""
    echo "🌐 Access your LibreChat application at:"
    echo "   http://167.99.133.236:3080"
    echo ""
    echo "📁 Application directory: $APP_DIR"
    echo "🔧 Maintenance script: $APP_DIR/maintenance.sh"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: ./maintenance.sh logs"
    echo "   Restart: ./maintenance.sh restart"
    echo "   Update: ./maintenance.sh update"
    echo "   Backup: ./maintenance.sh backup"
    echo ""
    print_warning "Don't forget to:"
    echo "   1. Configure your API keys in .env file"
    echo "   2. Set up SSL certificates for production use"
    echo "   3. Configure your domain name if you have one"
    echo "   4. Set up regular backups"
else
    print_error "❌ LibreChat failed to start properly"
    echo "Check logs with: docker-compose -f docker-compose.yml -f docker-compose.production.yml logs"
    exit 1
fi

print_status "Deployment completed successfully! 🎉" 