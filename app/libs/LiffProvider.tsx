"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import Image from "next/image";

export default function LiffProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 4) return ".";
        return prev + ".";
      });
    }, 400); // ความเร็ว (ms)

    
    const initLiff = async () => {
        if(process.env.NEXT_PUBLIC_LINE_LIFF_ID === undefined) {
            console.log("LIFF ID is not defined");
            setReady(true);
            return;
        }
      try {
        await liff.init({
          liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID!,
        });

        console.log("LIFF initialized");
        setReady(true);
      } catch (error) {
        console.error("LIFF init failed", error);
      }
    };

    initLiff();
    return () => clearInterval(interval);
  }, []);
  if (!ready) return <div className="flex flex-col items-center justify-center h-screen font-bold">
    <Image src="/assets/icons/loading.gif" alt="Loading" width={100} height={100} className="mb-1" loading="eager" />
    <p>Loading{dots}</p>
    </div>;

  return <>{children}</>;
}