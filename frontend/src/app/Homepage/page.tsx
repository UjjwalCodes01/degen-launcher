import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import Image from "next/image";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { RippleButton } from "@/components/ui/ripple-button";
import { CometCard } from "@/components/ui/comet-card";
import { PixelatedCanvas } from "@/components/ui/pixelated-canvas";

const page = () => {
  return (
    <div className="bg-black w-screen min-h-screen">
      <header
        className="border-b border-gray-800/30 backdrop-blur-lg sticky top-0 z-50"
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
            <button
              className="bg-gray-800 text-white px-6 py-3 rounded-lg text-2xl font-medium mr-6
hover:bg-gray-700 hover:shadow-lg hover:scale-105 border border-gray-600 
transition-all duration-200 ease-in-out"
            >
              Add Token
            </button>
          </div>
          {/* <div style={{ minWidth: "48px" }}></div> */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 overflow-x-hidden">
        <div className="flex justify-between items-center min-h-[calc(100vh-120px)]">
          <CometCard>
            <button
              type="button"
              className="flex w-60 cursor-pointer flex-col items-stretch rounded-[20px] border-0 bg-[#1F2121] p-4 md:p-6"
              aria-label="View invite F7RA"
              style={{
                transformStyle: "preserve-3d",
                transform: "none",
                opacity: 1,
              }}
            >
              <div className="mx-2 flex-1">
                <div className="relative mt-2 aspect-[3/4] w-full">
                  <PixelatedCanvas
                    src="degen_launcher.png"
                    width={240}
                    height={340}
                    cellSize={3}
                    dotScale={0.9}
                    shape="square"
                    backgroundColor="#000000"
                    dropoutStrength={0.4}
                    interactive
                    distortionStrength={3}
                    distortionRadius={80}
                    distortionMode="swirl"
                    followSpeed={0.2}
                    jitterStrength={4}
                    jitterSpeed={4}
                    sampleAverage
                    tintColor="#FFFFFF"
                    tintStrength={0.2}
                    className="rounded-xl border border-neutral-800 shadow-lg"
                  />
                </div>
              </div>
              <div className="mt-2 flex flex-shrink-0 items-center justify-between p-4 font-mono text-white">
                <div className="text-xs">Comet Invitation</div>
                <div className="text-xs text-gray-300 opacity-50">#F7RA</div>
              </div>
            </button>
          </CometCard>
        </div>
      </main>
    </div>
  );
};

export default page;
