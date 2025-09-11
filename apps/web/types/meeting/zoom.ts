export interface Member {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface Space {
  name: string;
}

export interface SessionUser {
  name?: string | null;
  email?: string | null;
}

export interface ZoomMeeting {
  id: string | number;
  join_url: string;
  password?: string;
}

export interface MeetingDetails {
  title: string;
  description?: string;
  scheduledAt: string | Date;
  duration?: number;
}

export interface ZoomMeetingRequest {
    topic: string;
    type: number;
    start_time: string;
    duration: number;
    password?: string;
    settings: {
      host_video: boolean;
      participant_video: boolean;
      join_before_host: boolean;
      mute_upon_entry: boolean;
      waiting_room: boolean;
      auto_recording: string;
    };
  }
