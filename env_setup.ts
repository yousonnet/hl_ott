import "dotenv/config";
import {
  cosmosAminoConverters,
  cosmosProtoRegistry,
  cosmwasmAminoConverters,
  cosmwasmProtoRegistry,
  ibcProtoRegistry,
  ibcAminoConverters,
  osmosisAminoConverters,
  osmosisProtoRegistry,
} from "osmojs";

import { Tx, TxRaw } from "osmojs/dist/codegen/cosmos/tx/v1beta1/tx";
import { Secp256k1HdWallet } from "@cosmjs/amino";
import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { OfflineSigner, GeneratedType, Registry } from "@cosmjs/proto-signing";
import { AminoTypes, SigningStargateClient } from "@cosmjs/stargate";
const protoRegistry: ReadonlyArray<[string, GeneratedType]> = [
  ...cosmosProtoRegistry,
  ...cosmwasmProtoRegistry,
  ...ibcProtoRegistry,
  ...osmosisProtoRegistry,
];

const aminoConverters = {
  ...cosmosAminoConverters,
  ...cosmwasmAminoConverters,
  ...ibcAminoConverters,
  ...osmosisAminoConverters,
};

const registry = new Registry(protoRegistry);
const aminoTypes = new AminoTypes(aminoConverters);

// const main_wallet_cosmos_sdk = process.env.main_wallet_cosmos_sdk!;
// const receivers_wallets_cosmos_sdk: string[] =
//   process.env.receivers_wallets_cosmos_sdk!.split(",");
const main_wallet_evm = process.env.main_wallet_evm!;
const receivers_wallets_evm: string[] =
  process.env.receivers_wallets_evm!.split(",");

async function createIBCClient(
  endpoint: string,
  wallet: Secp256k1HdWallet
): Promise<SigningStargateClient> {
  return await SigningStargateClient.connectWithSigner(endpoint, wallet, {
    aminoTypes,
    registry,
  });
}

// const fee = { amount: [{ denom: "inj", amount: "22500" }], gas: "155000" };

export {
  //   main_wallet_cosmos_sdk,
  main_wallet_evm,
  //   receivers_wallets_cosmos_sdk,
  receivers_wallets_evm,
  createIBCClient,
};
