#!/bin/bash

OSTYPE="$(uname -s)"
defaultDirectory="/home"
if [ "$OSTYPE" = "Darwin" ]; then
    defaultDirectory="/Applications"
#    echo "Looks like you are on MacOS"
#    echo "Your default directory is set to $defaultDirectory"
fi
#echo "---------------------------------------------"
#echo "Install Location for Shinobi"
#echo "*Note : Default install location is $defaultDirectory"
#echo "Do you want to install a custom location for Shinobi?"
#echo "(y)es or (N)o? Default : No"
#    read installLocationChoice
#    if [ "$installLocationChoice" = "Y" ] || [ "$installLocationChoice" = "y" ]; then
#        echo "Example : $defaultDirectory"
#        read installLocation
#    else
        installLocation="$defaultDirectory"
#    fi
cd $installLocation
echo "Opening Install Location : \"$installLocation\""
if [ ! -d "mgmt" ]; then
    # Check if Mac OS and if Git is needed
    if [ "$OSTYPE" = "Darwin" ]; then
        if [ ! -x "$(command -v brew)" ]; then
            ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
            brew doctor
        fi
        if [ ! -x "$(command -v git)" ]; then
            brew install git
        fi
    else
        # Check if user is root
        if [ "$(id -u)" != 0 ]; then
            echo "*--------------------**---------------------*"
            echo "*Shinobi Central requires being run as root."
            echo "*Do you want to continue without being root?"
            echo "(Y)es or (n)o? Default : Yes"
            read nonRootUser
            if [  "$nonRootUser" = "N" ] || [  "$nonRootUser" = "n" ]; then
                echo "Stopping..."
                exit 1
            fi
        fi
        sudo apt-get update
        apt install zip
        # Check if Git is needed
        if [ ! -x "$(command -v git)" ]; then
            # Check if Ubuntu
            if [ -x "$(command -v apt)" ]; then
                sudo apt update
                sudo apt install git -y
            fi
            # Check if CentOS
            if [ -x "$(command -v yum)" ]; then
                sudo yum makecache
                sudo yum install git -y
            fi
        fi
        # Check if wget is needed
        if [ ! -x "$(command -v wget)" ]; then
            # Check if Ubuntu
            if [ -x "$(command -v apt)" ]; then
                sudo apt install wget -y
            fi
            # Check if CentOS
            if [ -x "$(command -v yum)" ]; then
                sudo yum install wget -y
            fi
        fi
    fi
else
    echo "!-----------------------------------!"
    echo "Shinobi already downloaded."
    cd mgmt
fi

theRepo=''
productName="Shinobi Professional (Pro)"
echo "What Branch would you like to use?"
echo "Default : main"
read theBranchChoice
if [ "$theBranchChoice" = "" ] ; then
    echo "Getting the main Branch"
    theBranch='main'
else
    theBranch=$theBranchChoice
fi
# Download from Git repository
gitURL="https://github.com/chinmoysahu/manifestiq-vms-central-proxy$theRepo"
sudo git clone $gitURL.git -b $theBranch mgmt
# Enter Shinobi folder "/home/Shinobi"
cd mgmt
gitVersionNumber=$(git rev-parse HEAD)
theDateRightNow=$(date)
# write the version.json file for the main app to use
sudo touch version.json
sudo chmod 777 version.json
sudo echo '{"Product" : "'"$productName"'" , "Branch" : "'"$theBranch"'" , "Version" : "'"$gitVersionNumber"'" , "Date" : "'"$theDateRightNow"'" , "Repository" : "'"$gitURL"'"}' > version.json
echo "-------------------------------------"
echo "---------- Shinobi Systems ----------"
echo "Repository : $gitURL"
echo "Product : $productName"
echo "Branch : $theBranch"
echo "Version : $gitVersionNumber"
echo "Date : $theDateRightNow"
echo "-------------------------------------"
echo "-------------------------------------"

# # start the installer in the main app (or start shinobi if already installed)
# echo "*-----------------------------------*"
# sudo chmod +x INSTALL/start.sh
# sudo INSTALL/start.sh

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

# # Create the destination directory if it doesn't exist
# if [ ! -d "$DEST_DIR" ]; then
#   echo "Creating destination directory: $DEST_DIR"
#   mkdir -p "$DEST_DIR"
# fi

# # Download the ZIP file
# echo "Downloading $URL..."
# wget -O "$ZIP_FILE" "$URL"

# # Check if the download was successful
# if [ $? -ne 0 ]; then
#   echo "Failed to download the file. Exiting."
#   exit 1
# fi

# # Extract the ZIP file into the destination directory
# echo "Extracting $ZIP_FILE to $DEST_DIR..."
# unzip -o "$ZIP_FILE" -d "$DEST_DIR"

# # Check if the extraction was successful
# if [ $? -ne 0 ]; then
#   echo "Failed to extract the ZIP file. Exiting."
#   exit 1
# fi

# # Clean up the downloaded ZIP file
# echo "Cleaning up temporary files..."
# rm -f "$ZIP_FILE"

# # Navigate to the extracted folder
# cd "$DEST_DIR" || exit

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
