/* export APIs to the Bodhi ecology, including the follow APIs:
- read bodhi text assets
- read bodhi pic assets
- read bodhi assets sliced
- read bodhi spaces
- using bodhi as a auth? That may be c00l.
*/
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

// for ether
import { ethers } from "https://cdn.skypack.dev/ethers@5.6.8";

// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// import { render } from "@deno/gfm";
// import { gql } from "https://deno.land/x/graphql_tag@0.0.1/mod.ts";
// import { print } from "https://deno.land/x/graphql_deno@v15.0.0/mod.ts";

/*
data from hardhat, according by the data, to generate deno interactor.
Prompt for ABI Transform:
```
change the abi style from json to style like:
const abi = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",

    // Authenticated Functions
    "function transfer(address to, uint amount) returns (bool)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint amount)"
];
```
*/
const contracts = {
  chainId: "97",
  name: "bnbTestnet",
  contracts: {
    crw: {
      address: "0xD1e91A4Bf55111dD3725E46A64CDbE7a2cC97D8a",
      abi: [
        {
          inputs: [
            {
              internalType: "string",
              name: "data",
              type: "string",
            },
          ],
          name: "add_item",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "addr",
              type: "address",
            },
          ],
          name: "read_all",
          outputs: [
            {
              components: [
                {
                  internalType: "string",
                  name: "content",
                  type: "string",
                },
                {
                  internalType: "uint256",
                  name: "timestamp",
                  type: "uint256",
                },
              ],
              internalType: "struct CRW.DataItem[]",
              name: "",
              type: "tuple[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "addr",
              type: "address",
            },
          ],
          name: "read_index",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "addr",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "index",
              type: "uint256",
            },
          ],
          name: "read_item",
          outputs: [
            {
              components: [
                {
                  internalType: "string",
                  name: "content",
                  type: "string",
                },
                {
                  internalType: "uint256",
                  name: "timestamp",
                  type: "uint256",
                },
              ],
              internalType: "struct CRW.DataItem",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    },
  },
};

const scaffoldConfig = {
  // The network where your DApp lives in
  targetNetwork: {
    id: 97,
    name: "bnbTestnet",
    network: "bnbTestnet",
    nativeCurrency: {
      name: "tBNB",
      symbol: "tBNB",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
      },
      public: {
        http: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
      },
    },
    blockExplorers: {
      default: {
        name: "BNBScan",
        url: "https://testnet.bsctrace.com",
      },
    },
    testnet: true,
  },

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect on the local network
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey:
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ||
    "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
    "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,

  /**
   * Auto connect:
   * 1. If the user was connected into a wallet before, on page reload reconnect automatically
   * 2. If user is not connected to any wallet:  On reload, connect to burner wallet if burnerWallet.enabled is true && burnerWallet.onlyLocal is false
   */
  walletAutoConnect: true,
};


