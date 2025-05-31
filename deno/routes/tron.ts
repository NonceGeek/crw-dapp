import { Router } from "https://deno.land/x/oak/mod.ts";
import { TronWeb } from "https://esm.sh/tronweb@6.0.0";
import { getTrxTx, getTrxBalance, getTrxUSDTBalance, set_env_tron_api_url } from "../services/tron.ts";

const tronRouter = new Router();

tronRouter
  .get("/set_env_tron_api_url", async (context) => {
    const queryParams = context.request.url.searchParams;
    const if_prod = queryParams.get("if_prod");
    const password = queryParams.get("password");
    // Convert if_prod string to boolean
    const kv = await Deno.openKv();
    const passwd = await kv.get(["env","password"]);

    if (password !== passwd.value) {
      context.response.body = { error: "Invalid password" };
      return;
    }
    const isProd = if_prod === "true" || if_prod === "1" || if_prod === "yes";
    const resp = await set_env_tron_api_url(isProd);
    context.response.body = resp.value;
  })
  .get("/get_env_tron_api_url", async (context) => {
    const kv = await Deno.openKv();
    const resp = await kv.get(["env","tron_api_url"]);
    context.response.body = resp.value || "https://api.trongrid.io/jsonrpc";
  })
  .get("/trx/tx/:tx_id", async (context) => {
    const tx_id = context.params.tx_id;
    const resp = await getTrxTx(tx_id);
    context.response.body = resp;
  })
  .get("/trx/addr_gen", async (context) => {
    const resp = await TronWeb.createAccount();
    context.response.body = resp;
  })
  .get("/trx/balance", async (context) => {
    const kv = await Deno.openKv();
    const resp = await kv.get(["trx_addr_active"]);
    // { key: [ "trx_addr_active" ], value: null, versionstamp: null }
    if (resp.value) {
      const trx_addr = resp.value;
      const resp_2 = await getTrxBalance(trx_addr);
      await kv.set(["trx_addr", trx_addr], resp_2.balance);
      context.response.body = {addr: trx_addr, balance: resp_2.balance, before: resp.value };
    } else {
      context.response.body = { message: "trx_addr_active is not set" };
    }
  })
  .get("/trx/balance/:trx_addr", async (context) => {
    const trx_addr = context.params.trx_addr;
    const resp = await getTrxUSDTBalance(trx_addr);
    
    let env = context.params.env;
    // check if the balance is same as the value in the kv.
    const kv = await Deno.openKv();
    const kv_balance = await kv.get(["trx_addr", trx_addr]);
    if (resp.usdtBalance !== kv_balance) {
      // update balance to the latest.
      await kv.set(["trx_addr", trx_addr], resp.usdtBalance);
    }
    context.response.body = { addr: trx_addr, balance: resp.usdtBalance, before: kv_balance };
  })
  .get("/trx/trx_addr_insert", async (context) => {
    const queryParams = context.request.url.searchParams;
    const trx_addr = queryParams.get("trx_addr");
    if (!trx_addr) {
      context.response.status = 400;
      context.response.body = { error: "trx_addr is required" };
      return;
    }
    // get balance by the tr
    const kv = await Deno.openKv();
    const resp = await getTrxBalance(trx_addr);
    await kv.set(["trx_addr_active"], trx_addr);
    await kv.set(["trx_addr", trx_addr], resp.balance);
    context.response.body = { message: "trx_addr inserted successfully" };
  })
  .get("/trx/trx_addrs", async (context) => {
    const kv = await Deno.openKv();
    const trx_addrs = kv.list({ prefix: ["trx_addr"] });
    context.response.body = trx_addrs;
  })
  .get("/trx/trx_addr/:trx_addr", async (context) => {
    const trx_addr = context.params.trx_addr;
    console.log(trx_addr);
    if (!trx_addr) {
      context.response.status = 400;
      context.response.body = { error: "trx_addr is required" };
      return;
    }
    const kv = await Deno.openKv();
    const resp = await kv.get(["trx_addr", trx_addr]);

    context.response.body = resp;
  });

export default tronRouter; 