npm install
mkdir ~/.homebridge/
cp ./config.sample.json ~/.homebridge/config.json
npm install -g ./
homebridge -I 2>&1 | tee -a ~/.homebridge/homebridge.log
