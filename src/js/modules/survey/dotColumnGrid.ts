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

const dotColumnGridState = new Map<
  string,
  {
    timer: number | null;
    currentFilled: number;
  }
>();

function clearDotColumnGridTimer(stateKey: string) {
  const state = dotColumnGridState.get(stateKey);
  if (!state || state.timer === null) return;
  window.clearInterval(state.timer);
  dotColumnGridState.set(stateKey, {
    ...state,
    timer: null,
  });
}

function clearDotColumnGridTimersForContainer(containerId: string) {
  for (const key of Array.from(dotColumnGridState.keys())) {
    if (key.startsWith(`${containerId}:`)) {
      clearDotColumnGridTimer(key);
    }
  }
}

function setDotColumnGridState(stateKey: string, currentFilled: number, timer: number | null) {
  dotColumnGridState.set(stateKey, {
    currentFilled,
    timer,
  });
}

function getDotColumnGridCurrentFilled(stateKey: string): number {
  return dotColumnGridState.get(stateKey)?.currentFilled ?? 0;
}

function buildDotColumnFillOrder(
  totalDots: number,
  dotsPerRow: number,
  actualColumns: number
): number[] {
  const actualRows = Math.ceil(totalDots / actualColumns);
  const order: number[] = [];

  const isDesktopOrder = actualColumns === dotsPerRow;
  if (isDesktopOrder) {
    for (let row = actualRows - 1; row >= 0; row--) {
      for (let col = 0; col < actualColumns; col++) {
        const index = row * actualColumns + col;
        if (index < totalDots) order.push(index);
      }
    }
  } else {
    for (let row = 0; row < actualRows; row++) {
      for (let col = 0; col < actualColumns; col++) {
        const index = row * actualColumns + col;
        if (index < totalDots) order.push(index);
      }
    }
  }

  return order;
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

  dot.className = 'chart-col-icon-dot';
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
    inactiveColor = '#414245',
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

  clearDotColumnGridTimersForContainer(containerId);
  container.innerHTML = '';

  const dotsPerRow = Math.round(totalDots / dotsPerCol);

  columns.forEach((cfg, index) => {
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

    const labelWrap = document.createElement('div');
    labelWrap.className = 'wm-label-wrap';

    const pctEl = document.createElement('div');
    pctEl.className = pctClassName;
    pctEl.style.color = cfg.color;
    pctEl.textContent = '0%';

    const labelEl = document.createElement('div');
    labelEl.className = labelClassName;
    labelEl.textContent = cfg.label;

    if (cfg.sub) {
      const subEl = document.createElement('div');
      subEl.className = subClassName;
      subEl.textContent = cfg.sub;
      labelEl.appendChild(subEl);
    }

    labelWrap.appendChild(pctEl);
    labelWrap.appendChild(labelEl);

    colEl.appendChild(grid);
    colEl.appendChild(labelWrap);

    container.appendChild(colEl);

    const actualColumns = Math.max(
      1,
      window.getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length
    );
    const stateKey = `${containerId}:${index}`;
    const startFilled = Math.min(getDotColumnGridCurrentFilled(stateKey), totalDots);
    clearDotColumnGridTimer(stateKey);

    const order = buildDotColumnFillOrder(totalDots, dotsPerRow, actualColumns);
    let step = startFilled;
    const direction = filled >= step ? 1 : -1;

    for (let i = 0; i < step; i++) {
      const dot = dots[order[i]];
      if (cfg.icon) {
        setDotIconColor(dot, cfg.color);
      } else {
        dot.style.background = cfg.color;
      }
    }
    pctEl.textContent = Math.round((step / totalDots) * 100) + '%';

    const interval = window.setInterval(() => {
      if (step === filled) {
        window.clearInterval(interval);
        setDotColumnGridState(stateKey, filled, null);
        pctEl.textContent = pct + '%';
        return;
      }

      step += direction;

      if (direction === 1) {
        const dot = dots[order[step - 1]];
        if (cfg.icon) {
          setDotIconColor(dot, cfg.color);
        } else {
          dot.style.background = cfg.color;
        }
      } else {
        const dot = dots[order[step]];
        if (cfg.icon) {
          setDotIconColor(dot, inactiveColor);
        } else {
          dot.style.background = inactiveColor;
        }
      }

      const currentPct = Math.round((step / totalDots) * 100);
      pctEl.textContent = `${currentPct}%`;
      setDotColumnGridState(stateKey, step, interval);
    }, animationInterval);
    setDotColumnGridState(stateKey, step, interval);
  });
}
