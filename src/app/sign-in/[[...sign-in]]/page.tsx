"use client";

import Loading from "@/components/loading";
import AuthenticateComponent from "@/components/sign-in-or-out";
import { useSignIn, useAuth } from "@clerk/nextjs";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Image,
  Input,
} from "@nextui-org/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const inputVariant = "bordered";

  const { setActive, signIn, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      window.location.href = "/";
    }
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="text-5xl w-screen h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <AuthenticateComponent>
        <Card className="w-[400px]">
          <CardHeader className="flex gap-3">
            <Image
              alt="nextui logo"
              height={40}
              radius="sm"
              src="/logo.png"
              width={40}
            />
            <div className="flex flex-col">
              <p className="text-md font-semibold">InviteX</p>
              <p className="text-small text-default-500">Sign In to continue</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <Input
              variant={inputVariant}
              size="sm"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              isRequired
              label={"Username"}
            />
            <Input
              type="password"
              size="sm"
              variant={inputVariant}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              className="mt-3"
              isRequired
            />
            <Button
              disabled={loading || !password || !username}
              variant="shadow"
              color="primary"
              className="mt-3"
              onClick={async () => {
                setLoading(true);
                try {
                  const result = await signIn.create({
                    identifier: username,
                    password,
                  });
                  if (result.status === "complete") {
                    await setActive({
                      session: result.createdSessionId,
                    });
                    window.location.href = "/";
                  } else {
                    toast.error(`Error: the status is ${result.status}`);
                  }
                } catch (err: any) {
                  toast.error(err.errors[0].longMessage);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Loading..." : "Sign In"}
            </Button>
          </CardBody>
          <CardFooter className="flex w-[97%] items-center justify-end gap-1">
            Don't have an account?{" "}
            <Link className="text-primary" href="/sign-up">
              Register
            </Link>
          </CardFooter>
        </Card>
      </AuthenticateComponent>
    </div>
  );
}
