import { renderDotColumnGrid } from './dotColumnGrid';
import { ICONS } from './icons';

const COLS_CONFIG = [
  {
    key: 'Very frequently (multiple times a day)',
    label: 'Very frequently',
    sub: 'Multiple times per day',
    color: '#8A0B00',
    icon: ICONS.message,
  },
  { key: 'Often (daily)', label: 'Often', sub: 'Daily', color: '#D63426', icon: ICONS.message },
  {
    key: 'Sometimes (A few times a week)',
    label: 'Sometimes',
    sub: 'A few times per week',
    color: '#FF7B23',
    icon: ICONS.message,
  },
  {
    key: 'Rarely (A few times per month)',
    label: 'Rarely',
    sub: 'A few times per month',
    color: '#5393D7',
    icon: ICONS.message,
  },
  { key: 'Never', label: 'Never', sub: '', color: '#003E81', icon: ICONS.message },
];

export function renderWorkMessageFrequency(counts: Record<string, number>, total: number): void {
  renderDotColumnGrid(counts, total, {
    containerId: 'arriveAfterHoursGrid',
    columns: COLS_CONFIG,
    totalDots: 100,
    dotsPerCol: 20,
    dotSize: 22,
  });
}
