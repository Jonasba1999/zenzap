// barColumnChart.ts

export interface BarColumnConfig {
  statKey: keyof Respondent;
  statValues: string[];
  label: string;
  color: string;
  icon?: string; // SVG string, rendered at the fill boundary
}

export interface BarColumnChartOptions {
  containerId: string;
  columns: BarColumnConfig[];
  trackHeight?: number; // px, default 280
  trackWidth?: number; // px, default 140
  trackColor?: string; // default '#e0e0e0'
  iconSize?: number; // default 56
  iconInactiveColor?: string; // default '#a8a8a8'
}

export class BarColumnChart {
  private options: Required<BarColumnChartOptions>;
  private fillEls: HTMLElement[] = [];
  private pctEls: HTMLElement[] = [];
  private iconEls: HTMLElement[] = [];

  constructor(options: BarColumnChartOptions) {
    this.options = {
      trackHeight: 444,
      trackWidth: 144,
      trackColor: '#e0e0e0',
      iconSize: 56,
      iconInactiveColor: '#a8a8a8',
      ...options,
    };
  }

  mount(respondents?: Respondent[]): void {
    const container = document.getElementById(this.options.containerId);
    if (!container) {
      console.warn(`[BarColumnChart] No element found with id "${this.options.containerId}"`);
      return;
    }
    container.innerHTML = '';

    container.style.cssText = `
      display: flex;
      gap: 72px;
      align-items: flex-start;
    `;

    this.fillEls = [];
    this.pctEls = [];
    this.iconEls = [];

    const { trackHeight, trackWidth, trackColor, iconSize, iconInactiveColor } = this.options;

    this.options.columns.forEach((cfg) => {
      const colWrap = document.createElement('div');
      colWrap.style.cssText = `display: flex; flex-direction: column; align-items: center; gap: 16px;`;

      // ── Track ────────────────────────────────────────────────────────────
      const track = document.createElement('div');
      track.style.cssText = `
        position: relative;
        width: ${trackWidth}px;
        height: ${trackHeight}px;
        background: ${trackColor};
        overflow: hidden;
      `;

      // ── Fill (animates height from bottom) ─────────────────────────────────
      const fill = document.createElement('div');
      fill.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0%;
        background: ${cfg.color};
        transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      `;
      track.appendChild(fill);
      this.fillEls.push(fill);

      // ── Icon at fill boundary ────────────────────────────────────────────
      let iconHolder: HTMLElement | null = null;
      if (cfg.icon) {
        iconHolder = document.createElement('div');
        iconHolder.style.cssText = `
          position: absolute;
          left: 50%;
          bottom: 50%;
          transform: translate(-50%, 50%);
          transition: bottom 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          justify-content: center;
          align-items: center;
        `;
        iconHolder.innerHTML = cfg.icon.trim();
        const svg = iconHolder.querySelector('svg');
        if (svg) {
          svg.removeAttribute('fill');
          svg.setAttribute('width', String(iconSize));
          svg.setAttribute('height', String(iconSize));
          svg.style.color = iconInactiveColor;
          svg.querySelectorAll<SVGElement>('path, circle, rect, polygon, ellipse').forEach((el) => {
            if (el.getAttribute('fill') !== 'none') el.setAttribute('fill', iconInactiveColor);
          });
        }
        track.appendChild(iconHolder);
        this.iconEls.push(iconHolder);
      }

      colWrap.appendChild(track);

      // ── Pct ──────────────────────────────────────────────────────────────
      const pctEl = document.createElement('div');
      pctEl.style.cssText = `font-size: 24px; font-weight: 500; color: ${cfg.color};`;
      pctEl.textContent = '0%';
      colWrap.appendChild(pctEl);
      this.pctEls.push(pctEl);

      // ── Label ────────────────────────────────────────────────────────────
      const labelEl = document.createElement('div');
      labelEl.style.cssText = `max-width: ${trackWidth}px;`;
      labelEl.className = 'chart-col-label';
      labelEl.textContent = cfg.label;
      colWrap.appendChild(labelEl);

      container.appendChild(colWrap);
    });

    if (respondents) this.update(respondents);
  }

  update(respondents: Respondent[]): void {
    const total = respondents.length;

    this.options.columns.forEach((cfg, i) => {
      const count = respondents.filter((r) => {
        const val = r[cfg.statKey];
        if (Array.isArray(val)) {
          return cfg.statValues.some((sv) => (val as string[]).includes(sv));
        }
        return typeof val === 'string' && cfg.statValues.includes(val);
      }).length;

      const targetPct = total > 0 ? Math.round((count / total) * 100) : 0;

      // Animate fill height
      this.fillEls[i].style.height = `${targetPct}%`;

      // Animate pct number
      const startPct = parseInt(this.pctEls[i].textContent ?? '0', 10) || 0;
      this.animateNumber(startPct, targetPct, (v) => {
        this.pctEls[i].textContent = `${v}%`;
      });
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
    // No timers held outside animateNumber's local interval — nothing persistent to clean up
  }
}
