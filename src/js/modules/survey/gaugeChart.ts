// gaugeChart.ts
import Chart from 'chart.js/auto';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
gsap.registerPlugin(ScrollTrigger);

export interface GaugeChartOptions {
  containerId: string;
  statKey: keyof Respondent;
  statValues: string[];
  labelTemplate: string;
  fillColor?: string;
  trackColor?: string;
  size?: number;
}

export class GaugeChart {
  private options: Required<GaugeChartOptions>;
  private chart: Chart<'doughnut'> | null = null;
  private needleEl: HTMLElement | null = null;
  private labelEl: HTMLElement | null = null;
  private currentPct = 0;
  private container: HTMLElement | null = null;
  private pendingRespondents: Respondent[] | null = null;

  constructor(options: GaugeChartOptions) {
    this.options = {
      fillColor: '#FF924C',
      trackColor: '#E2E2E2',
      size: 320,
      ...options,
    };
  }

  mount(respondents?: Respondent[]): void {
    const container = document.getElementById(this.options.containerId);
    if (!container) {
      console.warn(`[GaugeChart] No element found with id "${this.options.containerId}"`);
      return;
    }

    this.container = container;
    container.innerHTML = '';
    container.className = 'gauge-chart';

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'gauge-chart__canvas-wrap';
    canvasWrap.style.width = `100%`;
    canvasWrap.style.height = `auto`;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Gauge chart');
    canvasWrap.appendChild(canvas);

    // ── Needle (plain HTML shapes) ───────────────────────────────────────────
    const needle = document.createElement('div');
    needle.className = 'gauge-chart__needle';
    canvasWrap.appendChild(needle);

    const pivot = document.createElement('div');
    pivot.className = 'gauge-chart__pivot';
    canvasWrap.appendChild(pivot);

    this.needleEl = needle;

    container.appendChild(canvasWrap);

    const endpoints = document.createElement('div');
    endpoints.className = 'gauge-chart__endpoints';
    endpoints.style.width = '100%';
    endpoints.innerHTML = `
      <span class="gauge-chart__endpoint-label">0%</span>
      <span class="gauge-chart__endpoint-label">100%</span>
    `;
    container.appendChild(endpoints);

    this.labelEl = document.createElement('p');
    this.labelEl.className = 'gauge-chart__label';
    this.labelEl.textContent = this.options.labelTemplate.replace('{pct}', '0');
    container.appendChild(this.labelEl);

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: [0, 100],
            backgroundColor: [this.options.fillColor, this.options.trackColor],
            borderWidth: 0,
            borderRadius: 0,
            circumference: 180,
            rotation: 270,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: { duration: 800, easing: 'easeInOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
    });

    ScrollTrigger.create({
      trigger: container,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        container.dataset.seen = 'true';
        if (this.pendingRespondents) {
          this.applyUpdate(this.pendingRespondents);
          this.pendingRespondents = null;
        }
      },
    });

    if (respondents) this.update(respondents);
  }

  update(respondents: Respondent[]): void {
    if (!this.chart) {
      console.warn('[GaugeChart] update() called before mount()');
      return;
    }

    if (this.container?.dataset.seen === 'true') {
      this.applyUpdate(respondents);
    } else {
      this.pendingRespondents = respondents;
    }
  }

  private applyUpdate(respondents: Respondent[]): void {
    if (!this.chart) return;
    const total = respondents.length;
    const count = respondents.filter((r) => {
      const val = r[this.options.statKey];
      if (Array.isArray(val)) {
        return this.options.statValues.some((sv) => (val as string[]).includes(sv));
      }
      return typeof val === 'string' && this.options.statValues.includes(val);
    }).length;

    const targetPct = total > 0 ? Math.round((count / total) * 100) : 0;

    this.chart.data.datasets[0].data = [targetPct, 100 - targetPct];
    this.chart.update('active');

    if (this.needleEl) {
      // -90deg = pointing left (0%), +90deg = pointing right (100%)
      const angle = -90 + (targetPct / 100) * 180;
      this.needleEl.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    }

    const startPct = this.currentPct;
    this.currentPct = targetPct;
    this.animateNumber(startPct, targetPct, (v) => {
      if (this.labelEl) {
        this.labelEl.textContent = this.options.labelTemplate.replace('{pct}', String(v));
      }
    });
  }

  private animateNumber(from: number, to: number, onStep: (v: number) => void): void {
    const duration = 800;
    const steps = 60;
    const stepSize = (to - from) / steps;
    let current = from;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += stepSize;
      onStep(Math.round(current));
      if (step >= steps) {
        clearInterval(interval);
        onStep(to);
      }
    }, duration / steps);
  }

  destroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }
}
