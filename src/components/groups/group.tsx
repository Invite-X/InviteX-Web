"use client";

import { trpc } from "@/lib/trpc";
import { Tabs, Tab, Avatar } from "@nextui-org/react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import { PlusIcon, ShieldIcon, Users2Icon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Group({
  group,
  isOwner,
}: {
  group: any;
  isOwner: boolean;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [name, setName] = useState<string>(group.name);
  const [groupName, setGroupName] = useState<string>(group.name);
  const [addMembers, setAddMembers] = useState<string[]>([]);
  const [addMembersUsers, setAddMembersUsers] = useState<any[]>([]);
  const [removeMembers, setRemoveMembers] = useState<string[]>([]);
  const [memberToAdd, setMemberToAdd] = useState<string>("");
  const [memberToRemove, setMemberToRemove] = useState<string>(""); // TODO

  const {
    data: user,
    // isLoading: isUserIdLoading,
    // isRefetching: isUserIdRefetching,
    refetch: refetchUserId,
    isError,
    error,
  } = trpc.getUserFromQuery.useQuery({
    query: memberToAdd,
  });
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const {
    data: members,
    isLoading,
    refetch,
  } = trpc.getGroupMembers.useQuery({
    groupId: group.id,
  });
  console.log(members);

  const { mutateAsync: editGroup, isLoading: isUpdating } =
    trpc.editGroup.useMutation();

  return (
    <>
      <Button
        variant="light"
        className="p-4 flex items-center justify-between w-full"
        onPress={isOwner ? onOpen : () => {}}
      >
        <div className="flex items-center justify-center gap-3">
          {isOwner ? <ShieldIcon className="w-5 h-5" /> : null}
          {groupName}
        </div>
        <div className="members flex items-center justify-center font-regular gap-2">
          <Users2Icon className="w-5 h-5" />{" "}
          {isLoading ? <Spinner size="sm" /> : members?.length}
        </div>
      </Button>
      <Modal
        size="lg"
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Group</ModalHeader>
              <ModalBody>
                <Tabs
                  aria-label="edit-group-options"
                  size="sm"
                  radius="full"
                  color="primary"
                  variant="solid"
                >
                  <Tab title="General" key="general">
                    <Input
                      label="Group Name"
                      defaultValue={group.name}
                      size="sm"
                      onValueChange={(value) => setName(value)}
                    />
                  </Tab>
                  <Tab title="Add Members" key="add-members">
                    <div className="total">
                      {addMembers.length} member(s) will be added.
                    </div>
                    <div className="members-to-add max-h-52 overflow-y-scroll">
                      <div className="flex flex-col items-center justify-center gap-1 mt-3">
                        {addMembers.map((member) => {
                          const user =
                            addMembersUsers[addMembers.indexOf(member)];
                          return (
                            <Button
                              className="w-full justify-start"
                              key={member}
                              onClick={() => {
                                const i = addMembers.indexOf(member);
                                addMembers.splice(i, 1);
                                addMembersUsers.splice(i, 1);
                                setAddMembers([...addMembers]);
                                setAddMembersUsers([...addMembersUsers]);
                              }}
                              variant="light"
                              startContent={
                                <Avatar src={user.imageUrl} size="sm" />
                              }
                            >
                              {user?.username || member}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Input
                        label="Add Members"
                        size="sm"
                        variant="bordered"
                        onValueChange={(value) => {
                          setMemberToAdd(value);
                        }}
                      />
                      <Button
                        disabled={isAdding}
                        onClick={async () => {
                          setIsAdding(true);
                          await refetchUserId();
                          if (isError || !user) {
                            toast.error(
                              error?.message || "No such user exists."
                            );
                          } else {
                            if (addMembers.includes(user.id)) {
                              toast.error("User already added.");
                            } else {
                              setAddMembers([...addMembers, user?.id!]);
                              setAddMembersUsers([...addMembersUsers, user]);
                            }
                          }
                          setIsAdding(false);
                        }}
                        isIconOnly
                        size="lg"
                        variant="shadow"
                        color="primary"
                      >
                        {isAdding ? (
                          <Spinner size="sm" color="white" />
                        ) : (
                          <PlusIcon className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </Tab>
                  {/* TODO: make adding of members better in terms of UX */}
                  <Tab title="Remove Members" key="remove-members">
                    {/* TODO */}
                    hi
                  </Tab>
                  {/* TODO: removal of members and permissions */}
                  <Tab title="Permissions" key="permissions"></Tab>
                </Tabs>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" color="danger" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="shadow"
                  color="primary"
                  disabled={isUpdating}
                  onPress={async () => {
                    try {
                      await editGroup({
                        groupId: group.id,
                        name,
                        addMembers,
                        removeMembers,
                      });
                      setAddMembers([]);
                      setAddMembersUsers([]);
                      setRemoveMembers([]);
                    } catch (err: any) {
                      console.log(err);
                      const errorString = JSON.parse(err.message)[0].message;
                      toast.error(`Error: ${errorString}`);
                    } finally {
                      onClose();
                    }
                    setGroupName(name);
                    refetch();
                  }}
                >
                  {isUpdating ? <Spinner color="white" size="sm" /> : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
