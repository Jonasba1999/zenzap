import surveyData from '../../data/surveyData.json';
import { BarColumnChart } from './barColumnChart';
import { DonutChart } from './donutChart';
import { GaugeChart } from './gaugeChart';
import { IconGrid } from './iconGrid';
import { ICONS } from './icons';
import { renderMessagingApps } from './messagingApps';
import { RingChart } from './ringChart';
import { renderWorkMessageFrequency } from './workMessageFrequency';
const donutCharts: DonutChart[] = [];

function mountDonutCharts(): void {
  donutCharts.forEach((c) => c.destroy());
  donutCharts.length = 0;

  donutCharts.push(
    new DonutChart({
      containerId: 'chart-time-searching',
      variantClass: 'donut-chart--time-searching',
      titleTemplate: '{pct}% of workday spent searching for messages, files or info',
      titleStatKey: 'time_searching_chats',
      titleStatValues: [
        'More than 10% of my workday',
        '5–10% of my workday',
        'Less than 5% of my workday',
      ],
      segments: [
        {
          label: 'More than 10%',
          statKey: 'time_searching_chats',
          statValues: [
            '10–20% of my workday',
            '20–30% of my workday',
            'More than 30% of my workday',
          ],
          color: '#8A0B00',
        },
        {
          label: '5–10%',
          statKey: 'time_searching_chats',
          statValues: ['5–10% of my workday'],
          color: '#007AFF',
        },
        {
          label: 'Less than 5%',
          statKey: 'time_searching_chats',
          statValues: ['Less than 5% of my workday'],
          color: '#ECBD00',
        },
      ],
    }),

    new DonutChart({
      containerId: 'chart-group-chats-offboarding',
      variantClass: 'donut-chart--group-chats-offboarding',
      title: 'How many work related group chats you are in?',
      centerIconSize: 90,
      legendPosition: 'left',
      cutout: 0.35,
      segments: [
        {
          label: '0 chats',
          statKey: 'work_group_chats_count',
          statValues: ['0'],
          color: '#c2185b',
        },
        {
          label: '1–3 chats',
          statKey: 'work_group_chats_count',
          statValues: ['1–3'],
          color: '#2a78d6',
        },
        {
          label: '4–7 chats',
          statKey: 'work_group_chats_count',
          statValues: ['4–7'],
          color: '#eb6834',
        },
        {
          label: '8–14 chats',
          statKey: 'work_group_chats_count',
          statValues: ['8–14'],
          color: '#eda100',
        },
        {
          label: '15+ chats',
          statKey: 'work_group_chats_count',
          statValues: ['15+'],
          color: '#8B1A1A',
        },
      ],
    }),

    new DonutChart({
      containerId: 'chart-old-messages-access',
      variantClass: 'donut-chart--privacy-old-messages',
      centerIconSize: 80,
      legendPosition: 'left',
      cutout: 0.35,
      segments: [
        {
          label: 'Yes, I still have access to group chats and messages',
          statKey: 'old_messages_stored',
          statValues: ['Yes - I still have access to the group chats and new messages'],
          color: '#8A0B00',
        },
        {
          label:
            'Yes, I can access the chat history from when I was part of the group (until I left)',
          statKey: 'old_messages_stored',
          statValues: [
            'Yes - I can access the chat history from when I was part of the group (until I left)',
          ],
          color: '#CC3399',
        },
        { label: 'No', statKey: 'old_messages_stored', statValues: ['No'], color: '#007AFF' },
        {
          label: 'Not sure',
          statKey: 'old_messages_stored',
          statValues: ['Not sure'],
          color: '#FF924C',
        },
      ],
    })
  );

  // Mount with current data immediately
  const respondents = getFilteredRespondents();
  donutCharts.forEach((c) => c.mount(respondents));
}

const grids: IconGrid[] = [];

