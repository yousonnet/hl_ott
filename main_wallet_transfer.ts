import { Tx, TxRaw } from "osmojs/dist/codegen/cosmos/tx/v1beta1/tx";
import { Secp256k1HdWallet } from "@cosmjs/amino";
import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { OfflineSigner, GeneratedType, Registry } from "@cosmjs/proto-signing";
import { AminoTypes, SigningStargateClient } from "@cosmjs/stargate";
// import { getSigningPublicawesomeClient } from "stargazejs";

// const stargateClient = await getSigningPublicawesomeClient({
//   rpcEndpoint,
//   signer // OfflineSigner
// });
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

// const signer: OfflineSigner = /* create your signer (see above)  */
// const rpcEndpoint = 'https://rpc.cosmos.directory/osmosis'; // or another URL

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
