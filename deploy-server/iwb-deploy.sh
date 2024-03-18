# iwb-deploy.sh

debug=false

PRIVATE_KEY="$1"
IWB_WORLD="$2"

# Define the repository URL and branch
repo_url="https://github.com/last-slice/dcl-iwb.git"
branch_name="iwb-deploy"

# rm -r /root/deployment/iwb-template/*
# cd /root/deployment/iwb-template

# # Clone or update the repository
# if [ -d "$branch_name" ]; then
#   # If the repository already exists, pull the latest changes
#   echo "update repo"
#   git pull
# else
#   # If the repository doesn't exist, clone it
#   echo "pull repo"
#   git clone  --depth 1 --branch "$branch_name" "$repo_url" "$branch_name"
# fi

# # Remove the top-level folder (branch name)
# mv "$branch_name"/* .
# rm -rf "$branch_name"

source_folder=""
#retrieve all catalog assets
if [ "$debug" = true ]; then
  source_folder="/Users/lastraum/Desktop/Programming/Decentraland/Lastslice/sdk7/iwb/iwb-assets"
else
  source_folder="/root/iwb-assets/"
fi

destination_folder=""
if [ "$debug" = true ]; then
  destination_folder="/Users/lastraum/Desktop/Programming/Decentraland/Lastslice/sdk7/iwb/servers/deploy-server/iwb-template/assets"
else
  destination_folder="/root/iwb-deployment/iwb-template/assets"
fi

# Use the '-r' flag for recursive copy if you want to copy subdirectories and their contents
cp -rf "$source_folder"/* "$destination_folder"

# Optional: Display a message to confirm the copy
echo "Contents of $source_folder copied to $destination_folder"

# Define the source and destination directories
source_dir="/root/ugc-assets/$IWB_WORLD" 

# Check if the source directory exists
if [ -d "$source_dir" ]; then
    echo "World has UGC content"
    # Source directory exists, proceed with copying
    cp -r "$source_dir"/* "$destination_dir"
    echo "UGC copied successfully."
else
    # Source directory doesn't exist
    echo "World does not have UGC Content"
fi

#make sure to install latest modules
npm install

#deploy with private key
DCL_PRIVATE_KEY=$PRIVATE_KEY npm run deploy -- --target-content https://worlds-content-server.decentraland.org

echo "Script finished"