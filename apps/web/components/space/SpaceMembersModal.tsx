// components/space/SpaceMembersModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Crown, User } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

interface Member {
  id: string;
  userId: string;
  status: string;
  joinedAt: string;
  isOwner?: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    username?: string;
  };
}

interface SpaceMembersModalProps {
  spaceSlug: string;
  isOpen: boolean;
  onClose: () => void;
  canManageMembers: boolean;
  currentUserId: string;
}

export default function SpaceMembersModal({
  spaceSlug,
  isOpen,
  onClose,
  canManageMembers,
  currentUserId,
}: SpaceMembersModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, spaceSlug]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/spaces/${spaceSlug}/members`);
      const data = await response.json();

      if (data.success) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Role management no longer needed - simplified member system

  const removeMember = async (memberId: string, memberName: string) => {
    if (
      !confirm(`Are you sure you want to remove ${memberName} from this space?`)
    ) {
      return;
    }

    setIsUpdating(memberId);
    try {
      const response = await fetch(
        `/api/spaces/${spaceSlug}/members/${memberId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (data.success) {
        fetchMembers(); // Refresh the list
        router.refresh();
      } else {
        alert(data.error || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    } finally {
      setIsUpdating(null);
    }
  };

  const getMemberIcon = (isOwner: boolean) => {
    return isOwner ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const getMemberBadgeStyle = (isOwner: boolean) => {
    return isOwner
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden border border-zinc-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Space Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border border-zinc-700 rounded-lg bg-zinc-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-zinc-600 rounded-full flex items-center justify-center">
                      {member.user.image ? (
                        <img
                          src={member.user.image}
                          alt={member.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {member.user.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {member.user.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {member.user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined: {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                        getMemberBadgeStyle(member.isOwner || false),
                      )}
                    >
                      {getMemberIcon(member.isOwner || false)}
                      {member.isOwner ? "Owner" : "Member"}
                    </span>

                    {canManageMembers &&
                      !member.isOwner &&
                      member.userId !== currentUserId && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() =>
                              removeMember(member.id, member.user.name)
                            }
                            disabled={isUpdating === member.id}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-zinc-700">
          <p className="text-sm text-gray-400">
            Total members: {members.length}
          </p>
        </div>
      </div>
    </div>
  );
}
