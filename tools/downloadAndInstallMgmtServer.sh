#!/bin/bash

# Default destination directory
DEFAULT_DEST_DIR="/home/mgmt"
DEST_DIR="${1:-$DEFAULT_DEST_DIR}"

# Define other variables
URL="https://cdn.shinobi.video/apps/Shinobi-Management-Server.zip"
ZIP_FILE="/tmp/Shinobi-Management-Server.zip"
TOOLS_DIR="$DEST_DIR/tools"
USER_CREDENTIALS="$DEST_DIR/userCredentials.json"

# Check if Node.js is installed
if ! [ -x "$(command -v node)" ]; then
    echo "Node.js not found, installing..."

    if [ -x "$(command -v yum)" ]; then
        echo "Detected yum, installing Node.js..."
        sudo yum install --nogpgcheck https://rpm.nodesource.com/pub_18.x/nodistro/repo/nodesource-release-nodistro-1.noarch.rpm -y
        sudo yum install --nogpgcheck nodejs -y
    elif [ -x "$(command -v apt-get)" ]; then
        echo "Detected apt-get, installing Node.js..."
        # Get the Ubuntu version
        UBUNTU_VERSION=$(lsb_release -rs)
        NODE_MAJOR=18

        # Check if Ubuntu version is 18.04
        if [ "$UBUNTU_VERSION" = "18.04" ]; then
            NODE_MAJOR=16
        fi

        echo "Installing Node version: $NODE_MAJOR"

        # Update and install necessary packages
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg

        # Setup NodeSource keyring and sources list
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

        # Add NodeSource repository
        echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

        # Update package list and install Node.js
        sudo apt-get update
        sudo apt-get install -y nodejs
    fi
else
    echo "Node.js is already installed."
    echo "Version: $(node -v)"
fi

# Check if pm2 is installed
if ! [ -x "$(command -v pm2)" ]; then
  echo "pm2 not found, installing globally..."
  npm i pm2 -g

  # Check if the installation was successful
  if [ $? -ne 0 ]; then
    echo "Failed to install pm2. Please check your npm setup."
    exit 1
  fi
else
  echo "pm2 is already installed."
  echo "Version: $(pm2 -v)"
fi

# Create the destination directory if it doesn't exist
if [ ! -d "$DEST_DIR" ]; then
  echo "Creating destination directory: $DEST_DIR"
  mkdir -p "$DEST_DIR"
fi

# Download the ZIP file
echo "Downloading $URL..."
wget -O "$ZIP_FILE" "$URL"

# Check if the download was successful
if [ $? -ne 0 ]; then
  echo "Failed to download the file. Exiting."
  exit 1
fi

# Extract the ZIP file into the destination directory
echo "Extracting $ZIP_FILE to $DEST_DIR..."
unzip -o "$ZIP_FILE" -d "$DEST_DIR"

# Check if the extraction was successful
if [ $? -ne 0 ]; then
  echo "Failed to extract the ZIP file. Exiting."
  exit 1
fi

# Clean up the downloaded ZIP file
echo "Cleaning up temporary files..."
rm -f "$ZIP_FILE"

# Navigate to the extracted folder
cd "$DEST_DIR" || exit

# Run npm install
echo "Running npm install..."
npm audit fix
npm install
pm2 delete shinobi_mgmt
pm2 start index.js --name shinobi_mgmt

# Check if npm install was successful
if [ $? -ne 0 ]; then
  echo "Failed to run npm install. Please check your Node.js and npm setup."
  exit 1
fi

# Check if userCredentials.json exists
if [ ! -f "$USER_CREDENTIALS" ]; then
  # Ask the user if they want to create a new user
  read -p "Do you want to create a new user? (yes/no): " CREATE_USER

  if [ "$CREATE_USER" = "yes" ]; then
    # Ask for username and password
    read -p "Enter username: " USERNAME
    read -p "Enter password: " PASSWORD
    echo

    # Run the addNewUser.js script
    echo "Adding new user..."
    node tools/addNewUser.js "$USERNAME" "$PASSWORD"

    # Check if the script was successful
    if [ $? -ne 0 ]; then
      echo "Failed to create the user. Please check your setup."
      exit 1
    else
      echo "User $USERNAME created successfully."
    fi
  else
    echo "User creation skipped."
  fi
else
  echo "User credentials file already exists. Skipping user creation."
fi

echo "Setup complete. The Shinobi Management Server is ready in $DEST_DIR."
