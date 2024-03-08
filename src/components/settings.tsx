"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { SettingsIcon } from "lucide-react";

export default function Settings() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button isIconOnly variant="light" onPress={onOpen}>
        <SettingsIcon />
      </Button>
      <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Settings</ModalHeader>
              <ModalBody>work in progress</ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
