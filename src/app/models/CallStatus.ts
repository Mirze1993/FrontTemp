export enum CallStatus {

  Calling = 'Calling',
  NotActive = 'NotActive',
  RejectByCaller = 'RejectByCaller',
  RejectByReceiver = 'RejectByReceiver',
  CallAccept = 'CallAccept',
  EndByCaller = 'CancelledByCaller',
  EndByReceiver = 'CancelledByReceiver',
  Timeout = 'TimeOut'
}

export function parseCallStatus(value: string): CallStatus | null {
  const normalized = value.toUpperCase();

  return (Object.values(CallStatus) as string[])
    .find(v => v.toUpperCase() === normalized) as CallStatus || null;
}

export function getCallStatusText(status: CallStatus | string | null | undefined): string {
  if (!status) return '';

  const normalized = status.toString().toLowerCase();

  switch (normalized) {
    case CallStatus.Calling.toString().toLowerCase():
      return '📞 Zəng edilir';

    case CallStatus.RejectByCaller.toString().toLowerCase():
      return '❌ Zəng eden tərəf ləvğ etdi';
    case CallStatus.RejectByReceiver.toString().toLowerCase():
      return '❌ Zəng qəbul eden tərəf ləvğ etdi';

    case CallStatus.CallAccept.toString().toLowerCase():
      return '✅ Zəng qəbul edildi';

    case CallStatus.EndByCaller.toString().toLowerCase():
      return '🚫 Zəng eden tərəf sonlandırdı';

    case CallStatus.EndByReceiver.toString():
      return '🚫 Zəng qəbul eden tərəf sonlandırdı';

    case CallStatus.Timeout.toString().toLowerCase():
      return '⏱️ Zəng vaxtı bitdi';
    case CallStatus.NotActive.toString().toLowerCase():
      return '❌ Zəng vaxtı bitdi';

    default:
      return status.toString();
  }
}
