import { Router } from "https://deno.land/x/oak/mod.ts";
import { ethers } from "https://cdn.skypack.dev/ethers@5.6.8";
import { erc20Transfer, eth_set_min_balance, eth_set_gas_for_sweep, get_valid_networks, removeTokenAddress, addTokenAddress, ethGenAcctWithoutSavePrivKey, getAdmin, get_network, ethGetBalances, eth_set_network, erc20Balance } from "../services/ethereum.ts";
import { check_env_password } from "../utils/auth.ts";

const ethRouter = new Router();

ethRouter
  // network spec
  .get("/eth/set_network", async (context) => {
    const queryParams = context.request.url.searchParams;
    const network = queryParams.get("network");
    const password = queryParams.get("password");

    const kv = await Deno.openKv();
    const passwd = await kv.get(["env","password"]);

    if (password !== passwd.value) {
      context.response.body = { error: "Invalid password" };
      return;
    }

    const resp = await eth_set_network(network);
    context.response.body = resp;
  })
  .get("/eth/set_min_balance", async (context) => {
    const queryParams = context.request.url.searchParams;
    // check the password
    const password = queryParams.get("password");
    if (!password) {
      context.response.body = { error: "Password is required" };
      context.response.status = 400;
      return;
    }

    const passwordCheck = await check_env_password(password);
    if (!passwordCheck.isValid) {
      context.response.body = { error: "Invalid password" };
      context.response.status = 401;
      return;
    }
    const minBalance = queryParams.get("minBalance");
    const resp = await eth_set_min_balance(minBalance);
    context.response.body = resp;
  })
  // .get("/eth/set_gas_for_sweep", async (context) => {
  //   const queryParams = context.request.url.searchParams;
  //   // check the password
  //   const password = queryParams.get("password");
  //   if (!password) {
  //     context.response.body = { error: "Password is required" };
  //     context.response.status = 400;
  //     return;
  //   }

  //   const passwordCheck = await check_env_password(password);
  //   if (!passwordCheck.isValid) {
  //     context.response.body = { error: "Invalid password" };
  //     context.response.status = 401;
  //     return;
  //   }
  //   const gasForSweep = queryParams.get("gasForSweep");
  //   const resp = await eth_set_gas_for_sweep(gasForSweep);
  //   context.response.body = resp;
  // })
  .get("/eth/get_valid_networks", async (context) => {
    const resp = await get_valid_networks();
    context.response.body = resp;
  })
  .get("/eth/get_network", async (context) => {
    const resp = await get_network();
    context.response.body = resp;
  })
  .get("/eth/add_token_address/:tokenAddress", async (context) => {
    const tokenAddress = context.params.tokenAddress;
    const password = context.request.url.searchParams.get("password");

    // Check if password is provided
    if (!password) {
      context.response.body = { error: "Password is required" };
      context.response.status = 400;
      return;
    }

    // Verify password
    const passwordCheck = await check_env_password(password);
    
    if (!passwordCheck.exists) {
      context.response.body = { error: "No password has been set. Please set a password first." };
      context.response.status = 401;
      return;
    }

    if (!passwordCheck.isValid) {
      context.response.body = { error: "Invalid password" };
      context.response.status = 401;
      return;
    }

    // If password is valid, proceed with adding token address
    const resp = await addTokenAddress(tokenAddress);
    context.response.body = resp;
  })
  .get("/eth/remove_token_address/:tokenAddress", async (context) => {
    const tokenAddress = context.params.tokenAddress;
    const password = context.request.url.searchParams.get("password");

    // Check if password is provided
    if (!password) {
      context.response.body = { error: "Password is required" };
      context.response.status = 400;
      return;
    }

    // Verify password
    const passwordCheck = await check_env_password(password);
    
    if (!passwordCheck.exists) {
      context.response.body = { error: "No password has been set. Please set a password first." };
      context.response.status = 401;
      return;
    }

    if (!passwordCheck.isValid) {
      context.response.body = { error: "Invalid password" };
      context.response.status = 401;
      return;
    }

    // If password is valid, proceed with removing token address
    const resp = await removeTokenAddress(tokenAddress);
    context.response.body = resp;
  })
  // admin spec
  .get("/eth/acct_gen_admin", async (context) => {
    const queryParams = context.request.url.searchParams;
    const password = queryParams.get("password");
    const kv = await Deno.openKv();
    const passwd = await kv.get(["env","password"]);

    if (password !== passwd.value) {
      context.response.body = { error: "Invalid password" };
      return;
    }
    const resp = await ethGenAcctWithoutSavePrivKey(true);
    context.response.body = resp;
  })
  .get("/eth/get_admin", async (context) => {
    const kv = await Deno.openKv();
    const admin = await kv.get(["acct", "eth", "admin"]);

    const resp = await ethGetBalances(admin.value);
    context.response.body = {admin: admin.value, balances: resp};
  })
  // user spec
  .get("/eth/acct_gen", async (context) => {
    const resp = await ethGenAcctWithoutSavePrivKey(false);
    context.response.body = resp;
  })
  // get full balances for the main token & erc20 tokens in the list.
  .get("/eth/balance/:addr", async (context) => {
    const addr = context.params.addr;
    const resp = await ethGetBalances(addr);
    context.response.body = resp;
  })
  // get full balances for the main token & erc20 tokens in the list.
  .get("/eth/balances/:addr", async (context) => {
    const addr = context.params.addr;
    const resp = await ethGetBalances(addr);
    context.response.body = resp;
  })
  // .get("/admin_get_with_balance", async (context) => {
  //   const admin = await getAdmin();
  //   if (!admin) {
  //     context.response.status = 404;
  //     context.response.body = { error: "Admin not found" };
  //     return;
  //   }
    
  //   const network = await get_network();
  //   const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
    
  //   const addrsAndBalances = await Promise.all([admin.address].map(async (acct) => {
  //     const balance = await provider.getBalance(acct);
  //     return {
  //       addr: acct,
  //       balance: ethers.utils.formatEther(balance),
  //     };
  //   }));
    
  //   context.response.body = addrsAndBalances;
  // })
  // sweep spec.
  .get("/eth/transfer/usdt", async (context) => {
    const queryParams = context.request.url.searchParams;
    const priv = queryParams.get("priv");
    const to = queryParams.get("to");
    const amount = queryParams.get("amount");
    const network = await get_network();
    const resp = await erc20Transfer(priv, network.rpcUrl, network.usdtContractAddress, to, amount);
    context.response.body = resp;
  })
  .get("/eth/sweep/usdt", async (context) => {
    const queryParams = context.request.url.searchParams;
    const priv = queryParams.get("priv");
    const privAdmin = queryParams.get("privAdmin");

    if (!priv || !privAdmin) {
      context.response.body = { error: "Both priv and privAdmin parameters are required" };
      context.response.status = 400;
      return;
    }

    try {
      const network = await get_network();
      const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
      
      // Get wallet addresses
      const wallet = new ethers.Wallet(priv, provider);
      const adminWallet = new ethers.Wallet(privAdmin, provider);
      const addr = wallet.address;
      const adminAddr = adminWallet.address;

      // Get USDT balance and ETH balance
      const usdtBalance = await erc20Balance(addr, network.usdtContractAddress, network.rpcUrl);
      const ethBalance = await provider.getBalance(addr);
      const ethBalanceInEth = ethers.utils.formatEther(ethBalance);

      // If USDT balance is less than 1, return early
      if (parseFloat(usdtBalance) < 1) {
        context.response.body = { 
          status: "no_action", 
          message: "USDT balance is less than 1",
          balance: usdtBalance
        };
        return;
      }

      const minBalance = network.minBalance;
      const gasForSweep = network.gasForSweep;
      let txHash;

      // Check if ETH balance is less than minBalance
      if (parseFloat(ethBalanceInEth) < parseFloat(minBalance)) {
        // Transfer ETH from admin for gas
        const gasAmount = ethers.utils.parseEther(gasForSweep);
        const gasTx = await adminWallet.sendTransaction({
          to: addr,
          value: gasAmount
        });
        await gasTx.wait();
        txHash = gasTx.hash;
        console.log("gas tx hash: ", txHash);
        // await 1 seconds to make sure the tx success.
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Transfer all USDT to admin
      console.log("transfer usdt to admin");
      console.log("usdt balance: ", parseFloat(usdtBalance));
      console.log("admin addr: ", adminAddr);
      console.log("contract addr: ", network.usdtContractAddress);

      const transferReceipt = await erc20Transfer(
        priv,
        network.rpcUrl,
        network.usdtContractAddress,
        adminAddr,
        parseFloat(usdtBalance)
      );

      context.response.body = {
        status: "success",
        message: "USDT swept successfully",
        initial_balance: {
          usdt: usdtBalance,
          eth: ethBalanceInEth
        },
        gas_transfer: txHash ? {
          hash: txHash,
          amount: gasForSweep
        } : null,
        usdt_transfer: transferReceipt
      };

    } catch (error) {
      console.error("Error in USDT sweep:", error);
      context.response.body = { 
        error: "Failed to sweep USDT",
        details: error instanceof Error ? error.message : "Unknown error"
      };
      context.response.status = 500;
    }
  })

export default ethRouter; 