const docs = `# CRW Interactor API Documentation

This document provides details for all available endpoints in the CRW Interactor API.

## Base URL
All endpoints are relative to the base URL where the service is hosted, typically \`http://localhost:8000\`.

## Endpoints

### GET /
Returns a simple status message to confirm the API is running.

**Example:**
\`\`\`bash
curl http://localhost:8000/
\`\`\`

**Response:**
\`\`\`json
{
  "message": "CRW Interactor API is running"
}
\`\`\`


### GET /admin_gen
Generates a new admin account with an Ethereum address and private key. Only creates a new admin if one doesn't already exist.

**Example:**
\`\`\`bash
curl http://localhost:8000/admin_gen
\`\`\`

**Response (success - new admin created):**
\`\`\`json
{
  "address": "0x...",
  "privateKey": "0x..."
}
\`\`\`


**Response (admin already exists):**
\`\`\`json
{
  "message": "admin already set"
}
\`\`\`


### GET /acct_gen
Generates a new Ethereum account and stores it in the KV store.

**Example:**
\`\`\`bash
curl http://localhost:8000/acct_gen
\`\`\`

**Response:**
\`\`\`json
"0x..." // The address of the newly created account
\`\`\`


### GET /admin_get_with_balance
Retrieves the admin account with its current balance.

**Example:**
\`\`\`bash
curl http://localhost:8000/admin_get_with_balance
\`\`\`

**Response (success):**
\`\`\`json
[
  {
    "addr": "0x...",
    "balance": "0.05" // Balance in tBNB
  }
]
\`\`\`


**Response (admin not found):**
\`\`\`json
{
  "error": "Admin not found"
}
\`\`\`


### GET /accts_get
Returns a list of all account addresses stored in the system.

**Example:**
\`\`\`bash
curl http://localhost:8000/accts_get
\`\`\`

**Response:**
\`\`\`json
[
  "0x123...",
  "0x456...",
  "0x789..."
]
\`\`\`


### GET /accts_get_with_balances
Returns all accounts with their current balances.

**Example:**
\`\`\`bash
curl http://localhost:8000/accts_get_with_balances
\`\`\`

**Response:**
\`\`\`json
[
  {
    "addr": "0x123...",
    "balance": "0.01"
  },
  {
    "addr": "0x456...",
    "balance": "0.02"
  }
]
\`\`\`


### GET /read_all/:address
Retrieves all data items stored for a specific address.

**Example:**
\`\`\`bash
curl http://localhost:8000/read_all/0x123456789abcdef123456789abcdef123456789
\`\`\`

**Parameters:**
- \`address\`: Ethereum address to query

**Response (success):**
\`\`\`json
{
  "items": [
    {
      "content": "Sample content 1",
      "timestamp": 1678901234,
      "date": "2023-03-15T12:34:56.000Z"
    },
    {
      "content": "Sample content 2",
      "timestamp": 1678902345,
      "date": "2023-03-15T12:45:45.000Z"
    }
  ]
}
\`\`\`


**Response (error):**
\`\`\`json
{
  "error": "Failed to read items"
}
\`\`\`


### GET /read_index/:address
Returns the current index for a specific address.

**Example:**
\`\`\`bash
curl http://localhost:8000/read_index/0x123456789abcdef123456789abcdef123456789
\`\`\`

**Parameters:**
- \`address\`: Ethereum address to query

**Response (success):**
\`\`\`json
{
  "index": 5
}
\`\`\`


**Response (error):**
\`\`\`json
{
  "error": "Failed to read index"
}
\`\`\`


### GET /read_item/:address/:index
Retrieves a specific item by address and index.

**Example:**
\`\`\`bash
curl http://localhost:8000/read_item/0x123456789abcdef123456789abcdef123456789/2
\`\`\`

**Parameters:**
- \`address\`: Ethereum address to query
- \`index\`: Index of the item to retrieve

**Response (success):**
\`\`\`json
{
  "item": {
    "content": "Sample content",
    "timestamp": 1678901234,
    "date": "2023-03-15T12:34:56.000Z"
  }
}
\`\`\`


**Response (error):**
\`\`\`json
{
  "error": "Failed to read item"
}
\`\`\`


### POST /record_insert
Adds a new record to the blockchain for a specific address. If the address has insufficient funds, it will automatically transfer tBNB from the admin account.

**Example:**
\`\`\`bash
curl -X POST http://localhost:8000/record_insert \\
  -H "Content-Type: application/json" \\
  -d '{"addr": "0x123456789abcdef123456789abcdef123456789", "record": "Content to be stored on the blockchain"}'
\`\`\`

**Request Body:**
\`\`\`json
{
  "addr": "0x...",
  "record": "Content to be stored on the blockchain"
}
\`\`\`


**Response (success):**
\`\`\`json
{
  "success": true,
  "transactionHash": "0x..."
}
\`\`\`


**Response (error):**
\`\`\`json
{
  "error": "Failed to add item"
}
\`\`\`


## Error Handling
All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad request (missing parameters)
- 404: Resource not found
- 500: Server error

## Authentication
The API currently uses direct private key access for blockchain transactions. In a production environment, a more secure authentication mechanism should be implemented.
`;


