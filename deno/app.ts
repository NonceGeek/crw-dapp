import { Application } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import ethRouter from "./routes/ethereum.ts";
import tronRouter from "./routes/tron.ts";
import crwOnChainRouter from "./routes/crw_onchain.ts";
import miscRouter from "./routes/misc.ts";

console.log("Hello from Multi-Chain Wallet System!");

// Set up the application
const app = new Application();

// Enable CORS for All Routes
app.use(oakCors());

// Use all routers
app.use(ethRouter.routes());
app.use(ethRouter.allowedMethods());

app.use(tronRouter.routes());
app.use(tronRouter.allowedMethods());

app.use(crwOnChainRouter.routes());
app.use(crwOnChainRouter.allowedMethods());

app.use(miscRouter.routes());
app.use(miscRouter.allowedMethods());

// Start the server
console.info("Multi-Chain Wallet System server listening on port 8000");
await app.listen({ port: 8000 }); 