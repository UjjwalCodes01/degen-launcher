/**
 * IPFS Upload Utilities
 * Supports multiple IPFS services with fallback options
 */

// Upload to Pinata IPFS
export async function uploadToPinata(file: File): Promise<string> {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
  
  if (!jwt || jwt === 'your_pinata_jwt_here') {
    throw new Error('Pinata JWT not configured. Please add NEXT_PUBLIC_PINATA_JWT to .env.local');
  }

  const formData = new FormData();
  formData.append('file', file);

  const pinataMetadata = JSON.stringify({
    name: file.name,
  });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', pinataOptions);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Pinata upload failed: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
}

// Upload to web3.storage (free alternative)
export async function uploadToWeb3Storage(file: File): Promise<string> {
  const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
  
  if (!token || token === 'your_web3_storage_token_here') {
    throw new Error('Web3.Storage token not configured');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Web3.Storage upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return `https://${data.cid}.ipfs.w3s.link`;
  } catch (error) {
    console.error('Web3.Storage upload error:', error);
    throw error;
  }
}

// Fallback: Convert to base64 (for development/testing only)
export async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Main upload function with fallback logic
export async function uploadImage(file: File, useIPFS: boolean = true): Promise<string> {
  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload PNG, JPEG, GIF, or WebP');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB');
  }

  // Try IPFS upload if enabled
  if (useIPFS) {
    try {
      console.log('🌐 Uploading to IPFS via Pinata...');
      const ipfsUrl = await uploadToPinata(file);
      console.log('✅ IPFS upload successful:', ipfsUrl);
      return ipfsUrl;
    } catch (pinataError) {
      console.warn('⚠️ Pinata upload failed, trying Web3.Storage...', pinataError);
      
      try {
        const ipfsUrl = await uploadToWeb3Storage(file);
        console.log('✅ Web3.Storage upload successful:', ipfsUrl);
        return ipfsUrl;
      } catch (web3Error) {
        console.warn('⚠️ All IPFS services failed, falling back to base64...', web3Error);
        console.warn('⚠️ Base64 is not recommended for production (high gas costs)');
      }
    }
  }

  // Fallback to base64
  console.log('📦 Converting to base64 (not recommended for production)...');
  return await convertToBase64(file);
}

// Validate IPFS URL
export function isValidIPFSUrl(url: string): boolean {
  return url.startsWith('https://gateway.pinata.cloud/ipfs/') ||
         url.startsWith('https://ipfs.io/ipfs/') ||
         url.startsWith('ipfs://') ||
         url.includes('.ipfs.w3s.link');
}

// Get display URL for IPFS
export function getIPFSDisplayUrl(url: string): string {
  if (url.startsWith('ipfs://')) {
    const hash = url.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  return url;
}