console.log("Hello from CRW Interactor!");

const router = new Router();

// Generate a new Ethereum account & save it to the kv.
async function genAcct() {
  const kv = await Deno.openKv();

  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();
  const address = wallet.address;
  const privateKey = wallet.privateKey;

  // Store the private key in the KV store
  await kv.set(["acct", address], privateKey);

  return {
    address,
    privateKey,
  };
}

async function genAdmin() {
  const kv = await Deno.openKv();
  const adminEntries = kv.list({ prefix: ["admin"] });
  
  // Check if admin already exists
  for await (const entry of adminEntries) {
    if (entry.key.length >= 2) {
      return { message: "admin already set" };
    }
  }

  const wallet = ethers.Wallet.createRandom();
  const address = wallet.address;
  const privateKey = wallet.privateKey;
  await kv.set(["admin", address], privateKey);
  return {
    address,
    privateKey,
  };
}

async function getAdmin() {
  const kv = await Deno.openKv();
  const adminEntries = kv.list({ prefix: ["admin"] });  
  // Extract the first admin entry
  for await (const entry of adminEntries) {
    if (entry.key.length >= 2) {
      const address = entry.key[1] as string;
      const privateKey = entry.value as string;
      return {
        address,
        privateKey
      };
    }
  }
  
  return null; // Return null if no admin found
}

async function getBalances(accts: string[]) {
   const addrsAndBalances = await Promise.all(accts.map(async (acct) => {
        const balance = await provider.getBalance(acct);
        return {
          addr: acct, 
          // Format the balance as a decimal string in ETH units
          balance: ethers.utils.formatEther(balance)
        };
    }))
  return addrsAndBalances;
}

async function getAcctWithPriv(addr: string) {
    const kv = await Deno.openKv();
    const acct = kv.get(["acct", addr]);
    return acct;
}

async function getAccts() {
  const kv = await Deno.openKv();
  const accts = kv.list({ prefix: ["acct"] });

  const addresses: string[] = [];
  for await (const entry of accts) {
    // Extract the address from the key (second element in the key array)
    if (entry.key.length >= 2) {
      addresses.push(entry.key[1] as string);
    }
  }
  return addresses;
}

// Configuration for your smart contract
const contractABI = [
  // Write Functions
  "function add_item(string data) nonpayable",

  // Read-Only Functions
  "function read_all(address addr) view returns (tuple(string content, uint256 timestamp)[])",
  "function read_index(address addr) view returns (uint256)",
  "function read_item(address addr, uint256 index) view returns (tuple(string content, uint256 timestamp))",
];
const contractAddress = contracts.contracts.crw.address;

// Provider URL, you should replace it with your actual Optimism provider
const provider = new ethers.providers.JsonRpcProvider(
  scaffoldConfig.targetNetwork.rpcUrls.default.http[0]
);

const contract = new ethers.Contract(contractAddress, contractABI, provider);

