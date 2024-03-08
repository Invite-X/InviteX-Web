"use client";

import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "react-hot-toast";
import { TrpcProvider } from "./trpc-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TrpcProvider>
      <Toaster />
      <NextUIProvider>
        <div className="">{children}</div>
      </NextUIProvider>
    </TrpcProvider>
  );
}
