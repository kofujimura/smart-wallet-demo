import { parseAbi, type Address } from "viem";
import { publicClient } from "./smartAccount";

export const ERC20_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
]);

// Sepolia テスト用 ERC-20（授業で使う場合はここを差し替え）
// 未デプロイの場合は空文字のままでよい
export const TEST_ERC20_ADDRESS: Address =
  "0x0000000000000000000000000000000000000000";

export async function getErc20Balance(
  tokenAddress: Address,
  walletAddress: Address
): Promise<{ balance: bigint; symbol: string; decimals: number }> {
  const [balance, symbol, decimals] = await Promise.all([
    publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [walletAddress],
    }),
    publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "symbol",
    }),
    publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "decimals",
    }),
  ]);
  return { balance, symbol, decimals };
}