function mountIconGrids(): void {
  grids.forEach((g) => g.destroy());
  grids.length = 0;

  grids.push(
    // Unwanted work messages
    new IconGrid({
      containerId: 'grid-harassment-unwanted',
      svgIcon: ICONS.messageAlert,
      activeColor: '#007AFF',
      inactiveColor: '#DCDCDC',
      statKey: 'group_chat_experiences',
      statValues: ['Unwanted work messages outside work hours'],
      labelTemplate: 'Unwanted work messages',
      layout: 'inline',
      dotsPerRow: 25,
      dotSize: 28,
    }),

    // Contact after leaving
    new IconGrid({
      containerId: 'grid-harassment-contact-after',
      svgIcon: ICONS.personWalking,
      activeColor: '#FF924C',
      inactiveColor: '#DCDCDC',
      statKey: 'group_chat_experiences',
      statValues: ['Being contacted after leaving the company'],
      labelTemplate: 'Contact after leaving',
      layout: 'inline',
      dotsPerRow: 25,
      dotSize: 28,
    }),

    // Romantic advances
    new IconGrid({
      containerId: 'grid-harassment-romantic',
      svgIcon: ICONS.heart,
      activeColor: '#CC3399',
      inactiveColor: '#DCDCDC',
      statKey: 'group_chat_experiences',
      statValues: ['Unwanted personal or romantic advances'],
      labelTemplate: 'Romantic advances',
      layout: 'inline',
      dotsPerRow: 25,
      dotSize: 28,
    }),

    // Persistent contact
    new IconGrid({
      containerId: 'grid-harassment-persistent',
      svgIcon: ICONS.phone,
      activeColor: '#D63426',
      inactiveColor: '#DCDCDC',
      statKey: 'group_chat_experiences',
      statValues: ['Persistent contact after asking them to stop'],
      labelTemplate: 'Persistent contact',
      layout: 'inline',
      dotsPerRow: 25,
      dotSize: 28,
    }),

    // Harassment / intimidation
    new IconGrid({
      containerId: 'grid-harassment-intimidation',
      svgIcon: ICONS.triangle,
      activeColor: '#8B1A1A',
      inactiveColor: '#DCDCDC',
      statKey: 'group_chat_experiences',
      statValues: ['Harassing or intimidating messages'],
      labelTemplate: 'Harassment / intimidation',
      layout: 'inline',
      dotsPerRow: 25,
      dotSize: 28,
    }),

    // Section: How Often Do Work Messages Arrive After Hours?

    new IconGrid({
      containerId: 'grid-personal-time',
      svgIcon: ICONS.messageAlert,
      activeColor: '#007AFF',
      inactiveColor: '#2c2c2a',
      statKey: 'personal_time_interrupted',
      statValues: ['Sometimes', 'Often', 'Very frequently'],
      labelTemplate: '{pct}% say after-hours messages interrupted their personal time',
      dotsPerRow: 25,
      dotSize: 40,
    }),
    new IconGrid({
      containerId: 'grid-work-life-balance',
      svgIcon: ICONS.moon,
      activeColor: '#ECBD00',
      inactiveColor: '#2c2c2a',
      statKey: 'work_life_balance_impact',
      statValues: [
        'Made it significantly harder to disconnect',
        'Made it somewhat harder to disconnect',
        'Made me feel constantly “on call” and that it is impossible to disconnect',
      ],
      labelTemplate: '{pct}% say that after-hours messages have affected their work-life balance',
      dotsPerRow: 25,
      dotSize: 40,
    }),
    new IconGrid({
      containerId: 'grid-wellbeing',
      svgIcon: ICONS.sadFace,
      activeColor: '#D73426',
      inactiveColor: '#2c2c2a',
      statKey: 'wellbeing_affected',
      statValues: ['Yes, very much', 'Yes, a little'],
      labelTemplate: '{pct}% say after-hours messages hurt their wellbeing',
      dotsPerRow: 25,
      dotSize: 40,
    }),

    new IconGrid({
      containerId: 'grid-ex-employees',
      svgIcon: ICONS.message,
      activeColor: '#007AFF',
      inactiveColor: '#DCDCDC',
      statKey: 'former_employees_in_chats',
      statValues: ['Yes'],
      labelTemplate: '{pct}% say they are in work group chats that still include ex-employees',
      dotsPerRow: 25,
      dotSize: 40,
    }),

    new IconGrid({
      containerId: 'grid-remained-after-leaving',
      svgIcon: ICONS.message,
      activeColor: '#FF924C',
      inactiveColor: '#DCDCDC',
      statKey: 'remained_after_leaving',
      statValues: ['Yes'],
      labelTemplate: '{pct}% say they are still in a work group chat from a previous employer',
      dotsPerRow: 25,
      dotSize: 40,
    }),

    new IconGrid({
      containerId: 'grid-messages-after-leaving',
      svgIcon: ICONS.message,
      activeColor: '#ECBD00',
      inactiveColor: '#DCDCDC',
      statKey: 'messages_after_leaving',
      statValues: ['Yes'],
      labelTemplate:
        "{pct}% say they are still actively receiving new messages from a previous employer's chat",
      dotsPerRow: 25,
      dotSize: 40,
    }),

    new IconGrid({
      containerId: 'grid-feel-unbothered',
      svgIcon: ICONS.faceSmile,
      activeColor: '#007AFF',
      inactiveColor: '#DCDCDC',
      statKey: 'search_feelings',
      statValues: ["It doesn't bother me"],
      labelTemplate: 'Unbothered',
      layout: 'inline',
      dotsPerRow: 25,
      dotSize: 28,
    }),
    new IconGrid({
      containerId: 'grid-feel-frustrated',
      svgIcon: ICONS.faceAngry,
      activeColor: '#8A0B00',
      inactiveColor: '#DCDCDC',
      statKey: 'search_feelings',
      statValues: ['Frustrated and stressed'],
      labelTemplate: 'Frustrated',
      layout: 'inline',
      dotsPerRow: 25,
      dotSize: 28,
    }),
    new IconGrid({
      containerId: 'grid-feel-anxious',
      svgIcon: ICONS.triangle,
      activeColor: '#FF924C',
      inactiveColor: '#DCDCDC',
      statKey: 'search_feelings',
      statValues: ["Anxious I'll miss something important"],
      labelTemplate: 'Anxious',
      layout: 'inline',
      dotsPerRow: 25,
      dotSize: 28,
    }),
    new IconGrid({
      containerId: 'grid-feel-inefficient',
      svgIcon: ICONS.clock,
      activeColor: '#ECBD00',
      inactiveColor: '#DCDCDC',
      statKey: 'search_feelings',
      statValues: ["Like I'm wasting my life"],
      labelTemplate: 'Inefficient',
      layout: 'inline',
      dotsPerRow: 25,
      dotSize: 28,
    }),
    new IconGrid({
      containerId: 'grid-feel-embarrassed',
      svgIcon: ICONS.faceEmbarrassed,
      activeColor: '#D63426',
      inactiveColor: '#DCDCDC',
      statKey: 'search_feelings',
      statValues: ['Embarrassed to ask again'],
      labelTemplate: 'Embarrassed',
      layout: 'inline',
      dotsPerRow: 25,
      dotSize: 28,
    }),
    new IconGrid({
      containerId: 'grid-feel-helpless',
      svgIcon: ICONS.personFalling,
      activeColor: '#5393D7',
      inactiveColor: '#DCDCDC',
      statKey: 'search_feelings',
      statValues: ['Helpless and out of control'],
      labelTemplate: 'Helpless',
      layout: 'inline',
      dotsPerRow: 25,
      dotSize: 28,
    }),
    new IconGrid({
      containerId: 'grid-feel-tension',
      svgIcon: ICONS.heartCrack,
      activeColor: '#990066',
      inactiveColor: '#DCDCDC',
      statKey: 'search_feelings',
      statValues: ['A physical ache - like actual tension in my body'],
      labelTemplate: 'Physical tension',
      layout: 'inline',
      dotsPerRow: 25,
      dotSize: 28,
    }),
    // Section: Group Chats and Offboarding

    new IconGrid({
      containerId: 'grid-ex-employees',
      svgIcon: ICONS.message,
      activeColor: '#007AFF',
      inactiveColor: '#DCDCDC',
      statKey: 'former_employees_in_chats',
      statValues: ['Yes, in one group', 'Yes, in multiple groups'],
      labelTemplate: '{pct}% say they are in work group chats that still include ex-employees',
      layout: 'below',
      dotsPerRow: 25,
      dotSize: 22,
    }),

    new IconGrid({
      containerId: 'grid-remained-after-leaving',
      svgIcon: ICONS.message,
      activeColor: '#FF924C',
      inactiveColor: '#DCDCDC',
      statKey: 'remained_after_leaving',
      statValues: ['Yes'],
      labelTemplate: '{pct}% say they are still in a work group chat from a previous employer',
      layout: 'below',
      dotsPerRow: 25,
      dotSize: 22,
    }),

    new IconGrid({
      containerId: 'grid-messages-after-leaving',
      svgIcon: ICONS.message,
      activeColor: '#ECBD00',
      inactiveColor: '#DCDCDC',
      statKey: 'messages_after_leaving',
      statValues: ['Yes, for a few days', 'Yes, for weeks/months'],
      labelTemplate:
        "{pct}% say they are still actively receiving new messages from a previous employer's chat",
      layout: 'below',
      dotsPerRow: 25,
      dotSize: 22,
    })
    // Section: Personal Messaging Apps Used for Work

    // new IconGrid({
    //   containerId: 'grid-app-imessage',
    //   svgIcon: ICONS.messageBubble,
    //   activeColor: '#1baf7a',
    //   inactiveColor: '#2c2c2a',
    //   statKey: 'messaging_apps',
    //   statValues: ['iMessage / SMS'],
    //   labelTemplate: 'iMessage / SMS',
    //   layout: 'below',
    //   orientation: 'vertical',
    //   dotsPerRow: 5,
    //   totalDots: 65,
    //   dotSize: 22,
    //   gap: 4,
    // }),
    // new IconGrid({
    //   containerId: 'grid-app-whatsapp',
    //   svgIcon: ICONS.whatsapp,
    //   activeColor: '#1baf7a',
    //   inactiveColor: '#2c2c2a',
    //   statKey: 'messaging_apps',
    //   statValues: ['WhatsApp'],
    //   labelTemplate: 'WhatsApp',
    //   layout: 'below',
    //   orientation: 'vertical',
    //   dotsPerRow: 5,
    //   totalDots: 65,
    //   dotSize: 22,
    //   gap: 4,
    // }),
    // new IconGrid({
    //   containerId: 'grid-app-messenger',
    //   svgIcon: ICONS.messenger,
    //   activeColor: '#2a78d6',
    //   inactiveColor: '#2c2c2a',
    //   statKey: 'messaging_apps',
    //   statValues: ['Facebook Messenger'],
    //   labelTemplate: 'Facebook Messenger',
    //   layout: 'below',
    //   orientation: 'vertical',
    //   dotsPerRow: 5,
    //   totalDots: 65,
    //   dotSize: 22,
    //   gap: 4,
    // }),
    // new IconGrid({
    //   containerId: 'grid-app-telegram',
    //   svgIcon: ICONS.telegram,
    //   activeColor: '#37b6e9',
    //   inactiveColor: '#2c2c2a',
    //   statKey: 'messaging_apps',
    //   statValues: ['Telegram'],
    //   labelTemplate: 'Telegram',
    //   layout: 'below',
    //   orientation: 'vertical',
    //   dotsPerRow: 5,
    //   totalDots: 65,
    //   dotSize: 22,
    //   gap: 4,
    // }),
    // new IconGrid({
    //   containerId: 'grid-app-signal',
    //   svgIcon: ICONS.signal,
    //   activeColor: '#534AB7',
    //   inactiveColor: '#2c2c2a',
    //   statKey: 'messaging_apps',
    //   statValues: ['Signal'],
    //   labelTemplate: 'Signal',
    //   layout: 'below',
    //   orientation: 'vertical',
    //   dotsPerRow: 5,
    //   totalDots: 65,
    //   dotSize: 22,
    //   gap: 4,
    // }),
    // new IconGrid({
    //   containerId: 'grid-app-discord',
    //   svgIcon: ICONS.discord,
    //   activeColor: '#7f77dd',
    //   inactiveColor: '#2c2c2a',
    //   statKey: 'messaging_apps',
    //   statValues: ['Discord'],
    //   labelTemplate: 'Discord',
    //   layout: 'below',
    //   orientation: 'vertical',
    //   dotsPerRow: 5,
    //   totalDots: 65,
    //   dotSize: 22,
    //   gap: 4,
    // })
  );

  grids.forEach((g) => g.mount());
}

