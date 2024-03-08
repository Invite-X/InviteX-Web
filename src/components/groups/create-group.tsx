"use client";

import { trpc } from "@/lib/trpc";
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
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CreateGroup(props: { refetch: () => void }) {
  const { onOpen, onOpenChange, isOpen } = useDisclosure();
  const { isLoading, mutateAsync } = trpc.createGroup.useMutation();
  const [groupName, setGroupName] = useState<string>("");

  return (
    <>
      <Button
        isIconOnly
        className="right absolute right-2 top-2"
        variant="light"
        onPress={onOpen}
      >
        <PlusIcon />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => {
            return (
              <>
                <ModalHeader>Create a new group</ModalHeader>
                <ModalBody>
                  <Input
                    label="Group Name"
                    variant="flat"
                    size="sm"
                    isRequired
                    onValueChange={(value) => setGroupName(value)}
                  />
                  {/* TODO: add members while creating group */}
                </ModalBody>
                <ModalFooter>
                  <Button
                    className="flex items-center justify-center gap-2"
                    variant="shadow"
                    color="primary"
                    onClick={async () => {
                      try {
                        await mutateAsync({ name: groupName });
                      } catch (err: any) {
                        const errorString = JSON.parse(err.message)[0].message;
                        toast.error(`Error: ${errorString}`);
                        return;
                      }
                      setGroupName("");
                      onClose();
                      props.refetch();
                    }}
                  >
                    {isLoading ? <Spinner color="white" size="sm" /> : "Create"}
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </>
  );
}
