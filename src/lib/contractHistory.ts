export type TokenType = "erc20" | "erc721" | "erc1155";

const STORAGE_KEY = "inapp-wallet-contracts";

type History = Record<TokenType, string[]>;

function empty(): History {
  return { erc20: [], erc721: [], erc1155: [] };
}

function load(): History {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

function save(h: History): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
}

export function getContracts(type: TokenType): string[] {
  return load()[type];
}

export function addContract(type: TokenType, address: string): void {
  const h = load();
  const lower = address.toLowerCase();
  // 先頭に追加、重複は除去
  h[type] = [address, ...h[type].filter((a) => a.toLowerCase() !== lower)];
  save(h);
}

export function removeContract(type: TokenType, address: string): void {
  const h = load();
  const lower = address.toLowerCase();
  h[type] = h[type].filter((a) => a.toLowerCase() !== lower);
  save(h);
}

export function hasContract(type: TokenType, address: string): boolean {
  return load()[type].some((a) => a.toLowerCase() === address.toLowerCase());
}
