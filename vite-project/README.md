# X402 API Gateway Marketplace

```
┌─────────────────────────────────────────┐
│                                          │
│         ●━━━━━┓                         │
│               ┃ 4 0 2                   │
│         ●━━━━━┛                         │
│               ┃                         │
│         ●━━━━━┛                         │
│                                          │
│           X 4 0 2                       │
│                                          │
└─────────────────────────────────────────┘
```

A decentralized API marketplace with payment gateway integration built on Solana.

## Features

- 🔐 **Wallet Authentication**: Sign in with Solana wallet (SIWS)
- 💰 **Payment Gateway**: Pay-per-use API access with automatic billing
- 📊 **API Management**: List, discover, and manage APIs
- 🚀 **Gateway Routing**: Automatic API request proxying with payment
- 📈 **Analytics**: Track usage, revenue, and performance

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Blockchain**: Solana (wallet authentication)
- **Database**: PostgreSQL + Supabase
- **Styling**: TailwindCSS + Lucide Icons

## Getting Started

### Prerequisites
- Node.js 18+
- Solana wallet (Phantom, Solflare, etc.)


```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
