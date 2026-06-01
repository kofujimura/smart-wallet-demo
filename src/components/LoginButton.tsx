"use client";

import { useWallet } from "@/hooks/useWallet";

export function LoginButton() {
  const { isConnected, isLoading, login, logout, address } = useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate max-w-[200px]">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      disabled={isLoading}
      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
    >
      {isLoading ? "接続中..." : "Google でログイン"}
    </button>
  );
}
