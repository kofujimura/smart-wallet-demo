import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, UX_MODE } from "@web3auth/no-modal";

let web3authInstance: Web3Auth | null = null;

export function getWeb3Auth(): Web3Auth {
  if (web3authInstance) return web3authInstance;

  web3authInstance = new Web3Auth({
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    chains: [
      {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0xaa36a7",
        rpcTarget: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
        displayName: "Ethereum Sepolia",
        blockExplorerUrl: "https://sepolia.etherscan.io",
        ticker: "ETH",
        tickerName: "Ethereum",
        logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        isTestnet: true,
      },
    ],
    defaultChainId: "0xaa36a7",
    uiConfig: {
      uxMode: UX_MODE.POPUP,
    },
  });

  return web3authInstance;
}
