// apps/web/types/zoom-oauth.ts
export interface ZoomTokenResponse {
    access_token: string;
    token_type: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  }
  
  export interface ZoomUserInfo {
    id: string;
    account_id: string;
    account_number: number;
    email: string;
    first_name: string;
    last_name: string;
    display_name: string;
    type: number;
    role_name: string;
    pmi: number;
    use_pmi: boolean;
    personal_meeting_url: string;
    timezone: string;
    verified: number;
    dept: string;
    created_at: string;
    last_login_time: string;
    last_client_version: string;
    pic_url: string;
    host_key: string;
    jid: string;
    group_ids: string[];
    im_group_ids: string[];
    language: string;
    phone_country: string;
    phone_number: string;
    status: string;
  }
  
  export interface ZoomMeetingParticipant {
    email: string;
    name?: string;
  }
  
  export interface ZoomMeetingRegistrant {
    email: string;
    first_name: string;
    last_name: string;
    auto_approve?: boolean;
  }
  
  export interface ZoomMeetingSettings {
    host_video: boolean;
    participant_video: boolean;
    cn_meeting: boolean;
    in_meeting: boolean;
    join_before_host: boolean;
    jbh_time: number;
    mute_upon_entry: boolean;
    watermark: boolean;
    use_pmi: boolean;
    approval_type: number;
    registration_type: number;
    audio: string;
    auto_recording: string;
    enforce_login: boolean;
    enforce_login_domains: string;
    alternative_hosts: string;
    alternative_host_update_polls: boolean;
    close_registration: boolean;
    show_share_button: boolean;
    allow_multiple_devices: boolean;
    registrants_confirmation_email: boolean;
    waiting_room: boolean;
    request_permission_to_unmute_participants: boolean;
    global_dial_in_countries: string[];
    global_dial_in_numbers: Array<{
      country: string;
      country_name: string;
      city: string;
      number: string;
      type: string;
    }>;
    registrants_email_notification: boolean;
    meeting_authentication: boolean;
    authentication_option: string;
    authentication_domains: string;
    authentication_name: string;
    breakout_room: {
      enable: boolean;
      rooms: Array<{
        name: string;
        participants: string[];
      }>;
    };
    language_interpretation: {
      enable: boolean;
      interpreters: Array<{
        email: string;
        languages: string;
      }>;
    };
  }
  
  export interface ZoomMeetingRequest {
    topic: string;
    type: number;
    start_time: string;
    duration: number;
    schedule_for?: string;
    timezone?: string;
    password?: string;
    default_password?: boolean;
    agenda?: string;
    tracking_fields?: Array<{
      field: string;
      value: string;
    }>;
    recurrence?: {
      type: number;
      repeat_interval: number;
      weekly_days: string;
      monthly_day: number;
      monthly_week: number;
      monthly_week_day: number;
      end_times: number;
      end_date_time: string;
    };
    settings: Partial<ZoomMeetingSettings>;
    pre_schedule?: boolean;
  }
  
  export interface ZoomMeetingResponse {
    uuid: string;
    id: number;
    host_id: string;
    host_email: string;
    topic: string;
    type: number;
    status: string;
    start_time: string;
    duration: number;
    timezone: string;
    agenda: string;
    created_at: string;
    start_url: string;
    join_url: string;
    password: string;
    h323_password: string;
    pstn_password: string;
    encrypted_password: string;
    settings: ZoomMeetingSettings;
    pre_schedule: boolean;
  }
  
  export interface ZoomConnectionStatus {
    connected: boolean;
    email?: string;
    name?: string;
    accountId?: string;
    connectedAt?: string;
  }