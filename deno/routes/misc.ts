import { Router } from "https://deno.land/x/oak/mod.ts";
import { getAccts, getAcctWithPriv, getBalances } from "../services/ethereum.ts";
import { set_env_password, check_env_password } from "../utils/auth.ts";

const miscRouter = new Router();


const docs = `# Wallet System API Documentation

This document provides details for all available endpoints in the Wallet System API.

## Base URL
All endpoints are relative to the base URL where the service is hosted, typically \`https://crw-interactor.deno.dev\`.

## Security Notice
> ⚠️ SECURITY ADVISORY: For operations involving private keys, it is strongly recommended to perform these operations only within internal networks for service-to-service interactions.
> now there are 2 type of APIs that refer the private key:
> 1. /eth/sweep/*
> 2. /eth/transfer/*

## Authentication
The API uses two types of authentication:
1. Password-based authentication for administrative operations
2. Direct private key access for blockchain transactions

Note: In a production environment, a more secure authentication mechanism should be implemented for private key operations.

## Endpoints

### System Status

### GET /
Returns a simple status message to confirm the API is running.

**Example:**
\`\`\`bash
curl https://crw-interactor.deno.dev/
\`\`\`

**Response:**
\`\`\`json
{
  "message": "CRW Interactor API is running"
}
\`\`\`

### GET /docs
Returns the full API documentation.

### Password Management

### GET /set_env_password
Sets or updates the environment password.

**Example:**
\`\`\`bash
# Set initial password
curl "https://crw-interactor.deno.dev/set_env_password?password=your_new_password"

# Update existing password
curl "https://crw-interactor.deno.dev/set_env_password?password=your_new_password&password_now=current_password"
\`\`\`

**Query Parameters:**
- \`password\`: The new password to set
- \`password_now\`: (Required when updating) The current password

**Response (success):**
\`\`\`json
{
  "message": "Password set successfully"
}
\`\`\`

**Response (error):**
\`\`\`json
{
  "error": "Invalid password"
}
\`\`\`

### GET /check_env_password
Verifies if a password is valid.

**Example:**
\`\`\`bash
curl "https://crw-interactor.deno.dev/check_env_password?password=your_password"
\`\`\`

**Query Parameters:**
- \`password\`: The password to verify

**Response:**
\`\`\`json
{
  "isValid": true,
  "message": "Password is valid",
  "exists": true
}
\`\`\`

### Token Management

### GET /eth/add_token_address/:tokenAddress
Adds a new token address to track. Requires password authentication.

**Example:**
\`\`\`bash
curl "https://crw-interactor.deno.dev/eth/add_token_address/0x123...?password=your_password"
\`\`\`

**Parameters:**
- \`tokenAddress\`: The token contract address to add
- \`password\`: (query) Authentication password

**Response (success):**
\`\`\`json
{
  "message": "Token address added successfully"
}
\`\`\`

### GET /eth/remove_token_address/:tokenAddress
Removes a token address from tracking. Requires password authentication.

**Example:**
\`\`\`bash
curl "https://crw-interactor.deno.dev/eth/remove_token_address/0x123...?password=your_password"
\`\`\`

**Parameters:**
- \`tokenAddress\`: The token contract address to remove
- \`password\`: (query) Authentication password

**Response (success):**
\`\`\`json
{
  "message": "Token address removed successfully"
}
\`\`\`

### USDT Operations

### GET /eth/sweep/usdt
Sweeps USDT from an address to the admin address. Handles gas fees automatically.

**Example:**
\`\`\`bash
curl "https://crw-interactor.deno.dev/eth/sweep/usdt?priv=user_private_key&privAdmin=admin_private_key"
\`\`\`

**Query Parameters:**
- \`priv\`: Private key of the source address
- \`privAdmin\`: Private key of the admin address

**Response (no action needed):**
\`\`\`json
{
  "status": "no_action",
  "message": "USDT balance is less than 1",
  "balance": "0.5"
}
\`\`\`

**Response (success):**
\`\`\`json
{
  "status": "success",
  "message": "USDT swept successfully",
  "initial_balance": {
    "usdt": "100.0",
    "eth": "0.001"
  },
  "gas_transfer": {
    "hash": "0x...",
    "amount": "0.0015"
  },
  "usdt_transfer": {
    "transactionHash": "0x...",
    "status": 1,
    "from": "0x...",
    "to": "0x...",
    "amount": "100.0"
  }
}
\`\`\`

### Network Configuration

### GET /eth/set_network
Sets the Ethereum network configuration.

**Example:**
\`\`\`bash
curl "https://crw-interactor.deno.dev/eth/set_network?network=op_test"
\`\`\`

**Query Parameters:**
- \`network\`: Network identifier (e.g., "op", "op_test")

**Response:**
\`\`\`json
{
  "message": "Network set successfully"
}
\`\`\`

### GET /eth/set_min_balance
Sets the minimum balance threshold for gas fees.

**Example:**
\`\`\`bash
curl "https://crw-interactor.deno.dev/eth/set_min_balance?balance=0.0015"
\`\`\`

**Query Parameters:**
- \`balance\`: Minimum balance in ETH

**Response:**
\`\`\`json
{
  "message": "Min balance set successfully"
}
\`\`\`

### GET /eth/set_gas_for_sweep
Sets the gas amount to be used for sweep operations.

**Example:**
\`\`\`bash
curl "https://crw-interactor.deno.dev/eth/set_gas_for_sweep?gas=0.002"
\`\`\`

**Query Parameters:**
- \`gas\`: Gas amount in ETH

**Response:**
\`\`\`json
{
  "message": "Gas for sweep set successfully"
}
\`\`\`

### Account Management

### GET /admin_gen
Generates a new admin account with an Ethereum address and private key.

**Example:**
\`\`\`bash
curl https://crw-interactor.deno.dev/admin_gen
\`\`\`

**Response (success):**
\`\`\`json
{
  "address": "0x...",
  "privateKey": "0x..."
}
\`\`\`

### GET /acct_gen
Generates a new Ethereum account and stores it in the KV store.

**Example:**
\`\`\`bash
curl https://crw-interactor.deno.dev/acct_gen
\`\`\`

**Response:**
\`\`\`json
"0x..." // The address of the newly created account
\`\`\`

### GET /accts_get
Returns a list of all account addresses stored in the system.

**Example:**
\`\`\`bash
curl https://crw-interactor.deno.dev/accts_get
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
curl https://crw-interactor.deno.dev/accts_get_with_balances
\`\`\`

**Response:**
\`\`\`json
[
  {
    "addr": "0x123...",
    "balance": "0.01",
    "tokens": {
      "0xtoken1": "100.0",
      "0xtoken2": "50.5"
    }
  }
]
\`\`\`

### TRON Operations

### GET /trx/tx/:tx_id
Retrieves transaction details for a TRON transaction.

**Example:**
\`\`\`bash
curl https://crw-interactor.deno.dev/trx/tx/123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234
\`\`\`

**Parameters:**
- \`tx_id\`: TRON transaction ID (64 character hex string)

**Response (success):**
\`\`\`json
{
  "hash": "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234",
  "from": "0x123...",
  "to": "0x456...",
  "value": 100,
  "status": "success",
  "ifToIsTrxAddrActive": true
}
\`\`\`

### GET /trx/addr_gen
Generates a new TRON account.

**Example:**
\`\`\`bash
curl https://crw-interactor.deno.dev/trx/addr_gen
\`\`\`

### GET /trx/balance
Gets the balance of the active TRON address.

**Example:**
\`\`\`bash
curl https://crw-interactor.deno.dev/trx/balance
\`\`\`

**Response (success):**
\`\`\`json
{
  "addr": "T123...",
  "balance": 100.5,
  "before": "T123..."
}
\`\`\`

### GET /trx/balance/:trx_addr
Gets the balance of a specific TRON address.

**Example:**
\`\`\`bash
curl https://crw-interactor.deno.dev/trx/balance/T123456789abcdef123456789abcdef123456789
\`\`\`

**Parameters:**
- \`trx_addr\`: TRON address to query

**Response (success):**
\`\`\`json
{
  "addr": "T123...",
  "balance": 100.5,
  "before": 100.0
}
\`\`\`

### GET /trx/trx_addr_insert
Sets a TRON address as the active address.

**Example:**
\`\`\`bash
curl https://crw-interactor.deno.dev/trx/trx_addr_insert?trx_addr=T123456789abcdef123456789abcdef123456789
\`\`\`

**Query Parameters:**
- \`trx_addr\`: TRON address to set as active

**Response (success):**
\`\`\`json
{
  "message": "trx_addr inserted successfully"
}
\`\`\`

### GET /trx/trx_addrs
Lists all TRON addresses.

**Example:**
\`\`\`bash
curl https://crw-interactor.deno.dev/trx/trx_addrs
\`\`\`

### GET /trx/trx_addr/:trx_addr
Gets information about a specific TRON address.

**Example:**
\`\`\`bash
curl https://crw-interactor.deno.dev/trx/trx_addr/T123456789abcdef123456789abcdef123456789
\`\`\`

**Parameters:**
- \`trx_addr\`: TRON address to query

## Error Handling
All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad request (missing parameters)
- 401: Unauthorized (invalid password)
- 404: Resource not found
- 500: Server error

## Rate Limiting
The API currently does not implement rate limiting. In a production environment, appropriate rate limiting should be implemented to prevent abuse.
`;

