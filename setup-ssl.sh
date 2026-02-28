#!/bin/bash
# SSL Certificate Setup Script
# For school-board.online

echo "=================================="
echo "SSL CERTIFICATE SETUP"
echo "=================================="
echo ""

# Install Certbot (Let's Encrypt client)
echo "Installing Certbot..."
apt-get update
apt-get install -y certbot python3-certbot-apache

# Get SSL certificate
echo ""
echo "Getting SSL certificate..."
certbot --apache -d school-board.online -d www.school-board.online

echo ""
echo "=================================="
echo "SSL SETUP COMPLETE!"
echo "=================================="
echo ""
echo "Your site is now available at:"
echo "https://school-board.online/"
echo ""
echo "Certificate will auto-renew!"
