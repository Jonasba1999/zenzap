// dotColumnGrid.ts

export interface DotColumnConfig {
  key: string;
  label: string;
  sub?: string;
  color: string; // active color
  icon?: string; // SVG string from ICONS — falls back to plain circle dot if omitted
}

export interface DotColumnGridOptions {
  containerId: string;
  columns: DotColumnConfig[];
  totalDots?: number;
  dotsPerCol?: number;
  inactiveColor?: string;
  animationInterval?: number;
  dotClassName?: string;
  colClassName?: string;
  gridClassName?: string;
  pctClassName?: string;
  labelClassName?: string;
  subClassName?: string;
  dotSize?: number; // px, used when icon is set (default 16)
}

function buildIconDot(svgString: string, color: string, size: number): HTMLDivElement {
  const dot = document.createElement('div');
  dot.innerHTML = svgString.trim();
  const svg = dot.querySelector('svg');

  if (svg) {
    svg.removeAttribute('fill'); // strip conflicting root fill (fill="none" + fill="currentColor")
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.style.display = 'block';
    svg.style.color = color;

    svg.querySelectorAll<SVGElement>('path, circle, rect, polygon, ellipse').forEach((el) => {
      if (el.getAttribute('fill') !== 'none') el.setAttribute('fill', color);
    });
    svg.querySelectorAll<SVGElement>('path, circle, rect, polygon, ellipse').forEach((el) => {
      const stroke = el.getAttribute('stroke');
      if (stroke && stroke !== 'none') el.setAttribute('stroke', color);
    });
  }

  dot.style.flexShrink = '0';
  return dot;
}

function setDotIconColor(dot: HTMLDivElement, color: string): void {
  const svg = dot.querySelector('svg');
  if (!svg) return;
  svg.style.color = color;
  svg.querySelectorAll<SVGElement>('path, circle, rect, polygon, ellipse').forEach((el) => {
    if (el.getAttribute('fill') !== 'none') el.setAttribute('fill', color);
  });
  svg.querySelectorAll<SVGElement>('path, circle, rect, polygon, ellipse').forEach((el) => {
    const stroke = el.getAttribute('stroke');
    if (stroke && stroke !== 'none') el.setAttribute('stroke', color);
  });
}

export function renderDotColumnGrid(
  counts: Record<string, number>,
  total: number,
  options: DotColumnGridOptions
): void {
  const {
    containerId,
    columns,
    totalDots = 100,
    dotsPerCol = 20,
    inactiveColor = '#2c2c2a',
    animationInterval = 12,
    dotClassName = 'wm-dot',
    colClassName = 'wm-col',
    gridClassName = 'wm-grid',
    pctClassName = 'wm-pct',
    labelClassName = 'wm-label',
    subClassName = 'wm-sub',
    dotSize = 16,
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[renderDotColumnGrid] No element found with id "${containerId}"`);
    return;
  }
  container.innerHTML = '';

  const dotsPerRow = Math.round(totalDots / dotsPerCol);

  columns.forEach((cfg) => {
    const raw = counts[cfg.key] ?? 0;
    const pct = total > 0 ? Math.round((raw / total) * 100) : 0;
    const filled = Math.round((pct / 100) * totalDots);

    const colEl = document.createElement('div');
    colEl.className = colClassName;

    const grid = document.createElement('div');
    grid.className = gridClassName;
    grid.style.gridTemplateColumns = `repeat(${dotsPerRow}, ${cfg.icon ? dotSize + 'px' : 'var(--dot-size, 12px)'})`;

    const dots: HTMLDivElement[] = [];
    for (let i = 0; i < totalDots; i++) {
      let dot: HTMLDivElement;

      if (cfg.icon) {
        dot = buildIconDot(cfg.icon, inactiveColor, dotSize);
      } else {
        dot = document.createElement('div');
        dot.className = dotClassName;
        dot.style.background = inactiveColor;
      }

      grid.appendChild(dot);
      dots.push(dot);
    }

    const pctEl = document.createElement('div');
    pctEl.className = pctClassName;
    pctEl.style.color = cfg.color;
    pctEl.textContent = '0%';

    const labelEl = document.createElement('div');
    labelEl.className = labelClassName;
    labelEl.textContent = cfg.label;

    colEl.appendChild(grid);
    colEl.appendChild(pctEl);
    colEl.appendChild(labelEl);

    if (cfg.sub) {
      const subEl = document.createElement('div');
      subEl.className = subClassName;
      subEl.textContent = cfg.sub;
      colEl.appendChild(subEl);
    }

    container.appendChild(colEl);

    const order: number[] = [];
    for (let row = dotsPerCol - 1; row >= 0; row--) {
      for (let col = 0; col < dotsPerRow; col++) {
        order.push(row * dotsPerRow + col);
      }
    }

    let step = 0;
    const interval = setInterval(() => {
      if (step < filled) {
        const dot = dots[order[step]];
        if (cfg.icon) {
          setDotIconColor(dot, cfg.color);
        } else {
          dot.style.background = cfg.color;
        }
        step++;
        pctEl.textContent = Math.round((step / totalDots) * 100) + '%';
      } else {
        pctEl.textContent = pct + '%';
        clearInterval(interval);
      }
    }, animationInterval);
  });
}
