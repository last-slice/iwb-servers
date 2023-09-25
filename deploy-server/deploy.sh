# deploy.sh

# Access the arguments passed from the Node.js application
bucket="$1"
PRIVATE_KEY="$2"

#change directory to available deployment bucket
cd /Users/lastraum/Desktop/Programming/Decentraland/Lastslice/sdk7/iwb/toolset/deploy-server/buckets/$bucket
# cd /Users/lastraum/Desktop/Programming/Decentraland/Lastslice/sdk7/iwb/toolset/deploy-server/buckets/$bucket

#make sure to install latest modules
npm install

#deploy with private key
DCL_PRIVATE_KEY=$PRIVATE_KEY npm run deploy -- --target-content https://worlds-content-server.decentraland.org

echo "Done Deploying"