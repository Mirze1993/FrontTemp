import {CallStatus} from './CallStatus';

export enum ChatPageStatus {

  OfferSend='OfferSend',
  OfferComing='OfferComing',
  NotActive = 'NotActive',
  RejectByCaller = 'RejectByCaller',
  RejectByReceiver = 'RejectByReceiver',
  CallAccept = 'CallAccept',
  EndByCaller = 'CancelledByCaller',
  EndByReceiver = 'CancelledByReceiver',
  Timeout = 'TimeOut',
}
export function parseChatPageStatus(value: string): ChatPageStatus | null {
  const normalized = value.toUpperCase();

  return (Object.values(ChatPageStatus) as string[])
    .find(v => v.toUpperCase() === normalized) as ChatPageStatus || null;
}
