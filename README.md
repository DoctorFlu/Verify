
## Setup
First we're going to install npm and node.js, which will allow us to run our scripts. If you already have node and npm (or want to check), type ```node -v``` and ```npm -v```.
1. In your command line terminal, install npm by typing ```npm install -g npm```.
2. Install node.js [here](https://nodejs.org/en/download/package-manager).

Next, we're going to create our root and intermediate wallets. If you already have wallets through Metamask or Forge that you would like to use, feel free to use those as your wallets and skip steps 3 and 4. You will need two (one for your root and one for your intermediate).

3. Run ```node gen-wallet.js``` to generate an address and private key for your root wallet. Make sure to save this somewhere safe.

4. Run ```node gen-wallet.js``` again to generate another address and private key for your intermediate wallet. This wallet will handle all of the transactions on the verify testnet.

5. Fund your intermediate wallet with Verify Matic by following these [steps](https://docs.verifymedia.com/verify-testnet)

6. Make an account on [Pinata](https://www.pinata.cloud/) and create an API key. This will allow us to store our content on IPFS.

7. Create a .env file in the root directory, add the following info:
  - ROOT_WALLET: Your root wallet <b>private key. </b>
  - INTER_WALLET: Your intermediate wallet <b>private key</b>.
  - PINATA_KEY: Your Pinata API key.
  - PINATA_SECRET: Your Pinata secret key.
  - CONTENT: Whatever content you would like to publish to the Verify testnet.

## Usage
Now we're ready to run our scripts and publish to the testnet and verify our content!

8. In your command line terminal, run ```node registerR.js```. This will register 
your root wallet address with the network. This only needs to be completed once.

9. Run ```node registerI.js```. This only needs to be completed once.

10. Run ```publish.js```. This will publish your content to the verify testnet as well as verify it! This can be run as many times as you want (as long as you have funds in your intermediate wallet). Feel free to change the content in the .env file if you would like to publish new content.

## Congratulations!
Congrats! You have successfuly published and verified content on Verify!
