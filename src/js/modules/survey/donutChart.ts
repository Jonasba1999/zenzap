// donutChart.ts
import Chart from 'chart.js/auto';

export interface DonutSegment {
  label: string;
  statKey: keyof Respondent;
  statValues: string[];
  color: string;
}

export interface DonutChartConfig {
  containerId: string;
  title: string;
  titleTemplate?: string;
  titleStatKey?: keyof Respondent;
  titleStatValues?: string[];
  segments: DonutSegment[];
  cutout?: number;
  centerIcon?: string;
  centerIconSize?: number;
  legendPosition?: 'left' | 'right';
  /** Extra class appended to the root wrapper for per-instance styling overrides */
  variantClass?: string;
}

export class DonutChart {
  private config: Required<Omit<DonutChartConfig, 'variantClass'>> & { variantClass?: string };
  private chart: Chart<'doughnut'> | null = null;
  private pctEls: HTMLElement[] = [];
  private titleEl: HTMLElement | null = null;

  constructor(config: DonutChartConfig) {
    this.config = {
      cutout: 0.35,
      legendPosition: 'right',
      centerIconSize: 64,
      ...config,
    } as Required<Omit<DonutChartConfig, 'variantClass'>> & { variantClass?: string };
  }

  mount(respondents?: Respondent[]): void {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      console.warn(`[DonutChart] No element found with id "${this.config.containerId}"`);
      return;
    }

    container.innerHTML = '';
    container.classList.add('donut-chart');
    container.classList.toggle('donut-chart--legend-left', this.config.legendPosition === 'left');
    if (this.config.variantClass) container.classList.add(this.config.variantClass);

    // ── Canvas side ───────────────────────────────────────────────────────────
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'donut-chart__canvas-wrap';

    const canvas = document.createElement('canvas');
    canvas.className = 'donut-chart__canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Donut chart: ${this.config.title}`);
    canvasWrap.appendChild(canvas);

    // ── Center icon overlay ──────────────────────────────────────────────────
    if (this.config.centerIcon) {
      const iconWrap = document.createElement('div');
      iconWrap.className = 'donut-chart__center-icon';
      iconWrap.innerHTML = this.config.centerIcon.trim();
      const iconSvg = iconWrap.querySelector('svg');
      if (iconSvg) {
        iconSvg.setAttribute('width', String(this.config.centerIconSize));
        iconSvg.setAttribute('height', String(this.config.centerIconSize));
      }

      canvasWrap.appendChild(iconWrap);
    }

    container.appendChild(canvasWrap);

    // ── Legend side ───────────────────────────────────────────────────────────
    const legend = document.createElement('div');
    legend.className = 'donut-chart__legend';

    const titleEl = document.createElement('h3');
    titleEl.className = 'donut-chart__title';
    titleEl.textContent = this.config.titleTemplate
      ? this.config.titleTemplate.replace('{pct}', '0')
      : this.config.title;
    this.titleEl = titleEl;
    legend.appendChild(titleEl);

    this.pctEls = [];

    this.config.segments.forEach((seg) => {
      const row = document.createElement('div');
      row.className = 'donut-chart__row';

      const labelEl = document.createElement('span');
      labelEl.className = 'donut-chart__label';
      labelEl.style.setProperty('--segment-color', seg.color);
      labelEl.textContent = seg.label;

      const pctEl = document.createElement('span');
      pctEl.className = 'donut-chart__pct';
      pctEl.textContent = '0%';
      this.pctEls.push(pctEl);

      row.appendChild(labelEl);
      row.appendChild(pctEl);
      legend.appendChild(row);
    });

    container.appendChild(legend);

    // ── Chart.js init ─────────────────────────────────────────────────────────
    const cutoutPct = `${Math.round((1 - this.config.cutout) * 100)}%`;

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.config.segments.map((s) => s.label),
        datasets: [
          {
            data: new Array(this.config.segments.length).fill(0),
            backgroundColor: this.config.segments.map((s) => s.color),
            borderWidth: 0,
            borderRadius: 0,
            spacing: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: cutoutPct,
        animation: { duration: 800, easing: 'easeInOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
    });

    if (respondents) this.update(respondents);
  }

  update(respondents: Respondent[]): void {
    if (!this.chart) {
      console.warn('[DonutChart] update() called before mount()');
      return;
    }

    const total = respondents.length;

    const counts = this.config.segments.map(
      (seg) =>
        respondents.filter((r) => {
          const val = r[seg.statKey];
          if (Array.isArray(val)) {
            return seg.statValues.some((sv) => (val as string[]).includes(sv));
          }
          return typeof val === 'string' && seg.statValues.includes(val);
        }).length
    );

    const pcts = counts.map((c) => (total > 0 ? Math.round((c / total) * 100) : 0));

    this.chart.data.datasets[0].data = counts;
    this.chart.update('active');

    const duration = 800;
    const steps = 60;
    const intervalMs = duration / steps;

    const legendStartVals = this.pctEls.map((el) => parseInt(el.textContent ?? '0', 10) || 0);

    let titlePct = 0;
    let titleStart = 0;

    if (this.config.titleTemplate && this.config.titleStatKey) {
      const titleCount = respondents.filter((r) => {
        const val = r[this.config.titleStatKey!];
        const matchVals = this.config.titleStatValues ?? [];
        if (Array.isArray(val)) {
          return matchVals.some((sv) => (val as string[]).includes(sv));
        }
        return typeof val === 'string' && matchVals.includes(val);
      }).length;

      titlePct = total > 0 ? Math.round((titleCount / total) * 100) : 0;
      titleStart = parseInt(this.titleEl?.textContent?.match(/\d+/)?.[0] ?? '0', 10);
    }

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      pcts.forEach((targetPct, i) => {
        const current = Math.round(
          legendStartVals[i] + (targetPct - legendStartVals[i]) * progress
        );
        this.pctEls[i].textContent = `${current}%`;
      });

      if (this.config.titleTemplate && this.titleEl) {
        const current = Math.round(titleStart + (titlePct - titleStart) * progress);
        this.titleEl.textContent = this.config.titleTemplate.replace('{pct}', String(current));
      }

      if (step >= steps) {
        clearInterval(timer);
        pcts.forEach((p, i) => (this.pctEls[i].textContent = `${p}%`));
        if (this.config.titleTemplate && this.titleEl) {
          this.titleEl.textContent = this.config.titleTemplate.replace('{pct}', String(titlePct));
        }
      }
    }, intervalMs);
  }

  destroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }
}
