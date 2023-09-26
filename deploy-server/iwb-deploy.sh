# iwb-deploy.sh

# Define the repository URL and branch
repo_url="https://github.com/last-slice/dcl-iwb.git"
branch_name="hq"

#change directory to available deployment bucket
cd /Users/lastraum/Desktop/Programming/Decentraland/Lastslice/sdk7/iwb/servers/deploy-server/iwb-template
# cd /Users/lastraum/Desktop/Programming/Decentraland/Lastslice/sdk7/iwb/toolset/deploy-server/buckets/$bucket

# Clone or update the repository
if [ -d "$branch_name" ]; then
  # If the repository already exists, pull the latest changes
  echo "update repo"
  git pull
else
  # If the repository doesn't exist, clone it
  echo "pull repo"
  git clone  --depth 1 --branch "$branch_name" "$repo_url" "$branch_name"
fi

# Remove the top-level folder (branch name)
mv "$branch_name"/* .
rm -rf "$branch_name"

#make sure to install latest modules
npm install

#deploy with private key
# DCL_PRIVATE_KEY=$PRIVATE_KEY npm run deploy -- --target-content https://worlds-content-server.decentraland.org

echo "Done Deploying"