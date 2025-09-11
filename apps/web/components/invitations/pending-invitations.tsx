"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface Invitation {
  id: string;
  token: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface PendingInvitationsProps {
  organizationId: string;
}

export function PendingInvitations({
  organizationId,
}: PendingInvitationsProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, [organizationId]);

  const fetchInvitations = async () => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/invitations`,
      );
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvite = async (token: string) => {
    try {
      const response = await fetch(`/api/invitations/${token}/cancel`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the invitations list
        fetchInvitations();
      }
    } catch (error) {
      console.error("Error canceling invitation:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.token}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>{invitation.role.toLowerCase()}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(invitation.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(invitation.expiresAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelInvite(invitation.token)}
                  >
                    Cancel
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
