import { useEffect } from 'react';

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloaded'
  | 'error'
  | 'up-to-date';

interface Props {
  onStatus: (status: UpdateStatus) => void;
  onErro: (msg: string) => void;
}

export default function UpdateNotifier({ onStatus, onErro }: Props) {
  useEffect(() => {
    window.electronAPI.onUpdateAvailable(() => onStatus('available'));
    window.electronAPI.onUpdateNotAvailable(() => onStatus('up-to-date'));
    window.electronAPI.onUpdateDownloaded(() => onStatus('downloaded'));
    window.electronAPI.onUpdateError((msg) => {
      onErro(msg);
      onStatus('error');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
