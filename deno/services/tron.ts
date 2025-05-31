import { TronWeb } from "https://esm.sh/tronweb@6.0.0";

// Patch to use proto in the tronWeb, see the links:
// > https://github.com/tronprotocol/tronweb/issues/625
// > https://github.com/denoland/deno/issues/4324#issuecomment-1874651956
if (typeof Object.prototype.__proto__ === 'undefined') {
  Object.defineProperty(Object.prototype, '__proto__', {
    get: function() {
      return Object.getPrototypeOf(this);
    }
  });
}

export async function set_env_tron_api_url(if_prod: boolean) {
  const kv = await Deno.openKv();
  if (if_prod) {
    // todo: set tron_api_url in the kv.
    console.log("prod");
    await kv.set(["env","tron_api_url"], "https://api.trongrid.io/jsonrpc");
  } else {
    // todo: set tron_api_url in the kv.
    console.log("testnet");
    await kv.set(["env","tron_api_url"], "https://nile.trongrid.io/jsonrpc");
    // await kv.set(["env","tron_api_url"], "https://api.shasta.trongrid.io/jsonrpc");
  }

  return await kv.get(["env","tron_api_url"]);
}

export async function getTrxTx(tx_id: string) {
  try {
    // Validate transaction ID format (should be 64 characters hex string without 0x prefix)
    if (!/^[0-9a-fA-F]{64}$/.test(tx_id)) {
      return {
        error: "Invalid transaction ID format. Expected 64 character hex string."
      };
    }

    const kv = await Deno.openKv();
    const trx_addr_active = await kv.get(["trx_addr_active"]);

    // Add 0x prefix if not present (required for JSON-RPC calls)
    const formattedTxId = tx_id.startsWith('0x') ? tx_id : `0x${tx_id}`;
    
    // Get the TRON API URL from environment variable or use default
    const tronApiUrl = await kv.get(["env","tron_api_url"]) || "https://api.trongrid.io/jsonrpc";
    
    // Make direct RPC calls to get transaction details
    const txDetailsResponse = await fetch(tronApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 64,
        jsonrpc: "2.0",
        method: "eth_getTransactionByHash",
        params: [formattedTxId]
      })
    });
    
    const txDetailsData = await txDetailsResponse.json();
    const txDetails = txDetailsData.result;
    
    if (!txDetails) {
      return {
        error: "Transaction not found"
      };
    }
    
    // Get transaction receipt to check status
    const txReceiptResponse = await fetch(tronApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 64,
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [formattedTxId]
      })
    });
    
    const txReceiptData = await txReceiptResponse.json();
    const txReceipt = txReceiptData.result;
    
    return {
      hash: txDetails.hash,
      from: txDetails.from,
      to: txDetails.to,
      value: txDetails.value ? parseInt(txDetails.value, 16) / 1000000 : 0, // Convert hex to decimal TRX
      status: txReceipt ? (txReceipt.status === "0x1" ? "success" : "failed") : "pending",
      ifToIsTrxAddrActive: txDetails.to?.toLowerCase() === trx_addr_active?.value?.toLowerCase(),
    };
  } catch (error) {
    console.error(`Error fetching transaction ${tx_id}:`, error);
    return {
      error: `Failed to fetch transaction: ${error.message}`
    };
  }
} 

export async function getBalanceOfTRC20(addr: string) {
  // const tronWeb = new TronWeb({
  //   fullNode: 'https://api.trongrid.io',
  //   solidityNode: 'https://api.trongrid.io',
  // })
  let tronWeb = new TronWeb({ fullHost: "https://api.trongrid.io" });
  
  // set the owner address
  tronWeb.setAddress('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');

  let abi = [
    {
      'outputs': [{ 'type': 'uint256' }],
      'constant': true,
      'inputs': [{ 'name': 'who', 'type': 'address' }],
      'name': 'balanceOf',
      'stateMutability': 'View',
      'type': 'Function'
    },
    {
      'outputs': [{ 'type': 'bool' }],
      'inputs': [
        { 'name': '_to', 'type': 'address' },
        { 'name': '_value', 'type': 'uint256' }
      ],
      'name': 'transfer',
      'stateMutability': 'Nonpayable',
      'type': 'Function'
    }
  ];
  let contract = await tronWeb.contract(abi, "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");
  let result = await contract.balanceOf(addr).call();
  return result.toString(10);
}

export async function getTrxUSDTBalance(addr: string) {
  try {
    const kv = await Deno.openKv();
    let tronApiUrl = (await kv.get(["env","tron_api_url"]))?.value || "https://api.trongrid.io/jsonrpc";
    
    tronApiUrl = tronApiUrl.replace('/jsonrpc', '') + "/v1";
    // Call the TRON API to get the account details including TRC20 tokens
    const response = await fetch(`${tronApiUrl}/accounts/${addr}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Check if the request was successful and data exists
    if (data.success && data.data && data.data.length > 0) {
      // USDT contract address on TRON
      // if "shasta" in the tronApiUrl, then use the shasta usdt contract address: TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs, else use the mainnet usdt contract address: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
      // const usdtContractAddress = tronApiUrl.includes("shasta") ? "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs" : "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
      const usdtContractAddress = tronApiUrl.includes("nile") ? "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf" : "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
      // Extract USDT balance from trc20 array if it exists
      let usdtBalance = 0;
      const trc20Tokens = data.data[0].trc20;
      
      if (trc20Tokens) {
        for (const token of trc20Tokens) {
          if (token[usdtContractAddress]) {
            // USDT has 6 decimals on TRON
            usdtBalance = parseInt(token[usdtContractAddress]) / 1_000_000;
            break;
          }
        }
      }

      return {
        address: addr,
        usdtBalance: usdtBalance,
        rawBalance: usdtBalance * 1_000_000
      };
    } else {
      return {
        address: addr,
        usdtBalance: 0,
        error: "No data found for this address"
      };
    }
  } catch (error) {
    console.error(`Error fetching USDT balance for ${addr}:`, error);
    return {
      address: addr,
      usdtBalance: 0,
      error: error.message
    };
  }
}

export async function getTrxBalance(addr: string) {
  try {
    // Get the TRON API URL from environment variable or use default
    const kv = await Deno.openKv();
    const tronApiUrl = (await kv.get(["env","tron_api_url"]))?.value?.replace('/jsonrpc', '') + "/v1" || "https://api.trongrid.io/v1";

    // Call the TRON API to get the balance
    const response = await fetch(`${tronApiUrl}/accounts/${addr}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Check if the request was successful and data exists
    if (data.success && data.data && data.data.length > 0) {
      // Extract the balance (in SUN, need to convert to TRX)
      const balanceInSun = data.data[0].balance || 0;
      // Convert from SUN to TRX (1 TRX = 1,000,000 SUN)
      const balanceInTrx = balanceInSun / 1_000_000;

      return {
        address: addr,
        balance: balanceInTrx,
        rawData: data,
      };
    } else {
      return {
        address: addr,
        balance: 0,
        error: "No data found for this address",
      };
    }
  } catch (error) {
    console.error(`Error fetching TRON balance for ${addr}:`, error);
    return {
      address: addr,
      balance: 0,
      error: error.message,
    };
  }
} 