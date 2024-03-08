import Groups from "@/components/groups/groups";
import CreateInvite from "@/components/invites/createinvite";
import Invites from "@/components/invites/invites";
import Navbar from "@/components/navbar";
import Recent from "@/components/recent";
import RSVP from "@/components/rsvp";

export default function Home() {
  return (
    <div className="w-screen h-screen bg-background">
      Work in Progress
      {/* <Navbar /> */}
      <div className="flex items-center justify-center h-[90%]">
        <div className="w-4/5 h-full py-4 pl-4 relative">
          {/* <Invites />
          <CreateInvite /> */}
        </div>
        <div className="w-1/5 p-4 gap-2 h-full flex flex-col items-center justify-center">
          {/* <Groups />
          <Recent />
          <RSVP /> */}
        </div>
      </div>
    </div>
  );
}
