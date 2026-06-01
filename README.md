# Inapp Wallet

ERC-4337 アカウントアブストラクションを使ったブラウザ内ウォレットのデモアプリです。  
Google アカウントでログインするだけで Smart Account が作成され、Ethereum Sepolia テストネット上でガスレス送金や NFT 閲覧が行えます。

---

## 機能一覧

| カテゴリ | 機能 |
|---|---|
| **認証** | Google OAuth ログイン（Web3Auth） |
| **ウォレット** | ERC-4337 Smart Account の自動生成 |
| **ETH 送金** | 通常送金・Gasless 送金（Pimlico Paymaster） |
| **ERC-20** | 残高表示・複数トークン管理・送金 |
| **ERC-721** | NFT 一覧表示（画像・メタデータ取得） |
| **ERC-1155** | NFT 一覧表示（枚数表示含む） |
| **UI** | ダークモード対応・アコーディオンパネル |
| **UX** | アドレスコピー・Sepolia Etherscan リンク |
| **永続化** | 使用済みコントラクトアドレスを localStorage に記録し、次回ログイン時に自動取得 |

---

## 技術スタック

| 用途 | ライブラリ／サービス |
|---|---|
| フレームワーク | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | React 19 / Tailwind CSS v4 |
| Ethereum クライアント | [viem](https://viem.sh/) v2 |
| Account Abstraction | [permissionless](https://docs.pimlico.io/permissionless) (ERC-4337) |
| ソーシャルログイン | [Web3Auth Modal](https://web3auth.io/) |
| RPC / NFT API | [Alchemy](https://www.alchemy.com/) (Sepolia) |
| Bundler / Paymaster | [Pimlico](https://www.pimlico.io/) |

---

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd inapp-wallet
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、各 API キーを設定します。

```bash
cp .env.example .env.local
```

```env
# Web3Auth — https://dashboard.web3auth.io でプロジェクトを作成
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id

# Pimlico — https://dashboard.pimlico.io でプロジェクトを作成
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key

# Alchemy — https://dashboard.alchemy.com でプロジェクトを作成
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key

# デフォルトで追跡するコントラクトアドレス（任意）
NEXT_PUBLIC_DEFAULT_ERC20_ADDRESS=0x...
NEXT_PUBLIC_DEFAULT_ERC721_ADDRESS=0x...
NEXT_PUBLIC_DEFAULT_ERC1155_ADDRESS=0x...
```

> **注意:** すべての変数は `NEXT_PUBLIC_` プレフィックスが付いており、ブラウザ側に公開されます。テストネット専用のキーを使用してください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

---

## ロゴの設定

`public/logo.png`（または `logo.svg`）にロゴ画像を配置するとヘッダーに表示されます。  
ファイルが存在しない場合はテキスト「FujimuLab」にフォールバックします。

SVG を使う場合は `src/app/page.tsx` の `<img src="/logo.png" ...>` を `<img src="/logo.svg" ...>` に変更してください。

---

## デフォルトコントラクトの設定

`.env.local` に `NEXT_PUBLIC_DEFAULT_ERC721_ADDRESS` などを設定すると、初回ログイン時にそのコントラクトが自動的に追跡対象に追加されます。

```env
NEXT_PUBLIC_DEFAULT_ERC721_ADDRESS=0x29E7216bCB19dF318B60B06dCC824349c3Ea93cE
```

複数のコントラクトを事前登録したい場合は、アプリ内の各パネルから手動で「追加」してください。追加済みのアドレスは localStorage に記録され、次回ログイン時に自動取得されます。

---

## コントラクト履歴の仕組み

各パネル（ERC-20 / ERC-721 / ERC-1155）で使用したコントラクトアドレスは `localStorage` に保存されます。

| 状況 | 動作 |
|---|---|
| ログイン時 | 保存済みアドレスを全件自動フェッチ |
| 残高・保有 NFT が 0 件 | 履歴から自動削除（次回フェッチしない） |
| フェッチエラー | 履歴に残す（一時的な障害の可能性があるため） |
| × ボタン | 手動で履歴から削除 |

---

## アーキテクチャ概要

```
ブラウザ
 ├─ Web3Auth (Google OAuth)
 │    └─ EOA 秘密鍵（デバイスに保存されない）
 │
 ├─ permissionless
 │    ├─ SimpleSmartAccount (ERC-4337)
 │    └─ SmartAccountClient
 │         ├─ Bundler:   Pimlico
 │         └─ Paymaster: Pimlico（ガス代代行）
 │
 ├─ viem / publicClient
 │    └─ Alchemy RPC (Sepolia)
 │
 └─ Alchemy NFT API
      └─ getNFTsForOwner（ERC-721 / ERC-1155 所有トークン取得）
```

### NFT 取得の優先順位（ERC-721）

1. **`tokenOfOwnerByIndex`**（ERC721Enumerable） — `eth_call` のみで完結、高速
2. **Alchemy NFT API** — Enumerable 非対応コントラクトのフォールバック

> Alchemy 無料プランは `eth_getLogs` のブロック範囲が 10 ブロックに制限されているため、イベントログによるスキャンは使用していません。

---

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx          # WalletProvider の配置・フォント設定
│   └── page.tsx            # メインページ・ルーティング
├── components/
│   ├── LoginButton.tsx     # ログイン／ログアウトボタン
│   ├── BalanceCard.tsx     # ETH 残高・アドレス表示
│   ├── SendEth.tsx         # ETH 送金フォーム
│   ├── Erc20Panel.tsx      # ERC-20 トークン管理パネル
│   └── NftPanel.tsx        # ERC-721 / ERC-1155 NFT パネル
├── hooks/
│   └── useWallet.tsx       # ウォレット状態管理（Context）
└── lib/
    ├── web3auth.ts          # Web3Auth 初期化
    ├── smartAccount.ts      # Smart Account / publicClient 生成
    ├── erc20.ts             # ERC-20 ABI・残高取得
    ├── nft.ts               # ERC-721 / ERC-1155 取得（Alchemy NFT API）
    └── contractHistory.ts   # コントラクトアドレス履歴（localStorage）
```

---

## 開発メモ

### テスト用 Sepolia ETH の取得

- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

### Web3Auth の注意点

`WEB3AUTH_NETWORK.SAPPHIRE_DEVNET` を使用しています。本番環境では `SAPPHIRE_MAINNET` に変更し、Web3Auth ダッシュボードで本番用クライアント ID を取得してください。

### Gasless 送金について

Pimlico の Paymaster を利用しており、ユーザーはガス代を支払わずに送金できます。Paymaster のスポンサーポリシーは Pimlico ダッシュボードで設定します。
