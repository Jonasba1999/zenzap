import { renderDotColumnGrid } from './dotColumnGrid';
import { ICONS } from './icons';

const APP_COLUMNS = [
  { key: 'iMessage / SMS', label: 'iMessage / SMS', color: '#33C659', icon: ICONS.messageBubble },
  { key: 'WhatsApp', label: 'WhatsApp', color: '#299E47', icon: ICONS.whatsapp },
  {
    key: 'Facebook Messenger',
    label: 'Facebook Messenger',
    color: '#007AFF',
    icon: ICONS.messenger,
  },
  { key: 'Telegram', label: 'Telegram', color: '#26A3E1', icon: ICONS.telegram },
  { key: 'Signal', label: 'Signal', color: '#3B45FD', icon: ICONS.signal },
  { key: 'Discord', label: 'Discord', color: '#5865F2', icon: ICONS.discord },
];

export function renderMessagingApps(counts: Record<string, number>, total: number): void {
  renderDotColumnGrid(counts, total, {
    containerId: 'messagingAppsGrid',
    columns: APP_COLUMNS,
    inactiveColor: '#DCDCDC',
    totalDots: 100,
    dotsPerCol: 20,
    dotSize: 22,
  });
}
