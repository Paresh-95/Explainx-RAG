// apps/web/components/space/CreateMeetingButton.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { toast } from "sonner";
import { Video, ExternalLink, Loader2 } from "lucide-react";
import { ZoomConnectionStatus } from "../../types/meeting/zoom-oauth";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Calendar } from "@repo/ui/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";

interface CreateMeetingButtonProps {
  spaceId: string;
  onMeetingCreated?: () => void;
  isOwner: boolean; // Only owners can create meetings
}

interface MeetingFormData {
  title: string;
  description: string;
  scheduledAt: string;
  duration: number;
}

export default function CreateMeetingButton({ 
  spaceId, 
  onMeetingCreated,
  isOwner 
}: CreateMeetingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingZoom, setIsCheckingZoom] = useState(false);
  const [zoomStatus, setZoomStatus] = useState<ZoomConnectionStatus>({
    connected: false
  });

  const [formData, setFormData] = useState<MeetingFormData>({
    title: "",
    description: "",
    scheduledAt: "",
    duration: 60,
  });

  // Check Zoom connection status
  const checkZoomConnection = async () => {
    if (!isOwner) return;
    
    setIsCheckingZoom(true);
    try {
      const response = await fetch('/api/zoom/status');
      if (response.ok) {
        const status = await response.json();
        setZoomStatus(status);
      }
    } catch (error) {
      console.error('Error checking Zoom status:', error);
    } finally {
      setIsCheckingZoom(false);
    }
  };

  useEffect(() => {
    if (isOpen && isOwner) {
      checkZoomConnection();
    }
  }, [isOpen, isOwner]);

  // Handle Zoom OAuth connection
  const handleConnectZoom = async () => {
    try {
      const response = await fetch('/api/zoom/oauth/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spaceId }),
      });

      if (response.ok) {
        const { authUrl } = await response.json();
        // Open OAuth in a new tab
        const win = window.open(authUrl, '_blank', 'width=600,height=700');
        if (!win) {
          toast.error('Popup blocked. Please allow popups and try again.');
          return;
        }
        // Poll for connection status
        const poll = setInterval(async () => {
          const statusRes = await fetch('/api/zoom/status');
          if (statusRes.ok) {
            const status = await statusRes.json();
            if (status.connected) {
              clearInterval(poll);
              win.close();
              toast.success('Zoom account connected!');
              setZoomStatus(status);
            }
          }
        }, 1500);
      } else {
        toast.error('Failed to initiate Zoom connection');
      }
    } catch (error) {
      console.error('Error connecting to Zoom:', error);
      toast.error('Failed to connect to Zoom');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!zoomStatus.connected) {
      toast.error('Please connect your Zoom account first');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/spaces/${spaceId}/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresAuth) {
          // Handle case where Zoom auth is required
          toast.error('Zoom authentication required');
          handleConnectZoom();
          return;
        }
        throw new Error(data.error || "Failed to create meeting");
      }

      toast.success("Meeting created and invitations sent!");
      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        scheduledAt: "",
        duration: 60,
      });
      onMeetingCreated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create meeting");
      console.error("Error creating meeting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "duration" ? parseInt(value) || 60 : value,
    }));
  };

  // Get minimum datetime (current time + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  // Don't show button if user is not owner
  if (!isOwner) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 px-6 py-2 rounded-2xl bg-purple-600 text-white font-semibold border border-purple-700 hover:bg-purple-700 transition">
          <Video className="h-4 w-4 mr-2" />
          Create Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Zoom Meeting</DialogTitle>
        </DialogHeader>

        {/* Zoom Connection Status */}
        <Card className="mb-4 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl">
          <CardContent className="p-4">
            {isCheckingZoom ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Checking Zoom connection...</span>
              </div>
            ) : zoomStatus.connected ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">Zoom Connected</span>
                  {zoomStatus.email && (
                    <span className="text-xs text-gray-500">({zoomStatus.email})</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to disconnect your Zoom account?')) {
                      fetch('/api/zoom/status', { method: 'DELETE' })
                        .then(() => {
                          setZoomStatus({ connected: false });
                          toast.success('Zoom account disconnected');
                        })
                        .catch(() => toast.error('Failed to disconnect Zoom account'));
                    }
                  }}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-700">Zoom Not Connected</span>
                </div>
                <p className="text-xs text-gray-600">
                  Connect your Zoom account to create meetings from your personal account
                </p>
                <Button
                  type="button"
                  onClick={handleConnectZoom}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Zoom Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meeting Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter meeting title"
              required
              disabled={!zoomStatus.connected}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Meeting description (optional)"
              rows={3}
              disabled={!zoomStatus.connected}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Date & Time *</Label>
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                <Popover open={!!formData.scheduledAt} onOpenChange={open => {
                  if (!open) return;
                  if (!zoomStatus.connected) return;
                }}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-picker"
                      className="w-32 justify-between font-normal"
                      type="button"
                      disabled={!zoomStatus.connected}
                    >
                      {formData.scheduledAt ?
                        new Date(formData.scheduledAt).toLocaleDateString() :
                        "Select date"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledAt ? new Date(formData.scheduledAt) : undefined}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        if (!date) return;
                        // If time is already set, preserve it
                        let time = "10:30:00";
                        if (formData.scheduledAt) {
                          const prev = new Date(formData.scheduledAt);
                          time = prev.toTimeString().slice(0, 8);
                        }
                        // Defensive: ensure all arguments are numbers
                        const year = date.getFullYear();
                        const rawMonth = date.getMonth();
                        const rawDay = date.getDate();
                        const month = typeof rawMonth === 'number' && !isNaN(rawMonth) ? rawMonth : 0;
                        const day = typeof rawDay === 'number' && !isNaN(rawDay) ? rawDay : 1;
                        const [hRaw, mRaw, sRaw] = time.split(":");
                        const h = Number(hRaw);
                        const m = Number(mRaw);
                        const s = Number(sRaw);
                        const iso = new Date(year, month, day, isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, isNaN(s) ? 0 : s).toISOString().slice(0, 16);
                        setFormData(prev => ({ ...prev, scheduledAt: iso }));
                      }}
                      disabled={!zoomStatus.connected}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-3">
                <Input
                  type="time"
                  id="time-picker"
                  step="60"
                  value={formData.scheduledAt ? new Date(formData.scheduledAt).toTimeString().slice(0,5) : "10:30"}
                  onChange={e => {
                    const time = e.target.value;
                    let date = formData.scheduledAt ? new Date(formData.scheduledAt) : new Date();
                    // Set hours and minutes
                    const [h, m] = time.split(":").map(Number);
                    date.setHours(h || 0);
                    date.setMinutes(m || 0);
                    // Keep date, update time
                    setFormData(prev => ({ ...prev, scheduledAt: date.toISOString().slice(0, 16) }));
                  }}
                  disabled={!zoomStatus.connected}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              min={15}
              max={480}
              step={15}
              disabled={!zoomStatus.connected}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !zoomStatus.connected}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Meeting"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}