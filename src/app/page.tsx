"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { LoginButton } from "@/components/LoginButton";
import { BalanceCard } from "@/components/BalanceCard";
import { SendEth } from "@/components/SendEth";
import { Erc20Panel } from "@/components/Erc20Panel";
import { NftPanel } from "@/components/NftPanel";

function Logo() {
  const [error, setError] = useState(false);
  if (error) {
    return <span className="text-xl font-bold text-gray-900 dark:text-white">FujimuLab</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="FujimuLab"
      className="h-8 w-auto"
      onError={() => setError(true)}
    />
  );
}

export default function Home() {
  const { isInitialized, isConnected } = useWallet();

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Logo />
          <p className="text-xs text-gray-400">Inapp Wallet</p>
        </div>
        {isInitialized && isConnected && <LoginButton />}
      </div>

      {!isInitialized && (
        <div className="text-center py-12 text-gray-400">初期化中...</div>
      )}

      {isInitialized && !isConnected && (
        <div className="text-center py-16 space-y-4">
          <p className="text-gray-500 dark:text-gray-400">
            Google アカウントでログインして<br />
            Smart Wallet を使ってみましょう
          </p>
          <LoginButton />
        </div>
      )}

      {isConnected && (
        <div className="space-y-4">
          <BalanceCard />
          <SendEth />
          <Erc20Panel />
          <NftPanel />
        </div>
      )}
    </main>
  );
}
