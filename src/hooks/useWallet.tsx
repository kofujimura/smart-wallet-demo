"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getWeb3Auth } from "@/lib/web3auth";
import { createSmartAccount, publicClient } from "@/lib/smartAccount";
import { formatEther, parseEther, type Address, type Hex, encodeFunctionData } from "viem";
import { ERC20_ABI } from "@/lib/erc20";

type SmartClient = Awaited<ReturnType<typeof createSmartAccount>>;

type WalletState = {
  isInitialized: boolean;
  isConnected: boolean;
  address: Address | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  smartAccountClient: SmartClient | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  sendEth: (to: Address, amountEth: string) => Promise<Hex>;
  sendEthGasless: (to: Address, amountEth: string) => Promise<Hex>;
  sendErc20: (token: Address, to: Address, amount: bigint) => Promise<Hex>;
};

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smartAccountClient, setSmartAccountClient] =
    useState<SmartClient | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = getWeb3Auth();
        await web3auth.init();
        setIsInitialized(true);

        if (web3auth.connected && web3auth.provider) {
          try {
            const client = await createSmartAccount(web3auth.provider);
            setSmartAccountClient(client);
            setAddress(client.account.address as Address);
            setIsConnected(true);
          } catch {
            // セッションが無効な場合はログアウトして初期状態に戻す
            await web3auth.logout().catch(() => {});
          }
        }
      } catch {
        setError("初期化に失敗しました");
      }
    };
    init();
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    const raw = await publicClient.getBalance({ address });
    setBalance(formatEther(raw));
  }, [address]);

  useEffect(() => {
    if (address) refreshBalance();
  }, [address, refreshBalance]);

  const login = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const web3auth = getWeb3Auth();
      const provider = await web3auth.connect();
      if (!provider) throw new Error("ログインに失敗しました");
      const client = await createSmartAccount(provider);
      setSmartAccountClient(client);
      setAddress(client.account.address as Address);
      setIsConnected(true);
    } catch (e: any) {
      setError(e.message ?? "ログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const web3auth = getWeb3Auth();
    await web3auth.logout();
    setIsConnected(false);
    setAddress(null);
    setBalance(null);
    setSmartAccountClient(null);
  };

  const sendEth = async (to: Address, amountEth: string): Promise<Hex> => {
    if (!smartAccountClient) throw new Error("ウォレットが接続されていません");
    const hash = await smartAccountClient.sendTransaction({
      account: smartAccountClient.account,
      to,
      value: parseEther(amountEth),
      chain: null,
    });
    await refreshBalance();
    return hash;
  };

  // Paymaster を使った Gasless 送金（SmartAccountClient 生成時に paymaster を設定済み）
  const sendEthGasless = sendEth;

  const sendErc20 = async (
    token: Address,
    to: Address,
    amount: bigint
  ): Promise<Hex> => {
    if (!smartAccountClient) throw new Error("ウォレットが接続されていません");
    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [to, amount],
    });
    const hash = await smartAccountClient.sendTransaction({
      account: smartAccountClient.account,
      to: token,
      data,
      chain: null,
    });
    return hash;
  };

  return (
    <WalletContext.Provider
      value={{
        isInitialized,
        isConnected,
        address,
        balance,
        isLoading,
        error,
        smartAccountClient,
        login,
        logout,
        refreshBalance,
        sendEth,
        sendEthGasless,
        sendErc20,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