const barCharts: BarColumnChart[] = [];

function mountBarCharts(): void {
  barCharts.length = 0;

  barCharts.push(
    new BarColumnChart({
      containerId: 'chart-group-chat-fate',
      trackHeight: 444,
      trackWidth: 144,
      columns: [
        {
          statKey: 'group_chat_after_leaving',
          statValues: ['I left immediately'],
          label: 'I left immediately',
          color: '#007AFF',
          icon: ICONS.eyeClosed,
        },
        {
          statKey: 'group_chat_after_leaving',
          statValues: ['I was removed within days'],
          label: 'I was removed within days',
          color: '#ECBD00',
          icon: ICONS.eyeOpen,
        },
        {
          statKey: 'group_chat_after_leaving',
          statValues: ['I stayed in them for weeks/months'],
          label: 'I stayed in them for weeks/months',
          color: '#FF924C',
          icon: ICONS.eyeOpen,
        },
        {
          statKey: 'group_chat_after_leaving',
          statValues: ['I’m still in part of old job group chats'],
          label: "I'm still in part of old work group chats",
          color: '#8A0B00',
          icon: ICONS.eyeOpen,
        },
      ],
    })
  );

  const respondents = getFilteredRespondents();
  barCharts.forEach((c) => c.mount(respondents));
}

