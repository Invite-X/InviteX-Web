"use client";

import { Spinner } from "@nextui-org/react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center">
      <Spinner className="primary" label="Loading" size="lg" />
    </div>
  );
}
