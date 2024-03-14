# deploy.sh

debug=false

# # Access the arguments passed from the Node.js application
bucket="$1"
PRIVATE_KEY="$2"

echo "deploy bucket is $bucket"

# #change directory to available deployment bucket
if [ "$debug" = true ]; then
    cd /Users/lastraum/Desktop/Programming/Decentraland/Lastslice/sdk7/iwb/servers/deploy-server/buckets/iwb/$bucket
else
cd /root/deployment/buckets/iwb/$bucket
fi

# #make sure to install latest modules
# npm install

# npm run build

#deploy with private key
DCL_PRIVATE_KEY=$PRIVATE_KEY npm run deploy -- --target-content https://worlds.dcl-iwb.co --skip-build

echo "Done Deploying"