const ringCharts: RingChart[] = [];

function mountRingCharts(): void {
  ringCharts.length = 0;

  ringCharts.push(
    new RingChart({
      containerId: 'ring-privacy-consent',
      size: 280,
      strokeWidth: 14,
      rings: [
        {
          statKey: 'number_shared_without_consent',
          statValues: ['Yes'],
          color: '#c0392b',
          radius: 130,
        },
        {
          statKey: 'permission_asked',
          statValues: ['No, it was shared without asking'],
          color: '#eda100',
          radius: 110,
        },
      ],
    }),
    new RingChart({
      containerId: 'ring-always-on',
      size: 280,
      strokeWidth: 14,
      centerIcon: ICONS.clockSleep,
      centerIconSize: 80,
      trackColor: 'rgba(255, 255, 255, 0.2)',
      rings: [
        {
          statKey: 'work_messages_frequency',
          statValues: [
            'Very frequently (multiple times a day)',
            'Often (daily)',
            'Sometimes (a few times a week)',
            'Rarely (a few times a month)',
          ],

          color: '#c0392b',
          radius: 130,
        },
        {
          statKey: 'expected_to_respond',
          statValues: ['Agree', 'Strongly agree'],
          color: '#eda100',
          radius: 90,
        },
      ],
    })
  );

  const respondents = getFilteredRespondents();
  ringCharts.forEach((c) => c.mount(respondents));
}

