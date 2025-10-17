"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { RippleButton } from "@/components/ui/ripple-button";
import { CometCard } from "@/components/ui/comet-card";
import { PixelatedCanvas } from "@/components/ui/pixelated-canvas";
import { Boxes } from "@/components/ui/background-boxes";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { FACTORY_ADDRESS } from "@/contracts/addresses";
import FactoryABI from "@/contracts/Factory.json";
import { parseEther, formatEther, Abi } from "viem";
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

const factoryAbi = FactoryABI.abi as unknown as Abi;

const page = () => {
  const { address, isConnected, chain } = useAccount();
  const [files, setFiles] = useState<File[]>([]);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

  // Helper function to upload image and get URL
  const uploadImage = async (file: File): Promise<string> => {
    // For now, we'll create a local object URL
    // In production, you should upload to IPFS or your server
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // This creates a data URL (base64)
        // For production, upload to IPFS and use that URL
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
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
  const { writeContract: writeBuy, data: buyHash, isPending: isBuying, error: buyError } = useWriteContract();

  // Transaction receipts
  const { isLoading: isConfirmingCreate, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  const { isLoading: isConfirmingBuy, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
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
      // Upload image and get URL
      const imageUrl = await uploadImage(files[0]);
      
      writeCreate({
        address: FACTORY_ADDRESS,
        abi: factoryAbi,
        functionName: 'create',
        args: [tokenName, tokenSymbol, imageUrl],
        value: parseEther('0.01'),
      } as any);
    } catch (error) {
      console.error("Error uploading image:", error);
      setToast({ message: "Failed to upload image. Please try again.", type: 'error' });
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
    } as any);
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
                      <div className="grid border-2 border-black rounded-md gap-4">
                        <FileUpload onChange={handleFileUpload} />
                      </div>
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
                        disabled={isCreating || isConfirmingCreate}
                        className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreating || isConfirmingCreate ? (
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
};

export default page;
