import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { Context } from "@/lib/utils";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { clerk } from "@/lib/clerk";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// https://stackoverflow.com/questions/6850276/how-to-convert-dataurl-to-file-object-in-javascript#:~:text=use%20dataURLtoBlob()%20function%20to,and%20send%20ajax%20to%20server.&text=If%20you%20really%20want%20to%20convert%20the%20dataURL%20into%20File%20object.
// THIS SHIT WAS A PAIN BRUH TOOK FUCKING SO LONGGGGG
function dataURItoBlob(dataURI: string) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(",")[1]);

  // separate out the mime component
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  //Old Code
  //write the ArrayBuffer to a blob, and you're done
  //var bb = new BlobBuilder();
  //bb.append(ab);
  //return bb.getBlob(mimeString);

  //New Code
  return new Blob([ab], { type: mimeString });
}

const supabasePrivate = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE!
);

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const uid = function () {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const appRouter = t.router({
  getUserFromQuery: t.procedure
    .input(
      z.object({
        query: z.string().nonempty(),
      })
    )
    .query(async (opts) => {
      if (!opts.ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const matchingUsers = await clerk.users.getUserList({
        phoneNumber: [opts.input.query],
        username: [opts.input.query],
      });
      if (matchingUsers.length === 0)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No user with that phone number exists.",
        });
      return matchingUsers[0];
    }),
  getGroups: t.procedure.query(async (opts) => {
    if (!opts.ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const user = await prisma.user.findUnique({
      where: { id: opts.ctx.user?.id },
    });
    if (!user) {
      await prisma.user.create({
        data: {
          id: opts.ctx.user?.id,
        },
      });
    }
    const groups = await prisma.membersOfGroups.findMany({
      where: {
        userId: opts.ctx.user.id,
      },
      include: {
        group: true,
      },
    });
    return groups;
  }),
  createGroup: t.procedure
    .input(
      z.object({
        name: z.string().nonempty(),
      })
    )
    .mutation(async (opts) => {
      if (!opts.ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const user = await prisma.user.findUnique({
        where: { id: opts.ctx.user?.id },
      });
      if (!user) {
        await prisma.user.create({
          data: {
            id: opts.ctx.user?.id,
          },
        });
      }
      const newGroup = await prisma.group.create({
        data: {
          name: opts.input.name,
          ownerId: opts.ctx.user.id,
        },
      });
      await prisma.user.update({
        where: {
          id: opts.ctx.user.id,
        },
        data: {
          owned_groups: {
            connect: {
              id: newGroup.id,
            },
          },
        },
      });
      await prisma.membersOfGroups.create({
        data: {
          groupId: newGroup.id,
          userId: opts.ctx.user.id,
        },
      });
    }),
  getGroupMembers: t.procedure
    .input(
      z.object({
        groupId: z.number(),
      })
    )
    .query(async (opts) => {
      if (!opts.ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const members = await prisma.membersOfGroups.findMany({
        where: {
          groupId: opts.input.groupId,
        },
      });
      return members;
    }),
  editGroup: t.procedure
    .input(
      z.object({
        groupId: z.number(),
        name: z.string().nonempty(),
        addMembers: z.array(z.string().nonempty()).max(250),
        removeMembers: z.array(z.string().nonempty()).max(250),
      })
    )
    .mutation(async (opts) => {
      if (!opts.ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const group = await prisma.group.findUnique({
        where: {
          id: opts.input.groupId,
        },
      });
      if (!group)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The group does not exist.",
        });
      if (group.ownerId !== opts.ctx.user.id)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not an owner of the group.",
        });
      if (opts.input.name !== group.name) {
        await prisma.group.update({
          where: {
            id: opts.input.groupId,
          },
          data: {
            name: opts.input.name,
          },
        });
      }
      for (const memberId of opts.input.addMembers) {
        try {
          const user = await clerk.users.getUser(memberId);
          await prisma.user.upsert({
            where: {
              id: memberId,
            },
            update: {},
            create: {
              id: memberId,
            },
          });
          await prisma.membersOfGroups.create({
            data: {
              groupId: group.id,
              userId: user.id,
            },
          });
          await clerk.smsMessages.createSMSMessage({
            message: `You have been added to the InviteX group: ${opts.input.name}`,
            phoneNumberId: user.primaryPhoneNumberId!,
          });
        } catch (err: any) {
          console.log(err);
        }
      }
      for (const memberId of opts.input.removeMembers) {
        try {
          const user = await clerk.users.getUser(memberId);
          await prisma.membersOfGroups.deleteMany({
            where: {
              groupId: group.id,
              userId: memberId,
            },
          });
          await clerk.smsMessages.createSMSMessage({
            message: `You have been removed from the InviteX group: ${opts.input.name}`,
            phoneNumberId: user.primaryPhoneNumberId!,
          });
        } catch (err: any) {
          console.log(err);
        }
      }
    }),
  createInvite: t.procedure
    .input(
      z.object({
        groupId: z.number(),
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        location: z.string().nonempty(),
        datetime: z.date(),
        image: z.object({
          text: z.string().nonempty(),
          mime: z.string().nonempty(),
        }),
      })
    )
    .mutation(async (opts) => {
      if (!opts.ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const group = await prisma.group.findUnique({
        where: {
          id: opts.input.groupId,
        },
      });
      if (!group)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The group does not exist.",
        });
      if (group.ownerId !== opts.ctx.user.id)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not an owner of the group.",
        });
      try {
        const datetime = opts.input.datetime;
        const currentTime = new Date();
        if (datetime < currentTime || isNaN(datetime.getTime())) {
          console.log(datetime);
          console.log(isNaN(datetime.getTime()));
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "The date and time are not valid.",
          });
        }
        const fileExt = opts.input.image.mime.split("/").pop();
        const name = `${group.id}-${uid()}.${fileExt}`;
        console.log(name);
        console.log(fileExt);
        // generate uuid
        const file = dataURItoBlob(opts.input.image.text);
        const { data, error } = await supabasePrivate.storage
          .from("invite-images")
          .upload(name, file, {
            contentType: `${opts.input.image.mime};charset=UTF-8`,
          });
        console.log(1);
        if (error) {
          console.log(error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `ERROR: ${error.message}`,
          });
        }
        console.log(data.path, "lol2");
        const invite = await prisma.invite.create({
          data: {
            title: opts.input.title,
            description: opts.input.description,
            location: opts.input.location,
            datetime,
            groupId: opts.input.groupId,
            creatorId: opts.ctx.user.id,
            imagePath: data!.path,
          },
        });
        console.log(2);
        await prisma.inviteLog.create({
          data: {
            inviteId: invite.id,
            groupId: invite.groupId,
          },
        });

        const groupMembers = await prisma.membersOfGroups.findMany({
          where: {
            groupId: opts.input.groupId,
          },
        });
        console.log(3);
        for (const member of groupMembers) {
          try {
            const user = await clerk.users.getUser(member.userId);
            await clerk.smsMessages.createSMSMessage({
              message: `You have been invited to the InviteX event: ${opts.input.title}`,
              phoneNumberId: user.primaryPhoneNumberId!,
            });
          } catch (err) {
            console.log(`Unable to SMS user about invite.\nError: ${err}`);
          }
        }
      } catch (err: any) {
        console.log(err);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The date and time are not valid.",
        });
      }
    }),
  getInvites: t.procedure.query(async (opts) => {
    if (!opts.ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const groups = await prisma.membersOfGroups.findMany({
      where: {
        userId: opts.ctx.user.id,
      },
      include: {
        group: true,
      },
    });
    const invites = await prisma.invite.findMany({
      where: {
        groupId: {
          in: groups.map((group) => group.groupId),
        },
      },
    });
    return invites;
  }),
});

export type AppRouter = typeof appRouter;
