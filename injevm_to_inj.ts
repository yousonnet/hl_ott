import {
  JsonRpcProvider,
  Wallet,
  Interface,
  Contract,
  parseUnits,
} from "ethers";
import { receivers_wallets_evm } from "./env_setup";
import { formatEther } from "ethers";
import { zeroPadValue } from "ethers";
import { hlane_raw_abi } from "./hlane_raw_abi_injl2";

const evm_provider = new JsonRpcProvider("https://mainnet.rpc.inevm.com/http");
//跨会很快，几秒
// 损耗 = 0.007 inj
async function main() {
  const hlane_contract = new Contract(
    "0x26f32245fCF5Ad53159E875d5Cae62aEcf19c2d4",
    new Interface(hlane_raw_abi),
    evm_provider
  );
  const receivers_inevm_wallets = receivers_wallets_evm.map(
    (private_key) => new Wallet(private_key, evm_provider)
  );
  let counter = 0;
  for (let wallet of receivers_inevm_wallets) {
    counter += 1;
    console.log("index :" + counter);
    const balance = await evm_provider.getBalance(wallet.address);
    const rounded_bridge_number =
      Number(Number(formatEther(balance)).toFixed(2)) - 0.01;
    // const rounded_bridge_number = 1;
    const destination_chain_fee: bigint = (await hlane_contract.quoteGasPayment(
      6909546n
    )) as bigint;

    if (rounded_bridge_number > 0) {
      console.log("cross back to l1:" + balance);
      const tx_data = hlane_contract.interface.encodeFunctionData(
        "transferRemote",
        [
          6909546,
          zeroPadValue(wallet.address, 32),
          parseUnits(rounded_bridge_number.toString(), 18) -
            destination_chain_fee,
        ]
      );
      const tx_result = await wallet.sendTransaction({
        to: "0x26f32245fCF5Ad53159E875d5Cae62aEcf19c2d4",
        data: tx_data,
        value: parseUnits(rounded_bridge_number.toString(), 18),
      });

      console.log("hash:" + tx_result.hash);
    } else {
      console.log("balance not sufficient to transfer" + wallet.address);
    }
  }
  console.log("bridge to inj cosmos completed");
}
main();
