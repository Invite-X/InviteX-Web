-- This is an empty migration.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MembersOfGroups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InviteLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY invite_log_sel_policy ON "InviteLog" FOR SELECT USING (true);