// generate the router based on the contractABI.
router
    .get("/docs", async (context) => {
        context.response.body = docs;
    })
    .get("/", (context) => {
    context.response.body = { message: "CRW Interactor API is running" };
  })
  .get("/admin_gen", async (context) => {
    const admin = await genAdmin();
    context.response.body = admin;
  })
  .get("/acct_gen", async (context) => {
    const acct = await genAcct();
    context.response.body = acct.address;
  })
  .get("/admin_get_with_balance", async (context) => {
    const admin = await getAdmin();
    if (!admin) {
      context.response.status = 404;
      context.response.body = { error: "Admin not found" };
      return;
    }
    const addrsAndBalances = await getBalances([admin.address]);
    context.response.body = addrsAndBalances;
  })
  .get("/accts_get", async (context) => {
    const accts = await getAccts();
    context.response.body = accts;
  })
  .get("/accts_get_with_balances", async (context) => {
    const accts = await getAccts();
    const addrsAndBalances = await getBalances(accts);
    context.response.body = addrsAndBalances;
  })
  .get("/read_all/:address", async (context) => {
    try {
      const address = context.params.address;
      if (!address) {
        context.response.status = 400;
        context.response.body = { error: "Address parameter is required" };
        return;
      }

      const data = await contract.read_all(address);

      // Transform the data to a more readable format
      const formattedData = data.map((item) => ({
        content: item.content,
        timestamp: parseInt(item.timestamp.toString()),
        date: new Date(
          parseInt(item.timestamp.toString()) * 1000
        ).toISOString(),
      }));

      context.response.body = { items: formattedData };
    } catch (error) {
      console.error("Error reading all items:", error);
      context.response.status = 500;
      context.response.body = { error: "Failed to read items" };
    }
  })
  .get("/read_index/:address", async (context) => {
    try {
      const address = context.params.address;
      if (!address) {
        context.response.status = 400;
        context.response.body = { error: "Address parameter is required" };
        return;
      }

      const index = await contract.read_index(address);
      context.response.body = { index: parseInt(index.toString()) };
    } catch (error) {
      console.error("Error reading index:", error);
      context.response.status = 500;
      context.response.body = { error: "Failed to read index" };
    }
  })
  .get("/read_item/:address/:index", async (context) => {
    try {
      const address = context.params.address;
      const index = context.params.index;

      if (!address || index === undefined) {
        context.response.status = 400;
        context.response.body = {
          error: "Address and index parameters are required",
        };
        return;
      }

      const item = await contract.read_item(address, parseInt(index));

      // Transform the data to a more readable format
      const formattedItem = {
        content: item.content,
        timestamp: parseInt(item.timestamp.toString()),
        date: new Date(
          parseInt(item.timestamp.toString()) * 1000
        ).toISOString(),
      };

      context.response.body = { item: formattedItem };
    } catch (error) {
      console.error("Error reading item:", error);
      context.response.status = 500;
      context.response.body = { error: "Failed to read item" };
    }
  })
  .post("/record_insert", async (context) => {
    try {
      // For this endpoint, we'll need a private key to sign the transaction
      // This is just a placeholder - in a real app, you'd need to handle authentication
      // and use a secure way to manage private keys
      let payload = await context.request.body.text();
      payload = JSON.parse(payload);
      const addr = payload.addr;
      
      // Check the balance of the addr first
      const balance = await provider.getBalance(addr);
      // Get minimum balance from environment variable or use default
      const minBalanceStr = Deno.env.get("EVERY_ADDR_MIN") || "0.001";
      const minBalance = ethers.utils.parseEther(minBalanceStr); // Use env var or default to 0.001 tBNB
      
      // If balance is less than minimum, transfer double that amount from admin
      if (balance.lt(minBalance)) {
        const admin = await getAdmin();
        if (!admin) {
          context.response.status = 500;
          context.response.body = { error: "Admin not found" };
          return;
        }
        
        const adminWallet = new ethers.Wallet(admin.privateKey, provider);
        const transferAmount = ethers.utils.parseEther(
          (parseFloat(minBalanceStr) * 2).toString()
        ); // Double the minimum amount
        
        // Send transaction to transfer tBNB
        const tx = await adminWallet.sendTransaction({
          to: addr,
          value: transferAmount
        });
        
        // Wait for transaction to be mined
        await tx.wait();
        console.log(`Transferred ${transferAmount} tBNB from admin to ${addr}, tx hash: ${tx.hash}`);
      }
      
      const record = payload.record;

      if (!addr || !record) {
        context.response.status = 400;
        context.response.body = { error: "Addr and Record are required" };
        return;
      }
      const acct = await getAcctWithPriv(addr);
      if (!acct) {
        context.response.status = 400;
        context.response.body = { error: "Acct not found" };
        return;
      }
      
      const wallet = new ethers.Wallet(acct.value, provider);
      const contractWithSigner = contract.connect(wallet);

      const tx = await contractWithSigner.add_item(record);
      const receipt = await tx.wait();

      context.response.body = {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error("Error adding item:", error);
      context.response.status = 500;
      context.response.body = { error: "Failed to add item" };
    }
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });