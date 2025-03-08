#! /bin/sh
# Check OS
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
if [ ! -d "Shinobi" ]; then
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
            echo "*Shinobi requires being run as root."
            echo "*Do you want to continue without being root?"
            echo "(Y)es or (n)o? Default : Yes"
            read nonRootUser
            if [  "$nonRootUser" = "N" ] || [  "$nonRootUser" = "n" ]; then
                echo "Stopping..."
                exit 1
            fi
        fi
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
    theRepo=''
    productName="Shinobi Professional (Pro)"
    # if [ -n "$1" ]; then
    #     theBranchChoice="$1"
    # else
    #     echo "Install the Development branch?"
    #     echo "(y)es or (N)o? Default: No"
    #     read -r theBranchChoice
    # fi

    # Evaluate the choice
    # if [ "$theBranchChoice" = "Y" ] || [ "$theBranchChoice" = "y" ]; then
        echo "Getting the Development Branch..."
        theBranch='dev'
    # else
    #     echo "Getting the Master Branch..."
    #     theBranch='master'
    # fi

    # Example usage of $theBranch afterward
    echo "Branch selected: $theBranch"
    # Download from Git repository
    gitURL="https://gitlab.com/Shinobi-Systems/Shinobi$theRepo"
    sudo git clone $gitURL.git -b $theBranch Shinobi
    # Enter Shinobi folder "/home/Shinobi"
    cd Shinobi
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
else
    echo "!-----------------------------------!"
    echo "Shinobi already downloaded."
    cd Shinobi
fi
# start the installer in the main app (or start shinobi if already installed)
echo "*-----------------------------------*"
sudo chmod +x INSTALL/ubuntu-touchless.sh
sudo INSTALL/ubuntu-touchless.sh y
if [ -n "$2" ] && [ -n "$3" ]; then
    cd /home/Shinobi
    git reset --hard
    git checkout dev
    node tools/modifyConfiguration.js addToConfig="{\"enableMgmtConnect\":true, \"peerConnectKey\": \"$2\", \"managementServer\": \"$3\"}"
    if [ -n "$4" ] && [ -n "$5" ] && [ -n "$6" ]; then
        node tools/modifyConfiguration.js addToConfig="{\"staticUsers\":[{\"mail\": \"$4\",\"initialPassword\":\"$5\",\"details\": \"{}\", \"diskLimit\":\"$6\"}]}"
    fi
    if [ -n "$7" ]; then
        node tools/modifyConfiguration.js addToConfig="{\"videosDir\":\"$7\"}"
    fi
    pm2 restart camera
fi
