import {
  MsgExecuteContract,
  MsgBroadcasterWithPk,
  MsgSend,
} from "@injectivelabs/sdk-ts";
import { Network } from "@injectivelabs/networks";
import { receivers_wallets_evm } from "./env_setup";
// import { MsgTransfer } from "osmojs/dist/codegen/ibc/applications/transfer/v1/tx";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { parseUnits, formatUnits } from "ethers";
import { zeroPadBytes, zeroPadValue } from "ethers";
import { Wallet } from "ethers";
//跨链时间消耗大概6min
const query_endpoint =
  "https://injective-1-public-rpc.mesa.ec1-prod.newmetric.xyz";

async function main() {
  const query_client = await CosmWasmClient.connect(query_endpoint);
  const clients = receivers_wallets_evm.map((private_key) => {
    return {
      inj_client: new MsgBroadcasterWithPk({
        privateKey: private_key,
        network: Network.Mainnet,
      }),
      evm_client: new Wallet(private_key),
    };
  });
  let counter = 0;
  for (let client of clients) {
    counter += 1;
    console.log("index :" + counter);
    const balance = (
      await query_client.getBalance(
        client.inj_client.privateKey.toAddress().address,
        "inj"
      )
    ).amount;
    const rounded_bridge_number = Number(
      (Number(Number(formatUnits(balance, 18)).toFixed(2)) - 0.01).toFixed(2)
    );
    const evm_address_parameter = zeroPadValue(
      client.evm_client.address,
      32
    ).slice(2);

    if (rounded_bridge_number > 0.03) {
      console.log(
        `bridge to evm:${client.evm_client.address} \n amount:${rounded_bridge_number} inj`
      );

      const msg = MsgExecuteContract.fromJSON({
        contractAddress: "inj1mv9tjvkaw7x8w8y9vds8pkfq46g2vcfkjehc6k",
        funds: [
          {
            amount: parseUnits(rounded_bridge_number.toString(), 18).toString(),
            denom: "inj",
          },
        ],
        sender: client.inj_client.privateKey.toAddress().address,
        msg: {
          transfer_remote: {
            amount: parseUnits(
              (rounded_bridge_number - 0.03).toFixed(2),
              //0.03 计算有误差会余个1出来
              18
            ).toString(),
            dest_domain: 2525,

            recipient: evm_address_parameter,
          },
        },
      });

      const tx_hash = await client.inj_client.broadcast({ msgs: msg });
      console.log("hash:" + tx_hash.txHash);
    } else {
      console.log(
        "balance not sufficient to transfer" +
          client.inj_client.privateKey.toAddress().address
      );
    }
  }
  console.log("bridge to inevm completed");
}

main();
