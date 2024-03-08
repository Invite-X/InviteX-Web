"use client";

import supabase from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import Invite from "./invite";
import { useAuth } from "@clerk/nextjs";

export default function Invites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [invitesSent, setInvitesSent] = useState<Invite[]>([]);
  const [invitesReceived, setInvitesReceived] = useState<Invite[]>([]);

  const {
    data: groups,
    isError: isGroupsError,
    isLoading: isGroupsLoading,
    error: groupsError,
  } = trpc.getGroups.useQuery();

  useEffect(() => {
    console.log("GROUPS LOADING", isGroupsLoading);
  }, [isGroupsLoading]);

  const user = useAuth();

  const {
    data: invitesData,
    error: invitesError,
    isLoading: invitesIsLoading,
    isError: invitesIsError,
    refetch: refetchInvites,
  } = trpc.getInvites.useQuery();

  useEffect(() => {
    if (invitesData) {
      invitesData.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      setInvitesReceived([]);
      setInvitesSent([]);
      invitesData.filter((invite) => {
        if (invite.creatorId === user.userId) {
          setInvitesSent((invitesSent) => [...invitesSent, invite]);
        } else {
          setInvitesReceived((invitesReceived) => [...invitesReceived, invite]);
        }
      });
      setInvites(invitesData);
    }
  }, [invitesData]);

  const onInvitePayload = (payload: {
    new: {
      id: string;
      inviteId: number;
      groupId: number;
    };
  }) => {
    console.log(payload, payload.new);
    console.log(groups, groupsError, isGroupsError, isGroupsLoading);
    for (const group of groups ?? []) {
      console.log(group);
      console.log(group.groupId === payload.new.groupId);
      if (group.groupId === payload.new.groupId) {
        console.log("Refetching...");
        refetchInvites();
      }
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("InviteLog")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "InviteLog",
        },
        onInvitePayload
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [isGroupsLoading]);

  if (invitesIsError) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        Error loading invites: {invitesError.message}
      </div>
    );
  }

  return (
    <Card className="h-full relative">
      <CardHeader className="pl-6 pt-6 text-3xl">
        Invites ({invites.length})
      </CardHeader>
      <CardBody>
        {invitesIsLoading ? (
          <>
            <Spinner color="primary" size="lg" label="Loading invites..." />
          </>
        ) : (
          <div className="invites-parent flex flex-wrap items-center justify-center gap-2 w-full">
            <Tabs
              fullWidth
              size="lg"
              color="primary"
              radius="full"
              className="text-white -mt-4"
            >
              <Tab
                className="w-full flex flex-wrap justify-evenly"
                key="received"
                title="Received"
              >
                {invitesReceived.map((invite) => {
                  return <Invite key={invite.id} invite={invite} />;
                })}
              </Tab>
              <Tab
                className="w-full flex flex-wrap justify-evenly"
                key="send"
                title="Sent"
              >
                {invitesSent.map((invite) => {
                  return <Invite key={invite.id} invite={invite} />;
                })}
              </Tab>
            </Tabs>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
