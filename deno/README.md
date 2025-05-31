# CRW Interactor API Documentation

This document provides details for all available endpoints in the CRW Interactor API.

## Base URL
All endpoints are relative to the base URL: `https://crw-interactor.deno.dev`

## Endpoints

### GET /
Returns a simple status message to confirm the API is running.

**Example:**
```bash
curl https://crw-interactor.deno.dev/
```

**Response:**
```json
{
  "message": "CRW Interactor API is running"
}
```

### GET /docs
Returns the full API documentation.

**Example:**
```bash
curl https://crw-interactor.deno.dev/docs
```

### GET /admin_gen
Generates a new admin account with an Ethereum address and private key. Only creates a new admin if one doesn't already exist.

**Example:**
```bash
curl https://crw-interactor.deno.dev/admin_gen
```

**Response (success - new admin created):**
```json
{
  "address": "0x...",
  "privateKey": "0x..."
}
```

**Response (admin already exists):**
```json
{
  "message": "admin already set"
}
```

### GET /acct_gen
Generates a new Ethereum account and stores it in the KV store.

**Example:**
```bash
curl https://crw-interactor.deno.dev/acct_gen
```

**Response:**
```json
"0x..." 
```

### GET /admin_get_with_balance
Retrieves the admin account with its current balance.

**Example:**
```bash
curl https://crw-interactor.deno.dev/admin_get_with_balance
```

**Response (success):**
```json
[
  {
    "addr": "0x...",
    "balance": "0.05"
  }
]
```

**Response (admin not found):**
```json
{
  "error": "Admin not found"
}
```

### GET /accts_get
Returns a list of all account addresses stored in the system.

**Example:**
```bash
curl https://crw-interactor.deno.dev/accts_get
```

**Response:**
```json
[
  "0x123...",
  "0x456...",
  "0x789..."
]
```

### GET /accts_get_with_balances
Returns all accounts with their current balances.

**Example:**
```bash
curl https://crw-interactor.deno.dev/accts_get_with_balances
```

**Response:**
```json
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
```

### GET /read_all/:address
Retrieves all data items stored for a specific address.

**Example:**
```bash
curl https://crw-interactor.deno.dev/read_all/0x123456789abcdef123456789abcdef123456789
```

**Parameters:**
- `address`: Ethereum address to query

**Response (success):**
```json
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
```

**Response (error):**
```json
{
  "error": "Failed to read items"
}
```

### GET /read_index/:address
Returns the current index for a specific address.

**Example:**
```bash
curl https://crw-interactor.deno.dev/read_index/0x123456789abcdef123456789abcdef123456789
```

**Parameters:**
- `address`: Ethereum address to query

**Response (success):**
```json
{
  "index": 5
}
```

**Response (error):**
```json
{
  "error": "Failed to read index"
}
```

### GET /read_item/:address/:index
Retrieves a specific item by address and index.

**Example:**
```bash
curl https://crw-interactor.deno.dev/read_item/0x123456789abcdef123456789abcdef123456789/2
```

**Parameters:**
- `address`: Ethereum address to query
- `index`: Index of the item to retrieve

**Response (success):**
```json
{
  "item": {
    "content": "Sample content",
    "timestamp": 1678901234,
    "date": "2023-03-15T12:34:56.000Z"
  }
}
```

**Response (error):**
```json
{
  "error": "Failed to read item"
}
```

### POST /record_insert
Adds a new record to the blockchain for a specific address. If the address has insufficient funds, it will automatically transfer tBNB from the admin account.

**Example:**
```bash
curl -X POST https://crw-interactor.deno.dev/record_insert \
  -H "Content-Type: application/json" \
  -d '{"addr": "0x123456789abcdef123456789abcdef123456789", "record": "Content to be stored on the blockchain"}'
```

**Request Body:**
```json
{
  "addr": "0x...",
  "record": "Content to be stored on the blockchain"
}
```

**Response (success):**
```json
{
  "success": true,
  "transactionHash": "0x..."
}
```

