// iconGrid.ts

export interface IconGridConfig {
  /** Container element id */
  containerId: string;
  /** Raw SVG string for the icon (will be cloned per dot) */
  svgIcon: string;
  /** Color when dot is "active" (filled) */
  activeColor: string;
  /** Color when dot is "inactive" (unfilled) */
  inactiveColor: string;
  /** Survey respondent key to count */
  statKey: keyof Respondent;
  /** Values that count as "positive" (combined) */
  statValues: string[];
  /** Template string, use {pct} as placeholder */
  labelTemplate: string;
  /** Total dots in the grid (default: 100) */
  totalDots?: number;
  /** Dots per row (default: 25) */
  dotsPerRow?: number;
  /** Dot size in px (default: 32) */
  dotSize?: number;
  /** Gap between dots in px (default: 4) */
  gap?: number;
  /** Animation step interval in ms (default: 12) */
  animationInterval?: number;

  layout?: 'below' | 'inline';

  orientation?: 'horizontal' | 'vertical';
}

export class IconGrid {
  private config: Required<IconGridConfig>;
  private dots: SVGSVGElement[] = [];
  private labelEl: HTMLElement | null = null;
  private pctEl: HTMLElement | null = null;
  private animationTimer: ReturnType<typeof setInterval> | null = null;
  private currentFilled = 0;

  constructor(config: IconGridConfig) {
    this.config = {
      totalDots: 100,
      dotsPerRow: 25,
      dotSize: 32,
      gap: 4,
      animationInterval: 12,
      layout: 'below',
      orientation: 'horizontal',
      ...config,
    };
  }

  mount(respondents?: Respondent[]): void {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      console.warn(`[IconGrid] No element found with id "${this.config.containerId}"`);
      return;
    }

    container.innerHTML = '';
    const { layout, orientation, dotsPerRow, dotSize, gap } = this.config;

    container.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
    `;

    if (layout === 'inline') {
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        width: 100%;
        margin-bottom: 8px;
      `;

      const labelEl = document.createElement('span');
      labelEl.className = 'icon-grid-label-inline';
      labelEl.textContent = this.config.labelTemplate.replace('{pct}', '0');

      const pctEl = document.createElement('span');
      pctEl.className = 'icon-grid-pct-inline';
      pctEl.textContent = '0%';

      header.appendChild(labelEl);
      header.appendChild(pctEl);
      container.appendChild(header);

