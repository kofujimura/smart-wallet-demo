import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { entryPoint07Address } from "viem/account-abstraction";

const PIMLICO_URL = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`;
const RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

export const pimlicoClient = createPimlicoClient({
  transport: http(PIMLICO_URL),
  entryPoint: {
    address: entryPoint07Address,
    version: "0.7",
  },
});

// Web3Auth の EIP-1193 provider から SmartAccountClient を生成する
export async function createSmartAccount(web3authProvider: any) {
  const account = await toSimpleSmartAccount({
    client: publicClient,
    owner: web3authProvider,
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });

  return createSmartAccountClient({
    account,
    chain: sepolia,
    bundlerTransport: http(PIMLICO_URL),
    paymaster: pimlicoClient,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast;
      },
    },
  });
}
