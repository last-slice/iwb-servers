# iwb-deploy.sh

debug=false

# Define the repository URL and branch
repo_url="https://github.com/last-slice/iwb-3d-wip.git"
branch_name="main"

rm -r /root/deployment/asset-git/*
cd /root/deployment/asset-git

# rm -r /Users/lastraum/Desktop/Programming/Decentraland/LastSlice/sdk7/iwb/iwb-assets/*
# cd /Users/lastraum/Desktop/Programming/Decentraland/LastSlice/sdk7/iwb/iwb-assets/

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

echo "Script finished"