const gaugeCharts: GaugeChart[] = [];

function mountGaugeCharts(): void {
  if (gaugeCharts.length > 0) {
    gaugeCharts.forEach((c) => c.destroy());
  }

  gaugeCharts.length = 0;

  gaugeCharts.push(
    new GaugeChart({
      containerId: 'gauge-missed-message',
      statKey: 'missed_important_message',
      statValues: ['Yes'],
      labelTemplate:
        '{pct}% have missed an important work message because it was buried in personal conversations',
    })
  );

  const respondents = getFilteredRespondents();
  gaugeCharts.forEach((c) => c.mount(respondents));
}

// ─── Types ────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    FsSelectCustom?: {
      init: (el: HTMLElement) => void;
      destroy?: (el: HTMLElement) => void;
    };
  }
}

type Respondent = (typeof surveyData.respondents)[number];
type FilterKey = keyof typeof surveyData.filter_options;

interface ActiveFilters {
  age: string | null;
  gender: string | null;
  employment_type: string | null;
  role_level: string | null;
  industry: string | null;
}

const SELECT_ID_TO_KEY: Record<string, FilterKey> = {
  age: 'age',
  gender: 'gender',
  'employment-type': 'employment_type',
  'role-level': 'role_level',
  industry: 'industry',
};

// ─── State ────────────────────────────────────────────────────────────────────

const activeFilters: ActiveFilters = {
  age: null,
  gender: null,
  employment_type: null,
  role_level: null,
  industry: null,
};

// ─── Filter Logic ─────────────────────────────────────────────────────────────