miscRouter
  .get("/", (context) => {
    context.response.body = { message: "Multi-Chain Wallet System API is running" };
  })
  .get("/docs", async (context: any) => {
    // the docs is hardcoded now, maybe a better way in the future?
    context.response.body = docs;
  })
  // ! only in dev mode, to get the password.
  // .get("/get_password", async (context) => {
  //   const kv = await Deno.openKv();
  //   const passwd = await kv.get(["env","password"]);
  //   context.response.body = passwd.value;
  // })
  .get("/set_env_password", async (context) => {
    const queryParams = context.request.url.searchParams;
    const password = queryParams.get("password");
    const password_now_in_param = queryParams.get("password_now");
    
    if (!password) {
      context.response.body = { error: "Password parameter is required" };
      return;
    }
    
    const result = await set_env_password(password, password_now_in_param || undefined);
    
    if (result.success) {
      context.response.body = { message: result.message };
    } else {
      context.response.body = { error: result.error || result.message };
    }
  })
  .get("/check_env_password", async (context) => {
    const queryParams = context.request.url.searchParams;
    const password = queryParams.get("password");
    
    if (!password) {
      context.response.body = { error: "Password parameter is required" };
      return;
    }
    
    const result = await check_env_password(password);
    
    context.response.body = {
      isValid: result.isValid,
      message: result.message,
      exists: result.exists
    };
  })
  .get("/accts_get", async (context) => {
    const accts = await getAccts();
    context.response.body = accts;
  })
  .get("/accts_get_with_balances", async (context) => {
    const accts = await getAccts();
    const addrsAndBalances = await getBalances(accts);
    context.response.body = addrsAndBalances;
  });

export default miscRouter; 