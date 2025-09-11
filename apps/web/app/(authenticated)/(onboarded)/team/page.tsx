// app/team/page.tsx

import { auth } from "../../../../auth";
import prisma from "@repo/db/client";
import { redirect } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { InviteMemberForm } from "../../../../components/invitations/invite-member-form";
import { PendingInvitations } from "../../../../components/invitations/pending-invitations";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui/components/ui/card";

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's organization
  const userOrg = await prisma.userOrganization.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: true,
    },
  });

  if (!userOrg) {
    redirect("/dashboard");
  }

  // Fetch all members of the organization
  const members = await prisma.userOrganization.findMany({
    where: {
      organizationId: userOrg.organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Check if user has permission to manage members
  const canManageMembers = ["OWNER", "ADMIN"].includes(userOrg.role);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {userOrg.organization.name} - Team Members
        </h2>
        <p className="text-muted-foreground">
          Manage your team members and their roles.
        </p>
      </div>

      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.user.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.image || ""} />
                      <AvatarFallback>
                        {member.user.name?.charAt(0) ||
                          member.user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {member.user.name || "No name"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {member.role.toLowerCase()}
                  </TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>
                    {new Date(member.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Only show invite form and pending invitations to owners and admins */}
      {canManageMembers && (
        <>
          <InviteMemberForm organizationId={userOrg.organizationId} />
          <PendingInvitations organizationId={userOrg.organizationId} />
        </>
      )}
    </div>
  );
}
