import supabase from "@/lib/supabase";
import { Button, Card, CardFooter, Image } from "@nextui-org/react";

interface InviteProps {
  invite: Invite;
}

export default function Invite(props: InviteProps) {
  return (
    <Card
      className="w-full sm:w-[49%] mb-4 h-[250px] col-span-12 sm:col-span-5"
      key={props.invite.id}
      isHoverable
      isFooterBlurred
    >
      <Image
        removeWrapper
        alt="Card example background"
        className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
        src={
          supabase.storage
            .from("invite-images")
            .getPublicUrl(props.invite.imagePath, {
              download: false,
            }).data.publicUrl
        }
      />
      <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
        <div>
          <p className="text-black text-xl font-bold">{props.invite.title}</p>
          <p className="text-black text-tiny">{props.invite.description}</p>
        </div>
        <div className="buttons flex gap-2">
          <Button
            className="text-tiny"
            color="primary"
            variant="shadow"
            radius="full"
            size="sm"
          >
            Accept
          </Button>
          <Button
            className="text-tiny"
            color="default"
            variant="light"
            radius="full"
            size="sm"
          >
            Ignore
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
