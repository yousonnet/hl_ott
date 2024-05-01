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
import { MsgBroadcasterWithPk, MsgSend } from "@injectivelabs/sdk-ts";
import { Wallet, parseUnits, formatEther } from "ethers";
import { StargateClient } from "@cosmjs/stargate";

// import { MsgSend } from "osmojs/dist/codegen/cosmos/bank/v1beta1/tx";
const endpoint = "https://injective-1-public-rpc.mesa.ec1-prod.newmetric.xyz";

const prefix = "inj";

// const per_transfer_amount = 5;

const limit = 20;
const threshold = 15;

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
  const stargate_client = await StargateClient.connect(endpoint);
  const main_wallet_client_balance = await stargate_client.getBalance(
    main_wallet_client.inj_client.privateKey.toAddress().address,
    "inj"
  );
  if (
    clients.length * limit >
    Number(formatEther(main_wallet_client_balance.amount))
  ) {
    throw new Error("Insufficient balance in main wallet");
  }
  // const main_address = (await wallet.getAccounts())[0].address;
  let counter = 0;
  for (let receiver_address of clients) {
    counter += 1;
    console.log("index :" + counter);
    const balance_string = parseUnits(
      random_float_fixed2(threshold, limit),
      18
    ).toString();
    const msg = MsgSend.fromJSON({
      amount: [
        {
          amount: balance_string,
          denom: "inj",
        },
      ],
      srcInjectiveAddress:
        main_wallet_client.inj_client.privateKey.toAddress().address,
      dstInjectiveAddress:
        receiver_address.inj_client.privateKey.toAddress().address,
    });
    const tx = await main_wallet_client.inj_client.broadcast({ msgs: [msg] });
    console.log("tx:" + tx.txHash);
    console.log("balance:" + balance_string);
  }
  console.log("distribute inj to multi wallet completed");
}

const random_float_fixed2 = (min: number, max: number): string => {
  return (Math.random() * (max - min) + min).toFixed(2);
};

main();
