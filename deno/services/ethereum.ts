import { ethers } from "https://cdn.skypack.dev/ethers@5.6.8";
import { extractTransactionInfo } from "../utils/utils.ts";

// Contract configuration
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
  pollingInterval: 30000,
};

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

// Two levels of accounts:
// 1. admin: the admin account, which is used to manage the whole wallet.
// 2. user: the user account
export async function ethGenAcctWithoutSavePrivKey(if_admin: boolean) {
  const kv = await Deno.openKv();

  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();
  const address = wallet.address;
  const privateKey = wallet.privateKey;

  // if if_admin is true, then set the address to the admin.
  if (if_admin) {
    console.log("set the address to the admin");
    await kv.set(["acct", "eth", "admin"], address);
  } else {
    // Not Store the private key in the KV store
    await kv.set(["acct", "eth", address], {});
  }

  return {
    address,
    privateKey,
  };
}

export async function ethGetBalances(addr: string) {
  const network = await get_network();
  const provider = new ethers.providers.JsonRpcProvider(
    network.rpcUrl
  );
  const balance = await provider.getBalance(addr);
  const balance_eth = ethers.utils.formatEther(balance);
  const balance_usdt = await erc20Balance(addr, network.usdtContractAddress, network.rpcUrl);
  // enum the tokensAddresses, get the balance of each token.
  const tokensAddresses = network.tokensAddresses;
  // balances = {tokenAddr1: balance1, tokenAddr2: balance2, ...}
  const tokenBalances = await Promise.all(tokensAddresses.map(async (tokenAddress) => {
    const balance = await erc20Balance(addr, tokenAddress, network.rpcUrl);
    return { tokenAddress, balance };
  }));

  // Convert array of balances to object format
  const balances = tokenBalances.reduce((acc, { tokenAddress, balance }) => {
    acc[tokenAddress] = balance;
    return acc;
  }, {} as Record<string, string>);

  return {
    balance_eth: balance_eth.toString(),
    balance_usdt: balance_usdt.toString(),
    balances: balances
  };
}

