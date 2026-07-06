import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
gsap.registerPlugin(ScrollTrigger);

export interface RingConfig {
  statKey: keyof Respondent;
  statValues: string[];
  color: string;
  /** Outer radius for this ring — outer ring should be larger */
  radius: number;
}

export interface RingChartOptions {
  containerId: string;
  rings: RingConfig[]; // ordered outer → inner
  centerIcon?: string; // SVG string, rendered at center
  centerIconSize?: number; // default 64
  trackColor?: string; // default '#e0e0e0'
  strokeWidth?: number; // default 14
  size?: number; // svg viewbox size, default 280
  startAngle?: number; // degrees, default -90 (top), arcs grow clockwise from here
}

export class RingChart {
  private options: Required<RingChartOptions>;
  private arcEls: SVGPathElement[] = [];
  private container: HTMLElement | null = null;
  private pendingRespondents: Respondent[] | null = null;

  constructor(options: RingChartOptions) {
    this.options = {
      centerIcon: '',
      centerIconSize: 64,
      trackColor: '#e0e0e0',
      strokeWidth: 14,
      size: 280,
      startAngle: -90,
      ...options,
    };
  }

  mount(respondents?: Respondent[]): void {
    const container = document.getElementById(this.options.containerId);
    if (!container) {
      console.warn(`[RingChart] No element found with id "${this.options.containerId}"`);
      return;
    }

    this.container = container;
    container.innerHTML = '';

    const { size, strokeWidth, trackColor, rings, centerIcon, centerIconSize } = this.options;
    const center = size / 2;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `position: relative; width: ${size}px; height: ${size}px;`;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));

    this.arcEls = [];

    rings.forEach((ring) => {
      // Track circle (full ring, background)
      const track = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      track.setAttribute('cx', String(center));
      track.setAttribute('cy', String(center));
      track.setAttribute('r', String(ring.radius));
      track.setAttribute('fill', 'none');
      track.setAttribute('stroke', trackColor);
      track.setAttribute('stroke-width', String(strokeWidth));
      svg.appendChild(track);

      // Arc (animated fill) — uses stroke-dasharray technique
      const arc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      arc.setAttribute('cx', String(center));
      arc.setAttribute('cy', String(center));
      arc.setAttribute('r', String(ring.radius));
      arc.setAttribute('fill', 'none');
      arc.setAttribute('stroke', ring.color);
      arc.setAttribute('stroke-width', String(strokeWidth));
      arc.setAttribute('stroke-linecap', 'round');

      const circumference = 2 * Math.PI * ring.radius;
      arc.style.strokeDasharray = `0 ${circumference}`;
      arc.style.transformOrigin = `${center}px ${center}px`;
      arc.style.transform = `rotate(${this.options.startAngle}deg)`;
      arc.style.transition = 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

      svg.appendChild(arc as unknown as SVGPathElement);
      this.arcEls.push(arc as unknown as SVGPathElement);
    });

    wrapper.appendChild(svg);

    // ── Center icon ───────────────────────────────────────────────────────
    if (centerIcon) {
      const iconWrap = document.createElement('div');
      iconWrap.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      iconWrap.innerHTML = centerIcon.trim();
      const iconSvg = iconWrap.querySelector('svg');
      if (iconSvg) {
        iconSvg.setAttribute('width', String(centerIconSize));
        iconSvg.setAttribute('height', String(centerIconSize));
      }
      wrapper.appendChild(iconWrap);
    }

    container.appendChild(wrapper);

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
    if (this.container?.dataset.seen === 'true') {
      this.applyUpdate(respondents);
    } else {
      this.pendingRespondents = respondents;
    }
  }

  private applyUpdate(respondents: Respondent[]): void {
    const total = respondents.length;

    this.options.rings.forEach((ring, i) => {
      const count = respondents.filter((r) => {
        const val = r[ring.statKey];
        if (Array.isArray(val)) {
          return ring.statValues.some((sv) => (val as string[]).includes(sv));
        }
        return typeof val === 'string' && ring.statValues.includes(val);
      }).length;

      const pct = total > 0 ? count / total : 0;
      const circumference = 2 * Math.PI * ring.radius;
      const arcLength = pct * circumference;

      this.arcEls[i].style.strokeDasharray = `${arcLength} ${circumference}`;
    });
  }

  destroy(): void {}
}