function getFilteredRespondents(): Respondent[] {
  return surveyData.respondents.filter((r) => {
    return (
      (!activeFilters.age || r.age === activeFilters.age) &&
      (!activeFilters.gender || r.gender === activeFilters.gender) &&
      (!activeFilters.employment_type || r.employment_type === activeFilters.employment_type) &&
      (!activeFilters.role_level || r.role_level === activeFilters.role_level) &&
      (!activeFilters.industry || r.industry === activeFilters.industry)
    );
  });
}

// Count values for a single-choice question key across filtered respondents
function countSingleChoice(
  respondents: Respondent[],
  key: keyof Respondent
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of respondents) {
    const val = r[key];
    if (val && typeof val === 'string') {
      counts[val] = (counts[val] ?? 0) + 1;
    }
  }
  return counts;
}

// Count values for multi-select question keys (arrays)
function countMultiSelect(
  respondents: Respondent[],
  key: keyof Respondent
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of respondents) {
    const arr = r[key];
    if (Array.isArray(arr)) {
      for (const val of arr as string[]) {
        counts[val] = (counts[val] ?? 0) + 1;
      }
    }
  }
  return counts;
}

// Compute percentage relative to total
function toPercent(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

// ─── DOM Helpers ──────────────────────────────────────────────────────────────

// Update a single stat element:
// <span data-stat="wellbeing_affected" data-stat-value="Yes, very much">34%</span>
function updateStatElements(respondents: Respondent[]): void {
  const total = respondents.length;

  document.querySelectorAll<HTMLElement>('[data-stat]').forEach((el) => {
    const key = el.dataset.stat as keyof Respondent;
    const rawValues = el.dataset.statValues ?? '';
    const matchValues = rawValues.split('|').map((v) => v.trim()); // ← changed from ','
    const template = el.dataset.statTemplate ?? '{pct}%';

    if (!key) return;

    const count = respondents.filter((r) => {
      const val = r[key];
      if (Array.isArray(val)) {
        return matchValues.some((mv) => (val as string[]).includes(mv));
      }
      return typeof val === 'string' && matchValues.includes(val);
    }).length;

    const targetPct = total > 0 ? Math.round((count / total) * 100) : 0;
    const currentPct = parseInt(el.dataset.currentPct ?? '0', 10) || 0;

    animateNumber(
      el,
      currentPct,
      targetPct,
      (v) => {
        el.textContent = template.replace('{pct}', String(v));
      },
      () => {
        el.dataset.currentPct = String(targetPct);
      }
    );
  });
}

// Update a bar / donut chart element:
// <div data-chart="work_messages_frequency" data-chart-type="bar|donut"></div>
// This writes data-* onto child [data-bar] / [data-segment] elements
// so your CSS can use attr() or you can drive animations from it.
function updateChartElements(respondents: Respondent[]): void {
  const total = respondents.length;

  document.querySelectorAll<HTMLElement>('[data-chart]').forEach((chart) => {
    const key = chart.dataset.chart as keyof Respondent;
    if (!key) return;

    const isMulti = Array.isArray(respondents[0]?.[key]);
    const counts = isMulti
      ? countMultiSelect(respondents, key)
      : countSingleChoice(respondents, key);

    // Update individual bar/segment children
    // e.g. <div data-bar-value="Yes" style="..."></div>
    chart.querySelectorAll<HTMLElement>('[data-bar-value]').forEach((bar) => {
      const val = bar.dataset.barValue!;
      const pct = toPercent(counts[val] ?? 0, total);
      bar.style.setProperty('--bar-pct', `${pct}%`);
      bar.setAttribute('aria-valuenow', String(pct));

      // Update any inner label
      const label = bar.querySelector<HTMLElement>('[data-bar-label]');
      if (label) label.textContent = `${pct}%`;
    });

    // Update donut segments (SVG stroke-dasharray pattern)
    chart.querySelectorAll<SVGCircleElement>('[data-segment-value]').forEach((seg) => {
      const val = seg.dataset.segmentValue!;
      const pct = toPercent(counts[val] ?? 0, total);
      const circumference = 2 * Math.PI * Number(seg.getAttribute('r') ?? 45);
      seg.style.strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
      seg.setAttribute('aria-valuenow', String(pct));
    });
  });
}

// Update total response count badge
// <span data-total-count></span>
function updateTotalCount(respondents: Respondent[]): void {
  document.querySelectorAll<HTMLElement>('[data-total-count]').forEach((el) => {
    el.textContent = respondents.length.toLocaleString();
  });
}

// ─── Dropdown Population ──────────────────────────────────────────────────────

function populateDropdowns(): void {
  (
    Object.entries(surveyData.filter_options) as [
      FilterKey,
      (typeof surveyData.filter_options)[FilterKey],
    ][]
  ).forEach(([key, filter]) => {
    const selectId = Object.entries(SELECT_ID_TO_KEY).find(([, v]) => v === key)?.[0];
    if (!selectId) return;

    const select = document.getElementById(selectId) as HTMLSelectElement | null;

    if (!select) {
      console.warn(`[survey] No <select> found for filter: "${key}"`);
      return;
    }

    // ── 1. Clear only the native <select> ────────────────────────────────────
    // Let Finsweet own the nav list entirely — do NOT touch .w-dropdown-list
    select.innerHTML = '';

    // ── 2. Rebuild native <option>s from JSON ─────────────────────────────────
    filter.options.forEach((opt, i) => {
      const option = document.createElement('option');
      option.value = opt.value ?? '';
      option.textContent = opt.label;
      if (i === 0) option.selected = true;
      select.appendChild(option);
    });

    // ── 3. Trigger change so Finsweet syncs its UI from the native select ─────
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

// ─── Event Wiring ─────────────────────────────────────────────────────────────

function bindFilterEvents(): void {
  // Listen on the custom Webflow nav links
  let isSyncingFromClick = false;

  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-filter-key]');
    if (!target) return;

    e.preventDefault();

    const key = target.dataset.filterKey as FilterKey;
    const value = target.dataset.filterValue ?? null;

    activeFilters[key] = value || null;

    const selectId = Object.entries(SELECT_ID_TO_KEY).find(([, v]) => v === key)?.[0];
    if (selectId) {
      const select = document.getElementById(selectId) as HTMLSelectElement | null;
      if (select) {
        isSyncingFromClick = true; // ← block the change listener below
        select.value = value ?? '';
        isSyncingFromClick = false;
      }
    }

    target
      .closest('.w-dropdown-list')
      ?.querySelectorAll<HTMLElement>('[data-filter-key]')
      .forEach((el) => {
        const isSelected = el === target;
        el.classList.toggle('w--current', isSelected);
        el.setAttribute('aria-selected', String(isSelected));
        el.tabIndex = isSelected ? 0 : -1;
      });

    const label = target
      .closest('.w-dropdown')
      ?.querySelector<HTMLElement>('[fs-selectcustom-element="label"]');
    if (label) {
      label.textContent = target.querySelector('div')?.textContent ?? '';
    }

    refreshData();
  });

  document.addEventListener('change', (e) => {
    if (isSyncingFromClick) return; // ← skip duplicate refresh triggered by our own click handler

    const select = e.target as HTMLSelectElement;
    const key = SELECT_ID_TO_KEY[select.id];
    if (!key) return;
    activeFilters[key] = select.value || null;
    refreshData();
  });

  // Clear all button: <button data-clear-filters>Clear all</button>
  document.querySelectorAll<HTMLElement>('[data-clear-filters]').forEach((btn) => {
    btn.addEventListener('click', () => {
      (Object.keys(activeFilters) as FilterKey[]).forEach((k) => {
        activeFilters[k] = null;
      });
      // Reset all native selects to first option
      Object.keys(SELECT_ID_TO_KEY).forEach((id) => {
        const s = document.getElementById(id) as HTMLSelectElement | null;
        if (s) s.selectedIndex = 0;
      });
      // Reset all custom nav links to first item
      document.querySelectorAll<HTMLElement>('[data-filter-key]').forEach((el) => {
        const isFirst = !el.previousElementSibling;
        el.classList.toggle('w--current', isFirst);
        el.setAttribute('aria-selected', String(isFirst));
        el.tabIndex = isFirst ? 0 : -1;
      });
      // Reset all labels to default text
      (
        Object.entries(surveyData.filter_options) as [
          FilterKey,
          (typeof surveyData.filter_options)[FilterKey],
        ][]
      ).forEach(([key, filter]) => {
        const selectId = Object.entries(SELECT_ID_TO_KEY).find(([, v]) => v === key)?.[0];
        if (!selectId) return;
        const label = document
          .getElementById(selectId)
          ?.closest('.w-dropdown')
          ?.querySelector<HTMLElement>('[fs-selectcustom-element="label"]');
        if (label) label.textContent = filter.default;
      });
      refreshData();
    });
  });
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

function refreshData(): void {
  const respondents = getFilteredRespondents();

  // Init Charts
  const freqCounts = countSingleChoice(respondents, 'work_messages_frequency');
  renderWorkMessageFrequency(freqCounts, respondents.length);

  const appCounts = countMultiSelect(respondents, 'messaging_apps');
  renderMessagingApps(appCounts, respondents.length);

  updateTotalCount(respondents);
  updateStatElements(respondents);
  updateChartElements(respondents);
  updateProgressStats(respondents);

  barCharts.forEach((c) => c.update(respondents));
  donutCharts.forEach((c) => c.update(respondents));
  ringCharts.forEach((c) => c.update(respondents));
  grids.forEach((g) => g.update(respondents));
  gaugeCharts.forEach((c) => c.update(respondents));
}

// Animate

const ANIMATION_DURATION_MS = 800;
const ANIMATION_STEPS = 60;

const activeAnimations = new WeakMap<HTMLElement, ReturnType<typeof setInterval>>();

function animateNumber(
  el: HTMLElement,
  from: number,
  to: number,
  onStep: (value: number) => void,
  onDone: () => void
): void {
  const existing = activeAnimations.get(el);
  if (existing) clearInterval(existing);

  const stepSize = (to - from) / ANIMATION_STEPS;
  const stepInterval = ANIMATION_DURATION_MS / ANIMATION_STEPS;
  let current = from;
  let step = 0;

  const interval = setInterval(() => {
    step++;
    current += stepSize;
    onStep(Math.round(current));

    if (step >= ANIMATION_STEPS) {
      clearInterval(interval);
      activeAnimations.delete(el);
      onStep(to);
      onDone();
    }
  }, stepInterval);

  activeAnimations.set(el, interval);
}

export function updateProgressStats(respondents: Respondent[]): void {
  const total = respondents.length;

  // ── Progress bars ─────────────────────────────────────────────────────────
  document.querySelectorAll<HTMLElement>('[data-progress]').forEach((el) => {
    const key = el.dataset.progress as keyof Respondent;
    const matchValues = (el.dataset.progressValues ?? '').split('|').map((v) => v.trim());

    if (!key || !matchValues.length) return;

    const count = respondents.filter((r) => {
      const val = r[key];
      return typeof val === 'string' && matchValues.includes(val);
    }).length;

    const targetPct = total > 0 ? Math.round((count / total) * 100) : 0;

    const fillEl = el.querySelector<HTMLElement>('[data-progress-fill]');

    if (fillEl) {
      // Trigger transition on next frame so CSS transition fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fillEl!.style.width = `${targetPct}%`;
        });
      });
    }
  });

  // ── Stat text with template ────────────────────────────────────────────────
  document.querySelectorAll<HTMLElement>('[data-stat][data-stat-template]').forEach((el) => {
    const key = el.dataset.stat as keyof Respondent;
    const matchValues = (el.dataset.statValues ?? '').split('|').map((v) => v.trim());
    const template = el.dataset.statTemplate ?? '{pct}%';

    if (!key) return;

    const count = respondents.filter((r) => {
      const val = r[key];
      return typeof val === 'string' && matchValues.includes(val);
    }).length;

    const targetPct = total > 0 ? Math.round((count / total) * 100) : 0;
    const currentPct = parseInt(el.dataset.currentPct ?? '0', 10) || 0;

    animateNumber(
      el,
      currentPct,
      targetPct,
      (v) => {
        el.textContent = template.replace('{pct}', String(v));
      },
      () => {
        el.dataset.currentPct = String(targetPct);
      }
    );
  });
}
// ─── Init ─────────────────────────────────────────────────────────────────────

export function surveyLanding(): void {
  if (!document.querySelector('.section_survey-filter')) return;
  populateDropdowns();
  bindFilterEvents();
  mountIconGrids();
  mountDonutCharts();
  mountBarCharts();
  mountRingCharts();
  mountGaugeCharts();
  refreshData(); // initial render with all data
}
