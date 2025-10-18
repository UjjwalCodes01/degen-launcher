"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { FACTORY_ADDRESS } from "@/contracts/addresses";
import FactoryABI from "@/contracts/Factory.json";
import { parseEther, Abi } from "viem";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import TokenList from "@/components/TokenList";
import { uploadImage } from "@/lib/ipfs";

const factoryAbi = FactoryABI.abi as unknown as Abi;

export default function Homepage() {
  const { address, isConnected, chain } = useAccount();
  const [files, setFiles] = useState<File[]>([]);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleFileUpload = (files: File[]) => {
    // Clear previous errors
    setImageError(null);
    
    if (files.length === 0) {
      setImagePreview(null);
      setFiles([]);
      return;
    }

    const file = files[0];
    
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please upload a valid image file (PNG, JPEG, GIF, or WebP)');
      setImagePreview(null);
      setFiles([]);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setImageError('Image size must be less than 5MB. Please choose a smaller image.');
      setImagePreview(null);
      setFiles([]);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      setImageError('Failed to read image file. Please try again.');
      setImagePreview(null);
    };
    reader.readAsDataURL(file);
    
    setFiles(files);
    console.log(files);
  };

  // Read total number of tokens
  const { 
    data: totalTokens, 
    refetch: refetchTotalTokens, 
    isError: isTotalTokensError, 
    error: totalTokensError,
    isLoading: isTotalTokensLoading 
  } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "totalTokens",
    query: {
      refetchInterval: 2000, // Refetch every 2 seconds
    }
  }) as { 
    data: bigint | undefined; 
    refetch: () => void; 
    isError: boolean; 
    error: Error | null;
    isLoading: boolean;
  };

  // Write contract hooks
  const { writeContract: writeCreate, data: createHash, isPending: isCreating, error: createError } = useWriteContract();
  const { writeContract: writeBuy, data: buyHash, error: buyError } = useWriteContract();

  // Transaction receipts
  const { isLoading: isConfirmingCreate, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  const { isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  // Handle create token
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName || !tokenSymbol) {
      setToast({ message: "Please fill in all fields", type: 'error' });
      return;
    }

    if (files.length === 0) {
      setToast({ message: "Please upload an image for your token", type: 'error' });
      return;
    }

    try {
      // Show uploading toast
      setToast({ message: "Uploading image to IPFS...", type: 'info' });
      setIsUploadingImage(true);
      
      // Upload image to IPFS and get URL
      const imageUrl = await uploadImage(files[0], true); // true = try IPFS first
      
      console.log('📸 Image uploaded:', imageUrl);
      setToast({ message: "Image uploaded! Creating token...", type: 'info' });
      
      writeCreate({
        address: FACTORY_ADDRESS,
        abi: factoryAbi,
        functionName: 'create',
        args: [tokenName, tokenSymbol, imageUrl],
        value: parseEther('0.01'),
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle buy token
  const handleBuyToken = (tokenAddress: string, amount: string) => {
    if (!amount || Number(amount) <= 0) {
      setToast({ message: "Please enter a valid amount", type: 'error' });
      return;
    }

    const amountInWei = parseEther(amount);

    // Note: In production, you should fetch the cost first
    // For now, we'll estimate the cost (you need to implement getCost)
    writeBuy({
      address: FACTORY_ADDRESS,
      abi: factoryAbi,
      functionName: 'buy',
      args: [tokenAddress, amountInWei],
      value: parseEther('0.1'), // Placeholder - should calculate actual cost
    });
  };

  // Handle create success
  useEffect(() => {
    if (isCreateSuccess) {
      console.log("✅ Token created successfully! Refetching total tokens...");
      setToast({ message: "Token created successfully! 🎉", type: 'success' });
      setIsDialogOpen(false);
      setTokenName("");
      setTokenSymbol("");
      setFiles([]); // Clear uploaded files
      setImagePreview(null); // Clear preview
      setImageError(null); // Clear errors
      // Delay refetch slightly to ensure blockchain state is updated
      setTimeout(() => {
        refetchTotalTokens();
        console.log("🔄 Total tokens refetched. New count:", totalTokens);
      }, 500);
    }
  }, [isCreateSuccess, refetchTotalTokens, totalTokens]);

  // Handle buy success
  useEffect(() => {
    if (isBuySuccess) {
      setToast({ message: "Tokens purchased successfully!", type: 'success' });
      refetchTotalTokens();
    }
  }, [isBuySuccess, refetchTotalTokens]);

  // Handle errors
  useEffect(() => {
    if (createError) {
      setToast({ message: "Failed to create token. Please try again.", type: 'error' });
    }
    if (buyError) {
      setToast({ message: "Failed to buy tokens. Please try again.", type: 'error' });
    }
  }, [createError, buyError]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  console.log("Wallet Connected:", isConnected);
  console.log(" Wallet Address:", address);
  console.log(" Chain:", chain);
  console.log(" Total Tokens (raw):", totalTokens);
  console.log("Total Tokens (number):", totalTokens ? Number(totalTokens) : 0);
  console.log("Total Tokens Loading:", isTotalTokensLoading);
  console.log("Total Tokens Error:", isTotalTokensError, totalTokensError);
  console.log("Factory Address:", FACTORY_ADDRESS);

  return (
    <div className="bg-black w-screen h-screen relative">
      <div className="relative z-10 h-full flex flex-col">
        <header
          className="border-b border-gray-800/30 backdrop-blur-lg sticky top-0 z-50 flex-shrink-0"
          style={{ background: "rgba(10, 10, 10, 0.95)" }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
            <div className="flex items-center">
              <Image
                src="/degen_launcher.png"
                alt="Degen Launcher Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center gap-6">
              <ConnectButton />
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" className="px-8 py-3 rounded-xl bg-blue-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border-0">
                    Create Token
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] text-black rounded-2xl p-10 shadow-2xl">
                  <form onSubmit={handleCreateToken}>
                    <DialogHeader className="space-y-4 mb-8">
                      <DialogTitle className="text-3xl font-bold bg-blue-500 bg-clip-text text-transparent">
                        Create New Token
                      </DialogTitle>
                      <DialogDescription className="text-black text-xl leading-relaxed space-y-2">
                        Launch your meme coin with bonding curve pricing.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid border-2 border-black rounded-md overflow-hidden">
                        {/* Image Preview inside upload area - Responsive */}
                        {imagePreview && !imageError ? (
                          <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[200px]">
                            {isUploadingImage && (
                              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                                <div className="flex flex-col items-center gap-3">
                                  <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <p className="text-blue-700 font-semibold text-sm">Uploading to IPFS...</p>
                                </div>
                              </div>
                            )}
                            <div className="relative rounded-xl overflow-hidden border-4 border-blue-400 shadow-lg w-full max-w-[200px] aspect-square">
                              <Image 
                                src={imagePreview} 
                                alt="Token preview" 
                                fill
                                sizes="200px"
                                className="object-cover"
                                priority
                              />
                            </div>
                            <div className="mt-4 text-center w-full px-2">
                              <p className="text-sm font-semibold text-blue-700 truncate">
                                ✓ {files[0]?.name}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {(files[0]?.size / 1024).toFixed(2)} KB
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setFiles([]);
                                  setImagePreview(null);
                                  setImageError(null);
                                }}
                                disabled={isUploadingImage}
                                className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        ) : (
                          <FileUpload onChange={handleFileUpload} />
                        )}
                      </div>
                      
                      {/* Image Error Message */}
                      {imageError && (
                        <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
                          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm font-medium">{imageError}</p>
                        </div>
                      )}
                      
                      <div className="grid gap-2">
                        <Label htmlFor="token-name" className="text-black font-semibold text-sm uppercase tracking-wide">
                          Token Name
                        </Label>
                        <Input 
                          id="token-name" 
                          name="tokenName"
                          value={tokenName}
                          onChange={(e) => setTokenName(e.target.value)}
                          placeholder="e.g., DogeKing" 
                          className="border-gray-600 text-black placeholder-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl px-5 py-4 text-base"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="token-symbol" className="text-black font-semibold text-sm uppercase tracking-wide">
                          Token Symbol
                        </Label>
                        <Input 
                          id="token-symbol" 
                          name="tokenSymbol"
                          value={tokenSymbol}
                          onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                          placeholder="e.g., DKING" 
                          maxLength={10}
                          className="border-gray-600 text-black placeholder-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl px-5 py-4 text-base uppercase"
                          required
                        />
                      </div>
                      <div className="h-4 text-black"></div>
                    </div>
                    <DialogFooter className="mt-10 gap-4 flex-row">
                      <DialogClose asChild>
                        <Button type="button" className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-all">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button 
                        type="submit" 
                        disabled={isUploadingImage || isCreating || isConfirmingCreate}
                        className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploadingImage ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Uploading to IPFS...
                          </span>
                        ) : isCreating || isConfirmingCreate ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {isConfirmingCreate ? 'Confirming...' : 'Creating...'}
                          </span>
                        ) : (
                          'Create Token (0.01 ETH)'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {/* <div style={{ minWidth: "48px" }}></div> */}
          </div>
        </header>

        {/* Main Content */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
          style={{ background: "rgba(10, 10, 10, 0.6)" }}
        >
          <div className="max-w-7xl mx-auto p-6">
            {/* Token Details Section */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-center">
                Trending Tokens
              </h2>
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-6">
                <div className="flex justify-center">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">Total Tokens Created</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {totalTokens ? totalTokens.toString() : "0"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <TokenList totalTokens={totalTokens ? Number(totalTokens) : 0} onBuy={handleBuyToken} />
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 duration-300">
          <div className={`${
            toast.type === 'success' ? 'bg-green-500/90' : 
            toast.type === 'error' ? 'bg-red-500/90' : 
            'bg-blue-500/90'
          } backdrop-blur-lg text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]`}>
            {toast.type === 'success' && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <p className="flex-1 font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
