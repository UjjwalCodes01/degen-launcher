# 🌐 IPFS Integration Guide

This project uses IPFS (InterPlanetary File System) for decentralized image storage, which is much more efficient than storing base64 images on-chain.

## 🚀 Quick Setup

### Option 1: Pinata (Recommended - Free Tier Available)

1. **Sign up for Pinata**
   - Go to [https://app.pinata.cloud/](https://app.pinata.cloud/)
   - Create a free account

2. **Get API Keys**
   - Navigate to **API Keys** in the dashboard
   - Click **+ New Key**
   - Enable **pinFileToIPFS** permission
   - Give it a name (e.g., "Degen Launcher")
   - Click **Create Key**
   - Copy the **JWT** (you won't see it again!)

3. **Add to Environment**
   - Open `frontend/.env.local`
   - Replace `your_pinata_jwt_here` with your actual JWT:
     ```bash
     NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

4. **Restart Dev Server**
   ```bash
   cd frontend
   npm run dev
   ```

### Option 2: Web3.Storage (Alternative)

1. **Sign up for Web3.Storage**
   - Go to [https://web3.storage/](https://web3.storage/)
   - Create a free account

2. **Get API Token**
   - Navigate to **Account**
   - Click **Create API Token**
   - Copy the token

3. **Add to Environment**
   - Open `frontend/.env.local`
   - Add:
     ```bash
     NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token_here
     ```

## 📦 How It Works

### Upload Flow
1. User selects an image (validated for type and size)
2. Image is uploaded to IPFS via Pinata API
3. IPFS hash/URL is returned (e.g., `https://gateway.pinata.cloud/ipfs/Qm...`)
4. URL is stored on-chain in the contract (much cheaper than base64!)
5. Image is permanently available via IPFS

### Fallback Mechanism
The system has automatic fallback:
```
Try Pinata → Try Web3.Storage → Fall back to base64 (not recommended)
```

If no IPFS service is configured, images will use base64 (works but expensive gas costs).

## 🔒 Security Features

### Input Validation
- ✅ File type validation (PNG, JPEG, GIF, WebP only)
- ✅ File size limit (5MB max)
- ✅ Error handling for corrupted files

### Error Messages
- Clear user feedback for upload failures
- Specific error messages for different failure types
- Automatic retry with fallback services

## 💰 Cost Comparison

| Method | Gas Cost | Storage | Decentralized |
|--------|----------|---------|---------------|
| Base64 on-chain | **~$50-200** | On-chain | ✅ Yes |
| IPFS URL | **~$1-5** | Off-chain | ✅ Yes |
| Centralized CDN | **~$1-5** | Off-chain | ❌ No |

**IPFS is 10-40x cheaper than base64!**

## 🧪 Testing

### Without IPFS (Development)
```bash
# Images will use base64 (works but not recommended)
npm run dev
```

### With IPFS
```bash
# Set up .env.local with Pinata JWT
NEXT_PUBLIC_PINATA_JWT=your_jwt_here

# Run dev server
npm run dev

# Create a token with an image
# Check console for: "🌐 Uploading to IPFS via Pinata..."
# Should see: "✅ IPFS upload successful: https://gateway.pinata.cloud/ipfs/..."
```

## 🔍 Troubleshooting

### "Pinata JWT not configured"
- Make sure you added `NEXT_PUBLIC_PINATA_JWT` to `.env.local`
- Restart the dev server after adding environment variables

### "Pinata upload failed: 401 Unauthorized"
- Your JWT is invalid or expired
- Generate a new API key in Pinata dashboard

### "All IPFS services failed, falling back to base64"
- Both Pinata and Web3.Storage failed
- Check your internet connection
- Verify API keys are correct
- Image will still upload but use base64 (high gas)

### Images not displaying
- Check if the IPFS gateway is accessible
- Try accessing the URL directly in browser
- IPFS can be slow on first load (caching issue)

## 📚 Additional Resources

- [Pinata Documentation](https://docs.pinata.cloud/)
- [Web3.Storage Documentation](https://web3.storage/docs/)
- [IPFS Documentation](https://docs.ipfs.tech/)

## 🎯 Production Recommendations

1. **Always use IPFS** - Don't use base64 in production
2. **Pin important files** - Ensure images are pinned on multiple nodes
3. **Use multiple gateways** - Have fallback gateways for reliability
4. **Monitor usage** - Check Pinata dashboard for usage limits
5. **Consider paid plan** - For high-volume applications

## 🔄 Migration from Base64

If you have existing tokens with base64 images:
1. Images will still display (backward compatible)
2. New tokens will use IPFS
3. Consider a migration script to move old images to IPFS
