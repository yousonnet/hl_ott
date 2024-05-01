import { Wallet, JsonRpcProvider, parseUnits, formatUnits } from "ethers";
import { receivers_wallets_evm, main_wallet_evm } from "./env_setup";

const provider = new JsonRpcProvider("https://mainnet.rpc.inevm.com/http");

async function main() {
  const main_wallet = new Wallet(main_wallet_evm, provider);
  const receivers_wallet: Wallet[] = receivers_wallets_evm.map(
    (private_key) => new Wallet(private_key, provider)
  );
  for (let i of receivers_wallet) {
    const balance = await provider.getBalance(i.address);
    const tx = await i.sendTransaction({
      to: main_wallet.address,
      value: balance - parseUnits("0.01", 18),
    });
    console.log("hash :" + tx.hash);
    console.log("amount:" + formatUnits(balance - parseUnits("0.01", 18), 18));
  }
  console.log("completed");
}
