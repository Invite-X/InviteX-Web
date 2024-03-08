"use client";

import AuthenticateComponent from "@/components/sign-in-or-out";
import { Input } from "@nextui-org/input";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Divider } from "@nextui-org/divider";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { useSignUp, useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import config from "@/config.json";
import { Select, SelectItem } from "@nextui-org/react";
import Loading from "@/components/loading";

export default function Page() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("+91");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const inputVariant = "bordered";

  const { setActive, signUp, isLoaded } = useSignUp();
  const { isSignedIn } = useAuth();

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");

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
              <p className="text-small text-default-500">
                Register to continue
              </p>
            </div>
          </CardHeader>
          <Divider />
          {isVerifying ? (
            <>
              <CardBody>
                <Input
                  onChange={(e) => setOtp(e.target.value)}
                  label="OTP"
                  type="number"
                />
                <Button
                  onClick={async () => {
                    try {
                      await signUp.attemptPhoneNumberVerification({
                        code: otp,
                      });
                      await setActive({ session: signUp.createdSessionId });
                    } catch (err: any) {
                      toast.error(err.errors[0].longMessage);
                    }
                  }}
                  className="mt-3"
                  variant="shadow"
                  color="primary"
                >
                  Submit
                </Button>
              </CardBody>
            </>
          ) : (
            <>
              <CardBody>
                <div className="name gap-3 flex items-center justify-center w-full mb-4">
                  <Input
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                    isRequired
                    variant={inputVariant}
                    size="sm"
                    label="First Name"
                    className="w-1/2"
                  />
                  <Input
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                    isRequired
                    variant={inputVariant}
                    size="sm"
                    label="Last Name"
                    className="w-1/2"
                  />
                </div>
                <Input
                  label="Username"
                  variant={inputVariant}
                  size="sm"
                  isRequired
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  className="mb-4"
                />
                <div className="flex items-center justify-center w-full gap-3 mb-4">
                  <Select
                    className="w-1/2"
                    size="sm"
                    variant="bordered"
                    label="Country Code"
                    // placeholder="Select a country code"
                    // defaultValue={"+91"}
                    defaultSelectedKeys={[countryCode]}
                    selectedKeys={[countryCode]}
                  >
                    {config.country_codes.map((country) => {
                      return (
                        <SelectItem
                          key={country.dial_code}
                          value={country.dial_code}
                          onSelect={() => setCountryCode(country.dial_code)}
                        >
                          {country.name} ({country.dial_code})
                        </SelectItem>
                      );
                    })}
                  </Select>
                  <Input
                    label="Phone Number"
                    variant={inputVariant}
                    size="sm"
                    isRequired
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                    }}
                    className="w-1/2"
                  />
                </div>
                <Input
                  label="Password"
                  type="password"
                  variant={inputVariant}
                  size="sm"
                  isRequired
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                <Button
                  className="mt-4"
                  variant="shadow"
                  color="primary"
                  disabled={
                    !phoneNumber ||
                    !username ||
                    !password ||
                    !firstName ||
                    !lastName ||
                    loading ||
                    !isLoaded
                  }
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const res = await signUp?.create({
                        phoneNumber: countryCode + " " + phoneNumber,
                        username,
                        password,
                        firstName,
                        lastName,
                      });
                      try {
                        await signUp.preparePhoneNumberVerification();
                        setIsVerifying(true);
                      } catch (err: any) {
                        setIsVerifying(false);
                        toast.error(err.errors[0].longMessage);
                      }
                    } catch (err: any) {
                      toast.error(err.errors[0].longMessage);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Loading..." : "Create Account"}
                </Button>
              </CardBody>
              <CardFooter className="flex w-[97%] items-end justify-end gap-1">
                Have an account?{" "}
                <Link className="text-primary" href="/sign-in">
                  Sign In
                </Link>
              </CardFooter>
            </>
          )}
        </Card>
      </AuthenticateComponent>
    </div>
  );
}
