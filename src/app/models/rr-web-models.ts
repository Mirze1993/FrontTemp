import {eventWithTime} from '@rrweb/types';

export interface rrWebCreateSessionPayload {
  url: string;
  userAgent: string;
}



export interface rrWebEndSessionPayload {
  id: string;
  events: eventWithTime[];
}

export interface rrWebSessionSummary {
  id: string;
  sessionId: string;
  url: string;
  startedAt: string;
  endedAt?: string;
  eventCount: number;
}
