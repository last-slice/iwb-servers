# deploy.sh

# Access the arguments passed from the Node.js application
bucket="$1"
PRIVATE_KEY="$2"

#change directory to available deployment bucket
cd /Users/lastraum/Desktop/Programming/Decentraland/Lastslice/sdk7/iwb/servers/buckets/$bucket
# cd /root/deployment/buckets/$bucket

#make sure to install latest modules
npm install

npm run build

#deploy with private key
DCL_PRIVATE_KEY=$PRIVATE_KEY npm run deploy -- --target-content https://worlds.dcl-iwb.co

echo "Done Deploying"