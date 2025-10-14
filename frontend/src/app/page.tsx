"use client";
import { useState } from "react";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/stateful-button";
import { useRouter } from "next/navigation";
import ColourfulText from "@/components/ui/colourful-text";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { LinkPreview } from "@/components/ui/link-preview";
import { Lens } from "@/components/ui/lens";

export default function Page() {
  const router = useRouter()
  const [hovering, setHovering] = useState(false);
  const handleClick = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
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
    "https://assets.aceternity.com/carousel.webp",
    "https://assets.aceternity.com/placeholders-and-vanish-input.png",
    "https://assets.aceternity.com/shooting-stars-and-stars-background.png",
    "https://assets.aceternity.com/signup-form.png",
    "https://assets.aceternity.com/cloudinary_bkp/stars_sxle3d.png",
    "https://assets.aceternity.com/spotlight-new.webp",
    "https://assets.aceternity.com/cloudinary_bkp/Spotlight_ar5jpr.png",
    "https://assets.aceternity.com/cloudinary_bkp/Parallax_Scroll_pzlatw_anfkh7.png",
    "https://assets.aceternity.com/tabs.png",
    "https://assets.aceternity.com/cloudinary_bkp/Tracing_Beam_npujte.png",
    "https://assets.aceternity.com/cloudinary_bkp/typewriter-effect.png",
    "https://assets.aceternity.com/glowing-effect.webp",
    "https://assets.aceternity.com/hover-border-gradient.png",
    "https://assets.aceternity.com/cloudinary_bkp/Infinite_Moving_Cards_evhzur.png",
    "https://assets.aceternity.com/cloudinary_bkp/Lamp_hlq3ln.png",
    "https://assets.aceternity.com/macbook-scroll.png",
    "https://assets.aceternity.com/cloudinary_bkp/Meteors_fye3ys.png",
    "https://assets.aceternity.com/cloudinary_bkp/Moving_Border_yn78lv.png",
    "https://assets.aceternity.com/multi-step-loader.png",
    "https://assets.aceternity.com/vortex.png",
    "https://assets.aceternity.com/wobble-card.png",
    "https://assets.aceternity.com/world-map.webp",
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
      <h2 className="relative mb-8 z-20 mx-auto max-w-4xl text-center text-2xl font-bold text-balance text-white md:text-4xl lg:text-6xl">
           <TypewriterEffectSmooth words={words} />{" "}
        <span className="relative z-20 inline-block rounded-xl  px-4 py-1 text-white decoration-[6px] underline-offset-[16px]">
          <TypewriterEffectSmooth words={Words} /><ColourfulText text="DegenPad" />
        </span>
      </h2>
      <p className="relative mt-8 z-20 mx-auto max-w-2xl py-8 text-center text-xl text-neutral-200 md:text-base">
        You're not just a trader. You're a creator, a trendsetter, and a pioneer
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
            className="text-2xl font-bold px-12 py-8 rounded-xl bg-gradient-to-r from-gray-700 via-gray-900 to-black text-white shadow-lg hover:scale-105 transition-transform duration-200"
            onClick={handleClick}
          >
            Explore Tokens
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
