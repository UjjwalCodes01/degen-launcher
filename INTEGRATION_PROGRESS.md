# Frontend-Contract Integration Progress

## ✅ Completed Steps

### 1. Created Contracts Directory
- Created `frontend/src/contracts/` directory to store ABI files and addresses

### 2. Added Factory ABI
- Extracted Factory contract ABI from `foundry/out/Factory.sol/Factory.json`
- Created `frontend/src/contracts/Factory.json` with the complete ABI
- Includes all functions: `create()`, `buy()`, `deposit()`, `totalTokens()`, `tokens()`, `getTokenSale()`, etc.

### 3. Created Addresses Configuration
- Created `frontend/src/contracts/addresses.ts`
- Added Factory contract address: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- This is the deployed address on local Anvil testnet

### 4. Updated Homepage Component
- Added `"use client"` directive (required for wagmi hooks)
- Imported necessary dependencies:
  - `useReadContract` from wagmi
  - `FACTORY_ADDRESS` from contracts/addresses
  - `FactoryABI` from contracts/Factory.json
  
- Added contract reading hooks:
  ```typescript
  const { data: totalTokens } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FactoryABI,
    functionName: "totalTokens",
  });
  ```

- Updated UI to display live data:
  - "Total Tokens" now shows actual count from contract: `{totalTokens ? totalTokens.toString() : "0"}`

## 📋 Next Steps

### 5. Add More Contract Reading Hooks
You can add hooks to read individual token data:

```typescript
// Get token sale details
const { data: tokenSale } = useReadContract({
  address: FACTORY_ADDRESS,
  abi: FactoryABI,
  functionName: "getTokenSale",
  args: [0n], // Token index
});
```

### 6. Add Write Functions (Create & Buy)
For creating tokens and buying, you'll need `useWriteContract`:

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// In your component:
const { writeContract, data: hash } = useWriteContract();

// Create token function
const createToken = async (name: string, symbol: string) => {
  writeContract({
    address: FACTORY_ADDRESS,
    abi: FactoryABI,
    functionName: 'create',
    args: [name, symbol],
    value: parseEther('0.01'), // 0.01 ETH creation fee
  });
};

// Buy token function
const buyToken = async (tokenAddress: string, amount: bigint) => {
  // First calculate cost
  const cost = await readContract({
    address: FACTORY_ADDRESS,
    abi: FactoryABI,
    functionName: 'getCost',
    args: [amount],
  });
  
  writeContract({
    address: FACTORY_ADDRESS,
    abi: FactoryABI,
    functionName: 'buy',
    args: [tokenAddress, amount],
    value: cost, // Send calculated ETH cost
  });
};
```

### 7. Create Token Creation Modal
- Connect "Add Token" button to open a modal
- Form fields for token name and symbol
- Call `createToken()` function on submit

### 8. Display Token List Dynamically
- Loop through `totalTokens` count
- For each index, call `getTokenSale(index)` to get token details
- Render token cards with actual data instead of static content

### 9. Add Token Buying Functionality
- Add buy button to each token card
- Input field for amount to buy
- Call `buyToken()` with selected amount

### 10. Handle Transaction States
```typescript
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  hash,
});

// Show loading states, success messages, etc.
```

## 🔧 Configuration Notes

### Wagmi Configuration
Make sure your wagmi config in `lib/walletConfig.ts` includes:
- Correct chain configuration for Anvil (chainId: 31337)
- RPC URL: http://127.0.0.1:8545

### Contract Deployment
- Factory is deployed at: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- If you redeploy contracts, update the address in `contracts/addresses.ts`

### Environment Variables
For production, you might want to use environment variables:
```typescript
export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || 
  '0x5FbDB2315678afecb367f032d93F642f64180aa3') as const;
```

## 🚀 Testing

1. **Start Anvil**:
   ```bash
   cd foundry
   anvil
   ```

2. **Start Frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Connect Wallet**:
   - Use RainbowKit to connect
   - Switch to local network (Anvil)
   - Import Anvil test account with private key

4. **Test Reading**:
   - Open browser console
   - Check logs: "Total Tokens:", "First Token Address:"
   - Verify UI shows correct total tokens count

5. **Test Writing** (once implemented):
   - Try creating a token
   - Try buying tokens
   - Check transactions in Anvil logs

## 📖 Useful Resources

- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Docs](https://www.rainbowkit.com)
- [Viem Documentation](https://viem.sh)
- [Foundry Book](https://book.getfoundry.sh)

## 🎯 Current Status

✅ Smart contracts tested and deployed
✅ Frontend can read contract data
✅ Total tokens displayed from contract
⏳ Token list needs to be dynamic
⏳ Create/buy functions need to be implemented
⏳ Transaction handling needs to be added
