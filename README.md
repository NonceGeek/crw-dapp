# 🪶 Feather Multi Chain Wallet System

<h4 align="center">
  <a href="TODO"> -[ Lanuch App ]- </a>
</h4>


🪶 Feather Multi Chain Wallet System, 基于 deno 的多链支持的钱包系统，像羽毛一样轻。

# Multi-Chain Wallet System Backend

A Deno-based backend service for managing multi-chain cryptocurrency wallets, supporting Ethereum and TRON networks.

## Features

- Multi-chain support (Ethereum, Tron, Bitcoin, Aptos, Sui...)
- Account management and generation
- Token operations (USDT transfers, sweeping)
- Password-protected administrative operations
- Balance checking and monitoring
- Network configuration management
- Comprehensive API documentation

## Prerequisites

- [Deno](https://deno.land/) version 1.x or higher
- Access to Ethereum and TRON networks (mainnet/testnet)
- Environment for secure key management

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd feather-multi-chain-wallet-system
```

2. Install Deno (if not already installed):
- macOS/Linux:
```bash
curl -fsSL https://deno.land/x/install/install.sh | sh
```
- Windows:
```bash
iwr https://deno.land/x/install/install.ps1 -useb | iex
```

## Running the Server

Start the server in development mode:

```bash
deno task dev
```

Start the server in prod mode:

```
deno task start
```

The server will start on port 8000 by default.

## Security Considerations

⚠️ **IMPORTANT SECURITY ADVISORY**:
- Operations involving private keys should only be performed within internal networks for service-to-service interactions
- Currently, two types of APIs handle private keys:
  1. `/eth/sweep/*`
  2. `/eth/transfer/*`
- Implement proper security measures in production environments
- Never expose private key operations to public networks

## API Overview

The API is organized into several sections:

### System Status
- `GET /` - Check API status
- `GET /docs` - View API documentation

### Password Management
- `GET /set_env_password` - Set/update environment password
- `GET /check_env_password` - Verify password validity

### Token Management
- `GET /eth/add_token_address/:tokenAddress` - Add token address
- `GET /eth/remove_token_address/:tokenAddress` - Remove token address

### USDT Operations
- `GET /eth/sweep/usdt` - Sweep USDT to admin address
- `GET /eth/transfer/usdt` - Transfer USDT between addresses

### Network Configuration
- `GET /eth/set_network` - Set Ethereum network
- `GET /eth/set_min_balance` - Set minimum balance threshold
- `GET /eth/set_gas_for_sweep` - Set gas amount for sweep operations

### Account Management
- `GET /admin_gen` - Generate admin account
- `GET /acct_gen` - Generate new account
- `GET /accts_get` - List all accounts
- `GET /accts_get_with_balances` - Get accounts with balances

### TRON Operations(TBD)
- Various endpoints for TRON address management and transactions

For detailed API documentation, visit `/docs` endpoint after starting the server.

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 404: Not found
- 500: Server error

## Development

### Project Structure

```
deno/
├── app.ts              # Application entry point
├── routes/            
│   ├── ethereum.ts     # Ethereum-related routes
│   ├── tron.ts        # TRON-related routes
│   └── misc.ts        # Miscellaneous routes
├── services/
│   └── ethereum.ts     # Ethereum service implementations
└── utils/
    ├── auth.ts        # Authentication utilities
    └── utils.ts       # General utilities
```

### Dependencies

- [Oak](https://deno.land/x/oak) - HTTP server framework
- [CORS](https://deno.land/x/cors) - CORS middleware
- Various blockchain-related libraries

## Production Deployment

For production deployment:

1. Implement proper authentication mechanisms
2. Set up rate limiting
3. Use secure environment variables
4. Configure CORS appropriately
5. Implement monitoring and logging
6. Use HTTPS
7. Regular security audits

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License

Copyright (c) 2024 Feather Multi Chain Wallet System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

# Multi-Chain Wallet System Frontend

TODO.
