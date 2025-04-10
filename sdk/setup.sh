#!/bin/bash

# Setup script for NetZap ZMap SDK
echo "Setting up NetZap ZMap SDK..."

# Check if ZMap is installed
if ! command -v zmap &> /dev/null; then
    echo "ZMap is not installed. Please install ZMap first."
    echo "On Ubuntu/Debian: sudo apt-get install zmap"
    echo "On CentOS/RHEL: sudo yum install zmap"
    echo "Or visit https://github.com/zmap/zmap for installation instructions."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    echo "Visit https://nodejs.org/ for installation instructions."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    echo "It usually comes with Node.js installation."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the SDK..."
npm run build

echo "Setup completed successfully!"
echo "You can now use the NetZap ZMap SDK."
echo ""
echo "Try running an example:"
echo "npm run example:basic" 