      this.labelEl = labelEl;
      this.pctEl = pctEl;
    }

    // ── Grid ────────────────────────────────────────────────────────────────
    const grid = document.createElement('div');

    if (orientation === 'vertical') {
      // Columns: each column is its own flex item with dots stacked bottom-up
      grid.style.cssText = `display: flex; gap: ${gap * 4}px; align-items: flex-end;`;
    } else {
      grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(${dotsPerRow}, ${dotSize}px);
        gap: ${gap}px;
      `;
    }

    this.dots = [];

    if (orientation === 'vertical') {
      // dotsPerRow here means "number of columns"; totalDots / dotsPerRow = rows per column
      const rowsPerCol = Math.round(this.config.totalDots / dotsPerRow);

      for (let col = 0; col < dotsPerRow; col++) {
        const colEl = document.createElement('div');
        colEl.style.cssText = `
          display: flex;
          flex-direction: column-reverse;
          gap: ${gap}px;
        `;
        for (let row = 0; row < rowsPerCol; row++) {
          const svg = this.createSvgDot(this.config.inactiveColor);
          colEl.appendChild(svg);
          this.dots.push(svg);
        }
        grid.appendChild(colEl);
      }
    } else {
      for (let i = 0; i < this.config.totalDots; i++) {
        const svg = this.createSvgDot(this.config.inactiveColor);
        grid.appendChild(svg);
        this.dots.push(svg);
      }
    }

    container.appendChild(grid);

    if (layout === 'below') {
      this.labelEl = document.createElement('p');
      this.labelEl.className = 'icon-grid-label';
      this.labelEl.textContent = this.config.labelTemplate.replace('{pct}', '0');
      this.pctEl = null;
      container.appendChild(this.labelEl);
    }

    if (respondents) this.update(respondents);
  }

  update(respondents: Respondent[]): void {
    const total = respondents.length;
    const count = respondents.filter((r) => {
      const val = r[this.config.statKey];
      if (Array.isArray(val)) {
        return this.config.statValues.some((sv) => (val as string[]).includes(sv));
      }
      return typeof val === 'string' && this.config.statValues.includes(val);
    }).length;

    const targetPct = total > 0 ? Math.round((count / total) * 100) : 0;
    const targetFilled = Math.round((targetPct / 100) * this.config.totalDots);

    this.animateTo(targetPct, targetFilled);
  }

  private animateTo(targetPct: number, targetFilled: number): void {
    if (this.animationTimer) clearInterval(this.animationTimer);

    const startFilled = this.currentFilled;
    const direction = targetFilled >= startFilled ? 1 : -1;
    let step = startFilled;

    // Fill order depends on orientation
    const order = this.buildFillOrder();

    this.animationTimer = setInterval(() => {
      if (step === targetFilled) {
        if (this.animationTimer) clearInterval(this.animationTimer);
        this.currentFilled = targetFilled;
        this.setLabel(targetPct, true);
        return;
      }

      step += direction;

      if (direction === 1) {
        this.setDotColor(this.dots[order[step - 1]], this.config.activeColor);
      } else {
        this.setDotColor(this.dots[order[step]], this.config.inactiveColor);
      }

      const currentPct = Math.round((step / this.config.totalDots) * 100);
      this.setLabel(currentPct, false);
    }, this.config.animationInterval);
  }

  private buildFillOrder(): number[] {
    const { orientation, totalDots, dotsPerRow } = this.config;

    if (orientation === 'vertical') {
      // Fill bottom-to-top within each column, column by column (left to right)
      const rowsPerCol = Math.round(totalDots / dotsPerRow);
      const order: number[] = [];
      for (let col = 0; col < dotsPerRow; col++) {
        for (let row = rowsPerCol - 1; row >= 0; row--) {
          order.push(col * rowsPerCol + row);
        }
      }
      return order;
    }

    // Horizontal: bottom row first, left to right (matches dot-grid waffle pattern)
    const rows = Math.round(totalDots / dotsPerRow);
    const order: number[] = [];
    for (let row = rows - 1; row >= 0; row--) {
      for (let col = 0; col < dotsPerRow; col++) {
        order.push(row * dotsPerRow + col);
      }
    }
    return order;
  }

  private setLabel(pct: number, isFinal: boolean): void {
    if (this.config.layout === 'inline') {
      if (this.pctEl) this.pctEl.textContent = `${pct}%`;
      if (this.labelEl && isFinal) {
        this.labelEl.textContent = this.config.labelTemplate;
      }
    } else {
      if (this.labelEl) {
        this.labelEl.textContent = this.config.labelTemplate.replace('{pct}', String(pct));
      }
    }
  }

  private createSvgDot(color: string): SVGSVGElement {
    const { dotSize, svgIcon } = this.config;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = svgIcon.trim();
    const svg = wrapper.querySelector('svg');
    if (!svg) throw new Error('[IconGrid] svgIcon must contain a valid <svg> element');

    svg.removeAttribute('fill');
    svg.setAttribute('width', String(dotSize));
    svg.setAttribute('height', String(dotSize));
    svg.style.display = 'block';
    svg.style.flexShrink = '0';

    this.setDotColor(svg as SVGSVGElement, color);
    return svg as SVGSVGElement;
  }

  private setDotColor(svg: SVGSVGElement, color: string): void {
    svg.style.color = color;
    svg.querySelectorAll<SVGElement>('path, circle, rect, polygon, ellipse').forEach((el) => {
      const fill = el.getAttribute('fill');
      if (fill !== 'none') el.setAttribute('fill', color);
    });
    svg.querySelectorAll<SVGElement>('path, circle, rect, polygon, ellipse').forEach((el) => {
      const stroke = el.getAttribute('stroke');
      if (stroke && stroke !== 'none') el.setAttribute('stroke', color);
    });
  }

  destroy(): void {
    if (this.animationTimer) clearInterval(this.animationTimer);
  }
}
