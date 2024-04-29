import {
  // main_wallet_cosmos_sdk,
  // receivers_wallets_cosmos_sdk,
  main_wallet_evm,
  receivers_wallets_evm,
} from "./env_setup";
import { Network } from "@injectivelabs/networks";
import { Secp256k1HdWallet } from "@cosmjs/amino";
import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { MsgBroadcasterWithPk, MsgSend } from "@injectivelabs/sdk-ts";
import { Wallet, formatEther, parseUnits, formatUnits } from "ethers";
// import { MsgSend } from "osmojs/dist/codegen/cosmos/bank/v1beta1/tx";
const endpoint = "https://injective-1-public-rpc.mesa.ec1-prod.newmetric.xyz";

const prefix = "inj";

// const per_transfer_amount = 5;

async function main() {
  const main_wallet_client = {
    inj_client: new MsgBroadcasterWithPk({
      privateKey: main_wallet_evm,
      network: Network.Mainnet,
    }),
  };
  const clients = receivers_wallets_evm.map((private_key) => {
    return {
      inj_client: new MsgBroadcasterWithPk({
        privateKey: private_key,
        network: Network.Mainnet,
      }),
      evm_client: new Wallet(private_key),
    };
  });
  const balance_client = await StargateClient.connect(endpoint);
  // const main_address = (await wallet.getAccounts())[0].address;
  let counter = 0;
  for (let receiver_address of clients) {
    counter += 1;
    console.log("index :" + counter);
    const balance = await balance_client.getBalance(
      receiver_address.inj_client.privateKey.toAddress().address,
      "inj"
    );
    // console.log(balance);
    // console.log(BigInt(balance.amount));
    // console.log(formatUnits(balance.amount, 18));
    const rounded_bridge_number =
      Number(Number(formatUnits(balance.amount, 18)).toFixed(2)) - 0.01;
    console.log("send back to main wallet address:" + rounded_bridge_number);
    const msg = MsgSend.fromJSON({
      amount: [
        {
          amount: parseUnits(rounded_bridge_number.toString(), 18).toString(),
          denom: "inj",
        },
      ],
      srcInjectiveAddress:
        receiver_address.inj_client.privateKey.toAddress().address,
      dstInjectiveAddress:
        main_wallet_client.inj_client.privateKey.toAddress().address,
    });
    // console.log(msg.params);
    const tx = await receiver_address.inj_client.broadcast({ msgs: [msg] });
    console.log("hash:" + tx.txHash);
  }
  console.log("receive inj from multi wallet completed");
}

main();