**Response (error):**
```json
{
  "error": "Failed to add item"
}
```

### TRON-Related Endpoints

### GET /trx/tx/:tx_id
Retrieves transaction details for a TRON transaction.

**Example:**
```bash
curl https://crw-interactor.deno.dev/trx/tx/123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234
```

**Parameters:**
- `tx_id`: TRON transaction ID (64 character hex string)

**Response (success):**
```json
{
  "hash": "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234",
  "from": "0x123...",
  "to": "0x456...",
  "value": 100,
  "status": "success",
  "ifToIsTrxAddrActive": true
}
```

### GET /trx/addr_gen
Generates a new TRON account.

**Example:**
```bash
curl https://crw-interactor.deno.dev/trx/addr_gen
```

### GET /trx/balance
Gets the balance of the active TRON address.

**Example:**
```bash
curl https://crw-interactor.deno.dev/trx/balance
```

**Response (success):**
```json
{
  "addr": "T123...",
  "balance": 100.5,
  "before": "T123..."
}
```

### GET /trx/balance/:trx_addr
Gets the balance of a specific TRON address.

**Example:**
```bash
curl https://crw-interactor.deno.dev/trx/balance/T123456789abcdef123456789abcdef123456789
```

**Parameters:**
- `trx_addr`: TRON address to query

**Response (success):**
```json
{
  "addr": "T123...",
  "balance": 100.5,
  "before": 100.0
}
```

### GET /trx/trx_addr_insert
Sets a TRON address as the active address.

**Example:**
```bash
curl https://crw-interactor.deno.dev/trx/trx_addr_insert?trx_addr=T123456789abcdef123456789abcdef123456789
```

**Query Parameters:**
- `trx_addr`: TRON address to set as active

**Response (success):**
```json
{
  "message": "trx_addr inserted successfully"
}
```

### GET /trx/trx_addrs
Lists all TRON addresses.

**Example:**
```bash
curl https://crw-interactor.deno.dev/trx/trx_addrs
```

### GET /trx/trx_addr/:trx_addr
Gets information about a specific TRON address.

**Example:**
```bash
curl https://crw-interactor.deno.dev/trx/trx_addr/T123456789abcdef123456789abcdef123456789
```

**Parameters:**
- `trx_addr`: TRON address to query

## Error Handling
All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad request (missing parameters)
- 404: Resource not found
- 500: Server error

## Authentication
The API currently uses direct private key access for blockchain transactions. In a production environment, a more secure authentication mechanism should be implemented.

## Multi-Chain Wallet System

This is a lightweight recreation of an exchange's B2B wallet, implementing a Deno-based version with the following features:
- Native currency balance query
- Token balance query
- Address generation (non-custodial)
- Native currency deposit and withdrawal
- Token deposit and withdrawal
- Token consolidation (sweep)

### Project Structure

The project is organized in a modular way:

```
deno/
├── app.ts                  # Main application entry point
├── routes/                 # API route definitions
│   ├── ethereum.ts         # Ethereum-related endpoints
│   ├── tron.ts             # Tron-related endpoints
│   ├── contract.ts         # Smart contract interaction endpoints
│   └── misc.ts             # Miscellaneous endpoints
├── services/               # Business logic
│   ├── ethereum.ts         # Ethereum-related services
│   └── tron.ts             # Tron-related services
├── utils/                  # Helper utilities
└── deno.json               # Deno configuration
```

### Supported Chains

- EVM Chains (implemented)
- Tron (implemented)
- Aptos (TODO)
- Sui (TODO)
- Bitcoin (TODO)

### Running the Application

To run the application:

```bash
deno run --allow-net --allow-read --allow-env app.ts
```

Or use the included task:

```bash
deno task start
```

### API Documentation

See the full API documentation in the `docs` endpoint of the running application.

### Development

For development, you can use the watch mode:

```bash
deno run --watch --allow-net --allow-read --allow-env app.ts
```

### Type Checking

Run type checking with:

```bash
deno check app.ts
```
