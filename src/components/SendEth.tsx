"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { type Address } from "viem";

const inputCls =
  "w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

export function SendEth() {
  const { sendEth, sendEthGasless } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [gasless, setGasless] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);
    setTxHash(null);
    setIsLoading(true);
    try {
      const fn = gasless ? sendEthGasless : sendEth;
      const hash = await fn(to as Address, amount);
      setTxHash(hash);
      setTo("");
      setAmount("");
    } catch (e: any) {
      setError(e.message ?? "送金に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 dark:text-white">SepoliaETH 送金</h2>

      <div>
        <label className="text-sm text-gray-500 dark:text-gray-400">送り先アドレス</label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="0x..."
          className={`font-mono text-sm ${inputCls}`}
        />
      </div>

      <div>
        <label className="text-sm text-gray-500 dark:text-gray-400">金額 (SepoliaETH)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.001"
          min="0"
          step="0.001"
          className={`text-sm ${inputCls}`}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="gasless"
          checked={gasless}
          onChange={(e) => setGasless(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="gasless" className="text-sm text-gray-700 dark:text-gray-300">
          Gasless 送金（Paymaster がガス代を負担）
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {txHash && (
        <div className="text-sm bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded-lg">
          <span className="text-green-700 dark:text-green-400 font-medium">送金成功！</span>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs"
          >
            {txHash.slice(0, 10)}... Etherscan で確認 →
          </a>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={isLoading || !to || !amount}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white rounded-lg font-medium transition-colors"
      >
        {isLoading ? "送金中..." : gasless ? "Gasless で送金" : "送金"}
      </button>
    </div>
  );
}
