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
  Select,
  SelectItem,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

export default function CreateInvite() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { user, isLoaded } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [datetime, setDatetime] = useState("");
  const [groupId, setGroupId] = useState<number | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const { mutateAsync, isLoading: creatingInvite } =
    trpc.createInvite.useMutation();
  const { data: groups, isLoading: isGroupsLoading } =
    trpc.getGroups.useQuery();

  return (
    <div className="absolute right-10 bottom-10 z-30">
      <Button
        className={
          isOpen || isGroupsLoading || groups?.length === 0 ? `hidden` : ``
        }
        isIconOnly
        variant="shadow"
        size="lg"
        color="primary"
        onPress={onOpen}
      >
        <PlusIcon />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => {
            return (
              <>
                <ModalHeader>Create Event</ModalHeader>
                <ModalBody>
                  <Input
                    placeholder="Title"
                    onValueChange={(value) => setTitle(value)}
                    isRequired
                    defaultValue={title}
                  />
                  <Input
                    placeholder="Description"
                    onValueChange={(value) => setDescription(value)}
                    isRequired
                    defaultValue={description}
                  />
                  <Input
                    placeholder="Location"
                    onValueChange={(value) => setLocation(value)}
                    isRequired
                    defaultValue={location}
                  />
                  <div className="flex flex-col p-2 bg-gray-100 rounded-2xl hover:bg-gray-200">
                    <label htmlFor="date-time ">Date & Time</label>
                    <input
                      className="bg-transparent"
                      id="date-time"
                      name="date-time"
                      type="datetime-local"
                      aria-label="Date & Time"
                      onChange={(e) => setDatetime(e.target.value)}
                      defaultValue={datetime}
                    />
                  </div>
                  <Select
                    label="Group to invite"
                    isRequired
                    defaultSelectedKeys={groupId !== null ? [groupId] : []} // this doesn't work :/
                  >
                    {(
                      groups?.filter(
                        (group) => group.group.ownerId === user?.id
                      ) ?? []
                    ).map((group) => (
                      <SelectItem
                        key={group.group.id}
                        value={group.group.id}
                        onClick={() => setGroupId(group.group.id)}
                      >
                        {group?.group.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    type="file"
                    label="Image"
                    required
                    isRequired
                    onChange={(e) => {
                      if (e.target.files) {
                        setImage(e.target.files[0]);
                      }
                    }}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    onClick={async () => {
                      if (!groupId) {
                        toast.error("Please select a group");
                        return;
                      }
                      if (!image) {
                        toast.error("Please select an image");
                        return;
                      }
                      try {
                        const fileReader = new FileReader();
                        fileReader.readAsDataURL(image);
                        fileReader.onload = async () => {
                          await mutateAsync({
                            title,
                            description,
                            location,
                            datetime: new Date(datetime),
                            groupId: groupId,
                            image: {
                              text: fileReader.result as string,
                              mime: image?.type!,
                            },
                          });
                          setTitle("");
                          setDescription("");
                          setLocation("");
                          setDatetime("");
                          setGroupId(null);
                          onClose();
                        };
                      } catch (err: any) {
                        console.log(err);
                        try {
                          const errorString = JSON.parse(err.message)[0]
                            .message;
                          toast.error(`Error: ${errorString}`);
                        } catch (e2: any) {
                          toast.error(`Error: ${err.message}`);
                        }
                      }
                    }}
                    variant="shadow"
                    color="primary"
                    disabled={creatingInvite}
                  >
                    {creatingInvite ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      "Create"
                    )}
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </div>
  );
}
