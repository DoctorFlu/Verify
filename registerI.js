const { ethers, Contract, keccak256 } = require("ethers");
const ContentGraphABI = require("./ContentGraphABI.json");
const identityRegistryABI = require("./IdentityRegistryABI.json");
const pinataSDK = require("@pinata/sdk");
const dotenv = require("dotenv");
dotenv.config();

const IDENTITY_PROXY_CONTRACT = "0xdCE27c4a76bE1fF9F9C543E13FCC3591E33A0E25";
const CONTENTGRAPH_PROXY_CONTRACT =
  "0xEe586a3655EB0D017643551e9849ed828Fd7c7FA";
const ZeroHash =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const rpcUrl = "https://rpc.verify-testnet.gelato.digital";

const rpcProvider = new ethers.JsonRpcProvider(rpcUrl)

async function buildDomainSeparator() {
  //Domain separator for Identity Registry Sandbox, see EIP712 specification for more detail.
  const intermediateWallet = new ethers.Wallet(
    process.env.INTER_WALLET,
    rpcProvider
  );
  const IdentityRegistry = new Contract(
    IDENTITY_PROXY_CONTRACT,
    identityRegistryABI,
    intermediateWallet
  );

  const eip = await IdentityRegistry.eip712Domain();

  const domainSepartor = keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        keccak256(
          ethers.toUtf8Bytes(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
          )
        ),
        ethers.id(eip.name),
        ethers.id(eip.version),
        eip.chainId,
        IDENTITY_PROXY_CONTRACT,
      ]
    )
  );
  return domainSepartor;
}

async function createRegisterSignature(
  IdentityRegistry,
  rootWallet,
  intermediate,
  expiry,
  chainId,
  deadline
) {
  console.log("Getting nonce...");
  const nonce = await IdentityRegistry.nonces(rootWallet.address);

  const structData = ethers.AbiCoder.defaultAbiCoder().encode(
    [
      "bytes32",
      "address",
      "address",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
    ],
    [
      keccak256(
        ethers.toUtf8Bytes(
          "register(address root,address intermediate,uint256 expiry,uint256 nonce,uint256 chainID,uint256 deadline)"
        )
      ), //This is the hash of the register function type
      rootWallet.address, // Root Address
      intermediate.address, // Intermediate Address
      expiry, // Expiry of registration
      nonce, // nonce
      chainId,
      deadline, // Expiry of the signature
    ]
  );
  const structHash = keccak256(structData);

  console.log(`Sign message: ${structHash}`);

  const DOMAIN_SEPARATOR = await buildDomainSeparator();

  const signature = rootWallet.signingKey.sign(
    keccak256(
      "0x1901" + DOMAIN_SEPARATOR.substring(2) + structHash.substring(2) //Note: "0x1901 is the set prefix for EIP712, see its specification for more detail"
    )
  ).serialized;

  return signature;
}

async function registerIntermediate() {
  const rootWallet = new ethers.Wallet(
    process.env.ROOT_WALLET,
    rpcProvider
  );

  const intermediateWallet = new ethers.Wallet(
    process.env.INTER_WALLET,
    rpcProvider
  );
  const IdentityRegistry = new Contract(
    IDENTITY_PROXY_CONTRACT,
    identityRegistryABI,
    intermediateWallet
  );

  const now = (await rpcProvider.getBlock()).timestamp;

  const expiry = now + 60 * 60 * 24 * 3; // 3 day: 60 secs by 60 mins by 24 hrs
  const deadline = now + 60 * 60 * 24;
  const chainId = 1833;

  console.log("Generating signature...");

  const signature = await createRegisterSignature(
    IdentityRegistry,
    rootWallet,
    intermediateWallet,
    expiry,
    chainId,
    deadline
  );

  console.log(`Signature generated: ${signature}`);
  console.log("Registering intermediate...");
  await IdentityRegistry.register(
    signature,
    rootWallet.address,
    intermediateWallet.address,
    expiry,
    chainId,
    deadline
  );

  console.log("Intermediate wallet registered!");
}

async function whoIs(address = "") {
  const intermediate = new ethers.Wallet(
    process.env.INTER_WALLET,
    rpcProvider
  );
  if (!address) {
    address = intermediate.address;
  }

  const IdentityRegistry = new Contract(
    IDENTITY_PROXY_CONTRACT,
    identityRegistryABI,
    intermediate
  );

  console.log("Who is:", address);
  return IdentityRegistry.whoIs(address);
}

function generateRandomString(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


async function main() {
  /**
   * remember to fund the intermediate wallet following steps mentioned in https://docs.verifymedia.com/verify-testnet before calling any of the below functions
   */

  // Register Intermediate: Needs to be run only once
  await registerIntermediate();

  console.log("Waiting for signer registration...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Check the registration of the Intermediate, should return Root address
  const root = await whoIs();
  console.log(root);
}

main();