// Generate a new Ethereum account & save it to the kv.
export async function ethGenAcct() {
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

export async function ethGenAdmin() {
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

export async function getAdmin() {
  const kv = await Deno.openKv();
  const adminEntries = kv.list({ prefix: ["admin"] });
  // Extract the first admin entry
  for await (const entry of adminEntries) {
    if (entry.key.length >= 2) {
      const address = entry.key[1] as string;
      const privateKey = entry.value as string;
      return {
        address,
        privateKey,
      };
    }
  }

  return null; // Return null if no admin found
}

export async function getAcctWithPriv(addr: string) {
  const kv = await Deno.openKv();
  const acct = kv.get(["acct", addr]);
  return acct;
}

export async function getAccts() {
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

export async function removeTokenAddress(tokenAddress: string) {
  const kv = await Deno.openKv();
  const network = await get_network();
  let tokensAddresses = network.tokensAddresses;
  tokensAddresses = tokensAddresses.filter((addr) => addr !== tokenAddress);
  await kv.set(["env", "eth", "network"], {
    ...network,
    tokensAddresses: tokensAddresses
  });
  return { message: "Token address removed successfully" };
}

export async function addTokenAddress(tokenAddress: string) {
  const kv = await Deno.openKv();
  const network = await get_network();
  const tokensAddresses = network.tokensAddresses;
  tokensAddresses.push(tokenAddress);
  await kv.set(["env", "eth", "network"], {
    ...network,
    tokensAddresses: tokensAddresses
  });
  return { message: "Token address added successfully" };
}

export async function eth_set_network(network: string) {
  const kv = await Deno.openKv();
  
  // Map network aliases to their RPC URLs
  const networkMap: { [key: string]: string } = {
    "op": "https://mainnet.optimism.io",
    "op_test": "https://sepolia.optimism.io"
  };

  const faucetMap: { [key: string]: string } = {
    "op": "",
    "op_test": "https://console.optimism.io/faucet"
  };

  const usdtMap: { [key: string]: string } = {
    "op": "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
    "op_test": "0x604dcaEC4E9ad55737F00D87B47ae497d2d78608"
  };

  // Get the RPC URL for the network
  const rpcUrl = networkMap[network] || network;
  const faucetUrl = faucetMap[network];
  const usdtContractAddress = usdtMap[network];
  
  // Store both the network alias and RPC URL
  // 
  await kv.set(["env", "eth", "network"], {
    alias: network,
    rpcUrl: rpcUrl,
    faucetUrl: faucetUrl,
    usdtContractAddress: usdtContractAddress,
    tokensAddresses: [], 
    // the lowest gas fee for erc20 transfer on op network is:
    minBalance: "0.0015", 
    // everytime transfer from admin to user, the default fee: 
    // gasForSweep:  "0.00000015"
  });
  
  return { message: "Network set successfully" };
}

export async function eth_set_min_balance(minBalance: number) {
  const kv = await Deno.openKv();
  const network = await get_network();
  await kv.set(["env", "eth", "network"], {
    ...network,
    minBalance: minBalance
  });
  return { message: "Min balance set successfully" };
}

// export async function eth_set_gas_for_sweep(gasForSweep: number) {
//   const kv = await Deno.openKv();
//   const network = await get_network();
//   await kv.set(["env", "eth", "network"], {
//     ...network,
//     gasForSweep: gasForSweep
//   });
//   return { message: "Gas for sweep set successfully" };
// }


export async function get_network() {
  const kv = await Deno.openKv();
  const resp = await kv.get(["env", "eth", "network"]);
  return resp.value || { alias: "op_test", rpcUrl: "https://sepolia.optimism.io", faucetUrl: "https://console.optimism.io/faucet", usdtContractAddress: "" };
}


// TODO: make them not hardcoded.
export async function get_valid_networks() {
  return ["op", "op_test"];
}

export async function getContract() {
  const network = await get_network();
  const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  return { contract, provider };
}

export async function getBalances(accts: string[]) {
  const network = await get_network();
  const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
  
  const addrsAndBalances = await Promise.all(
    accts.map(async (acct) => {
      const balance = await provider.getBalance(acct);
      return {
        addr: acct,
        // Format the balance as a decimal string in ETH units
        balance: ethers.utils.formatEther(balance),
      };
    })
  );
  return addrsAndBalances;
}

export async function erc20Info(contractAddress: string, rpcUrl: string) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const ABI = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",

    // Authenticated Functions
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
  ];

  try {
    const contract = new ethers.Contract(contractAddress, ABI, provider);
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    return { name: name, symbol: symbol, decimals: decimals };
  } catch (error) {
    console.error("Error fetching ERC20 info:", error);
    return "0";
  }
}

export async function erc20Transfer(privKey: string, rpcUrl: string, contractAddress: string, toAddr: string, amount: number) {
  const ABI = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",

    // Authenticated Functions
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
  ];
  /* steps
    - gen wallet from privey.
    - get decimals of the token.
    - connect the wallet to the contract.
    - amount = amount * 10^decimals
    - transfer the amount.
    - get the receipt.
  */
  const wallet = new ethers.Wallet(privKey, new ethers.providers.JsonRpcProvider(rpcUrl));
  console.log("wallet: ", wallet.address);
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, ABI, provider);
  const decimals = await contract.decimals();
  const amount_decimal = ethers.utils.parseUnits(amount.toString(), decimals);
  const tx = await contract.connect(wallet).transfer(toAddr, amount_decimal);
  const receipt = await tx.wait();
  
  const transactionInfo = extractTransactionInfo(receipt);
  return {
    ...transactionInfo,
    from: wallet.address,
    to: toAddr,
    amount: amount.toString()
  };
}

export async function erc20Balance(addr: string, contractAddress: string, rpcUrl: string) {
  if (!contractAddress) return "0";
  
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const ABI = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",

    // Authenticated Functions
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
  ];
  
  try {
    const contract = new ethers.Contract(contractAddress, ABI, provider);
    const balance = await contract.balanceOf(addr);
    // use decimal to convert the balance.
    const decimals = await contract.decimals();
    const balance_decimal = ethers.utils.formatUnits(balance, decimals);
    return balance_decimal;
  } catch (error) {
    console.error("Error fetching ERC20 balance:", error);
    return "0";
  }
} 