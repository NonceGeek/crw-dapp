import { Router } from "https://deno.land/x/oak/mod.ts";
import { ethers } from "https://cdn.skypack.dev/ethers@5.6.8";
import { getContract, getAcctWithPriv, getAdmin } from "../services/ethereum.ts";

const crwOnChainRouter = new Router();

crwOnChainRouter
  .get("/read_all/:address", async (context) => {
    try {
      const address = context.params.address;
      if (!address) {
        context.response.status = 400;
        context.response.body = { error: "Address parameter is required" };
        return;
      }

      const contract = await getContract();
      const data = await contract.read_all(address);

      // Transform the data to a more readable format
      const formattedData = data.map((item) => ({
        content: item.content,
        timestamp: parseInt(item.timestamp.toString()),
        date: new Date(parseInt(item.timestamp.toString()) * 1000).toISOString(),
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

      const contract = await getContract();
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
        context.response.body = { error: "Address and index parameters are required" };
        return;
      }

      const contract = await getContract();
      const item = await contract.read_item(address, parseInt(index));

      // Transform the data to a more readable format
      const formattedItem = {
        content: item.content,
        timestamp: parseInt(item.timestamp.toString()),
        date: new Date(parseInt(item.timestamp.toString()) * 1000).toISOString(),
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
      let payload = await context.request.body.text();
      payload = JSON.parse(payload);
      const addr = payload.addr;

      const { contract, provider } = await getContract();

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
        const transferAmount = ethers.utils.parseEther((parseFloat(minBalanceStr) * 2).toString()); // Double the minimum amount

        // Send transaction to transfer tBNB
        const tx = await adminWallet.sendTransaction({
          to: addr,
          value: transferAmount,
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
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error("Error adding item:", error);
      context.response.status = 500;
      context.response.body = { error: "Failed to add item" };
    }
  });

export default crwOnChainRouter; 