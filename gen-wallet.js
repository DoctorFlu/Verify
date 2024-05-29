const ethers = require("ethers");
const crypto = require("crypto");

function genWallet() {
  var id = crypto.randomBytes(32).toString("hex");
  var privateKey = id;
  console.log("pvt key", privateKey);
  var wallet = new ethers.Wallet(privateKey);
  console.log("Address: " + wallet.address);
}

genWallet();
