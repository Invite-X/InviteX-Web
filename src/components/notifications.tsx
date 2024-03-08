"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { Bell } from "lucide-react";
import { useState } from "react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  return (
    <Dropdown backdrop="blur">
      <DropdownTrigger>
        <Button isIconOnly variant="light">
          <Bell className="w-6 h-6" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        {notifications.length > 0 ? (
          notifications.map((notification: any) => {
            return (
              <DropdownItem key={notification.id}>
                <p>{notification.title}</p>
                <p>{notification.content}</p>
              </DropdownItem>
            );
          })
        ) : (
          <DropdownItem variant="light">No Notifications.</DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
