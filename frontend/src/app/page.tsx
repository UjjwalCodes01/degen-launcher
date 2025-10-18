"use client";
import { useState } from "react";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/stateful-button";
import { useRouter } from "next/navigation";
import ColourfulText from "@/components/ui/colourful-text";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { LinkPreview } from "@/components/ui/link-preview";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Page() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false);
  
  const handleClick = async () => {
    setIsNavigating(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push("/Homepage");
  };
  const images = [
    "image.png",
    "image2.png",
    "image3.png",
    "image4.png",
    "image5.png",
    "image6.png",
    "image8.png",
    "image.png",
    "image2.png",
    "image3.png",
    "image4.png",
    "image5.png",
    "image6.png",
    "image.png",
    "image8.png",
    "image.png",
    "image2.png",
    "image3.png",
    "image4.png",
    "image5.png",
    "image6.png",
    "image.png",
    "image8.png",
    "image3.png",
    "image2.png",
    "image.png",
    "image4.png",
    "image5.png",
    "image6.png",
    "image.png",
    "image8.png",
  ];
  const words = [
    {
      text: "Unleash Your",
      className: "text-white text-6xl"
    },
    {
      text: "Creativity",
      className: "text-white text-6xl"
    },
    {
      text: "Launch",
      className: "text-white text-6xl"
    }
  ];
  const Words = [ 
    {
      text: "Meme Coins",
      className: "text-white text-6xl"
    },
    {
      text: "Instantly on",
      className: "text-blue-500 text-6xl dark:text-blue-500",
    },
  ];
  return (
    <div className="relative gap-8 mx-auto my-10 flex h-screen w-full max-w-7xl flex-col items-center justify-center overflow-hidden rounded-3xl">
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6">
            <LoadingSpinner size="xl" />
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white">Loading Tokens...</h3>
              <p className="text-gray-400 text-sm">Connecting to Sepolia network</p>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <h2 className="relative mb-8 z-20 mx-auto max-w-4xl text-center text-2xl font-bold text-balance text-white md:text-4xl lg:text-6xl">
           <TypewriterEffectSmooth words={words} />{" "}
        <span className="relative z-20 inline-block rounded-xl  px-4 py-1 text-white decoration-[6px] underline-offset-[16px]">
          <TypewriterEffectSmooth words={Words} /><ColourfulText text="DegenPad" />
        </span>
      </h2>
      <p className="relative mt-8 z-20 mx-auto max-w-2xl py-8 text-center text-xl text-neutral-200 md:text-base">
        You&apos;re not just a trader. You&apos;re a creator, a trendsetter, and a pioneer
        in the world of decentralized finance. Build, launch, and trade meme
        coins with bonding curve mechanics—no gatekeepers, no limits, just pure
        DeFi innovation.
      </p>

      <div className="relative z-20 flex flex-wrap items-center justify-center gap-10 pt-4">
        <div className="flex h-20 items-center justify-center">
          <ConnectButton />
        </div>
        <div className="flex h-20 items-center justify-center">
          <LinkPreview
          url="http://localhost:3000/Homepage"
          imageSrc="nft.png"
          isStatic
          className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-pink-500"
        >

          <Button
            className="text-2xl font-bold px-12 py-8 rounded-xl bg-gradient-to-r from-gray-700 via-gray-900 to-black text-white shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            onClick={handleClick}
            disabled={isNavigating}
          >
            {isNavigating ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              'Explore Tokens'
            )}
          </Button>
        </LinkPreview>
          
        </div>
      </div>

      {/* overlay */}
      <div className="absolute inset-0 z-10 h-full w-full bg-black/80 dark:bg-black/40" />
      <ThreeDMarquee
        className="pointer-events-none absolute inset-0 h-full w-full"
        images={images}
      />
    </div>
  );
}
