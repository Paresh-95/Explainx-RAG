// components/space/MeetingsList.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Video, Calendar, Clock, User, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  status: "SCHEDULED" | "STARTED" | "ENDED" | "CANCELLED";
  zoomJoinUrl: string;
  zoomMeetingId: string;
  zoomPassword?: string;
  createdBy: {
    id: string;
    name?: string;
    email?: string;
  };
}

interface MeetingsListProps {
  spaceId: string;
  refreshTrigger?: number;
}

export default function MeetingsList({ spaceId, refreshTrigger }: MeetingsListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/meetings`);
      if (!response.ok) throw new Error("Failed to fetch meetings");
      
      const data = await response.json();
      setMeetings(data.meetings || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast.error("Failed to load meetings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [spaceId, refreshTrigger]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "SCHEDULED": 
        return { 
          color: "bg-blue-50 text-blue-700 border-blue-200", 
          dot: "bg-blue-500",
          glow: "shadow-blue-100"
        };
      case "STARTED": 
        return { 
          color: "bg-green-50 text-green-700 border-green-200", 
          dot: "bg-green-500",
          glow: "shadow-green-100"
        };
      case "ENDED": 
        return { 
          color: "bg-gray-50 text-gray-700 border-gray-200", 
          dot: "bg-gray-400",
          glow: "shadow-gray-100"
        };
      case "CANCELLED": 
        return { 
          color: "bg-red-50 text-red-700 border-red-200", 
          dot: "bg-red-500",
          glow: "shadow-red-100"
        };
      default: 
        return { 
          color: "bg-gray-50 text-gray-700 border-gray-200", 
          dot: "bg-gray-400",
          glow: "shadow-gray-100"
        };
    }
  };

  const isUpcoming = (scheduledAt: string) => {
    return new Date(scheduledAt) > new Date();
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const diffTime = Math.abs(date.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 2) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const handleJoinMeeting = (joinUrl: string, title: string) => {
    window.open(joinUrl, "_blank");
    toast.success(`Opening ${title}...`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Card className="w-[400px] min-h-[120px] h-auto flex flex-col justify-center items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl p-6">
          <div className="w-full h-full flex flex-col justify-center items-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full mb-4 last:mb-0">
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-zinc-800 dark:to-zinc-700 rounded-lg w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-zinc-800 dark:to-zinc-700 rounded-md w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <Card className="w-[400px] min-h-[120px] h-auto flex flex-col justify-center items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl p-6">
          <CardContent className="text-center flex flex-col items-center justify-center h-full w-full">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full blur-3xl"></div>
              <Video className="relative h-16 w-16 mx-auto text-gray-400 dark:text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No meetings scheduled</h3>
            <p className="text-gray-600 dark:text-zinc-400 max-w-sm mx-auto">
              Create your first meeting to start collaborating with your team.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Separate upcoming and past meetings
  const upcomingMeetings = meetings.filter(m => isUpcoming(m.scheduledAt));
  const pastMeetings = meetings.filter(m => !isUpcoming(m.scheduledAt));

  return (
    <div className="flex flex-wrap gap-6 justify-start">
      {meetings.map((m) => {
        const statusClass = getStatusConfig(m.status).color;
        return (
          <div
            key={m.id}
            className="w-[400px] min-h-[180px] h-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl flex flex-col justify-between p-6 overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{m.title}</h2>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass} border border-transparent`}>{m.status}</span>
              </div>
              {m.description && (
                <p className="text-sm text-gray-600 dark:text-zinc-300 line-clamp-4 mb-4">{m.description}</p>
              )}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(m.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                  <Clock className="h-4 w-4" />
                  <span>{m.duration} mins</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                  <User className="h-4 w-4" />
                  <span>{m.createdBy.name || m.createdBy.email}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-end mt-6">
              <Button
                size="sm"
                onClick={() => handleJoinMeeting(m.zoomJoinUrl, m.title)}
                className="text-white bg-purple-600 hover:bg-purple-700 rounded-full px-5 py-2 shadow-md font-semibold flex items-center"
              >
                <Video className="h-4 w-4 mr-2" />
                Join
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}