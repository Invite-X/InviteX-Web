"use client";

import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Input,
  Kbd,
  Skeleton,
} from "@nextui-org/react";
import Notifications from "./notifications";
import Settings from "./settings";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  useDisclosure,
} from "./sheet";
import { Menu, SearchIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const { user, isLoaded } = useUser();

  return (
    <Card className="mt-4 mx-4">
      <CardHeader className="w-full flex items-center justify-between border-gray-400 p-3">
        <div className="left flex gap-6 items-center justify-center">
          <Button variant="light" isIconOnly onClick={onOpen}>
            <Menu />
          </Button>
          <Sheet
            backdrop="blur"
            placement="left"
            size="sm"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
          >
            <SheetContent>
              {(onClose) => (
                <>
                  <SheetHeader className="mt-4">
                    <Button
                      variant="light"
                      className="flex items-center justify-center w-full gap-4 h-fit p-4"
                    >
                      {isLoaded ? (
                        <>
                          <Avatar src={user?.imageUrl} size="lg" />
                          <div className="w-3/4 flex flex-col justify-center">
                            <div className="name text-xl font-semibold">
                              {user?.fullName}
                            </div>
                            <div className="phone text-md font-normal">
                              {user?.primaryPhoneNumber?.toString()}
                            </div>
                            <div className="member-since text-sm font-normal">
                              Member since {user?.createdAt?.getDate()}
                              {"-"}
                              {user?.createdAt?.getMonth()}
                              {"-"}
                              {user?.createdAt?.getFullYear()}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <Skeleton className="rounded-full h-12 w-12" />
                          <div className="w-3/4 flex flex-col items-center gap-2 justify-center">
                            <Skeleton className="w-3/4 h-6" />
                            <Skeleton className="w-1/2 h-6" />
                            <Skeleton className="w-1/3 h-4" />
                          </div>
                        </>
                      )}
                    </Button>
                  </SheetHeader>
                  <SheetBody>
                    <Link href="/friends">
                      <Button variant="light" className="w-full">
                        Your friends
                      </Button>
                    </Link>
                    <Link href="/privacy-policy">
                      <Button variant="light" className="w-full">
                        Privacy Policy
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button variant="light" className="w-full">
                        About Us
                      </Button>
                    </Link>
                    <Link href="/logout">
                      <Button color="danger" variant="light" className="w-full">
                        Log Out
                      </Button>
                    </Link>
                  </SheetBody>
                  <SheetFooter>v0.1</SheetFooter>
                </>
              )}
            </SheetContent>
          </Sheet>
          <div className="search">
            <Input
              variant="flat"
              startContent={<SearchIcon />}
              endContent={<Kbd keys={["command"]}>K</Kbd>}
              placeholder="Type to search..."
            />
          </div>
        </div>
        <div className="right flex items-center justify-center gap-4">
          <Notifications />
          <Settings />
          {/* <UserButton /> */}
        </div>
      </CardHeader>
    </Card>
  );
}
