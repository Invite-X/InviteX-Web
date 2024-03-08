"use client";

import { Card, CardBody, CardHeader, Skeleton } from "@nextui-org/react";
import { trpc } from "@/lib/trpc";
import { Users2Icon } from "lucide-react";
import CreateGroup from "./create-group";
import Group from "./group";

export default function Groups() {
  const {
    data: groups,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.getGroups.useQuery();

  return (
    <Card className="w-full h-1/3">
      <CardHeader className="relative">
        <div className="left absolute left-4 top-4">Groups</div>
        <CreateGroup refetch={refetch} />
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="p-4 flex flex-col w-full h-full items-center justify-center gap-2">
            {new Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full h-2/3 rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <>
            <div className="w-full h-full flex items-center justify-center gap-3">
              <Users2Icon />
              <div>ERROR: {error.message}</div>
            </div>
          </>
        ) : groups?.length !== 0 ? (
          <div>
            {groups?.map((group) => (
              <Group
                key={group.group.id}
                group={group.group}
                isOwner={group.group.ownerId === group.userId}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center gap-3">
            <Users2Icon />
            <div>No groups found.</div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
