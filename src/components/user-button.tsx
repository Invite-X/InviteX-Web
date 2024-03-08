"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, Skeleton } from "@nextui-org/react";

export default function UserButton() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Skeleton className="flex rounded-full w-8 h-8" />;
  }
  if (!isSignedIn) {
    return <div className="w-8 h-8 rounded-full">Not Signed In</div>;
  }

  return (
    <div className="w-8 h-8 rounded-full">
      <Avatar src={user.imageUrl} name={user.username!} size="sm" isBordered />
    </div>
  );
}
