import workflowsData from '../data/workflowsData.json';
import { accordion } from './accordion';

interface WorkflowRecord {
  id: string;
  sourceRowIndex: number;
  industry: string;
  subVertical: string[];
  roles: string[];
  useCase: string;
  description: string;
  workflowHtml: string;
  tools: string[];
  exampleMessage: string;
  priority: number;
}

const { workflows } = workflowsData;

export const aiWorkflows = () => {
  // console.log('[AI Workflows] init, total records:', workflows.length);

  const PAGE_SIZE = 12;
  let visibleCount = PAGE_SIZE;
  let cardTemplate: HTMLElement | null = null;

  // ---------------------------------------------------------------------------
  // Template capture — grab the real Webflow card once, then clear the list
  // ---------------------------------------------------------------------------

  function captureTemplate(): void {
    const wrap = document.querySelector<HTMLElement>('[data-workflows-wrap]');
    const listContainer = wrap?.querySelector<HTMLElement>('.ai-workflow_list');
    const firstCard = listContainer?.querySelector<HTMLElement>('.ai-workflow_list-item');

    if (!wrap || !firstCard) {
      // console.warn('[AI Workflows] No template card found under [data-workflows-wrap]');
      return;
    }

    cardTemplate = firstCard.cloneNode(true) as HTMLElement;
    listContainer!.innerHTML = ''; // clear the static placeholder card
  }

  // ---------------------------------------------------------------------------
  // Filtering — pure, operates on the in-memory array
  // ---------------------------------------------------------------------------

  function getSelectValue(id: string): string {
    return document.querySelector<HTMLSelectElement>(`select#${id}`)?.value?.trim() ?? '';
  }

  function getMatchingWorkflows(): WorkflowRecord[] {
    const industry = getSelectValue('industry');
    const subVertical = getSelectValue('sub-vertical');
    const role = getSelectValue('role');

    const filtered = workflows.filter((wf) => {
      const industryMatch =
        !industry || wf.industry === 'General / Any Industry' || wf.industry === industry;
      if (!industryMatch) return false;

      if (industry === 'Healthcare' && subVertical) {
        if (!wf.subVertical.includes(subVertical)) return false;
      }

      if (role) {
        if (!wf.roles.includes(role)) return false;
      }

      return true;
    });

    return dedupeByName(filtered);
  }

  function dedupeByName(items: WorkflowRecord[]): WorkflowRecord[] {
    const bestByName = new Map<string, WorkflowRecord>();

    items.forEach((wf) => {
      // Key on name + industry, not name alone — only collapse TRUE duplicates
      // (same name within the same industry context), not every same-named
      // workflow across different industries.
      const key = `${wf.useCase}::${wf.industry}`;
      const existing = bestByName.get(key);
      if (!existing || wf.priority < existing.priority) {
        bestByName.set(key, wf);
      }
    });

    return Array.from(bestByName.values()).sort(
      (a, b) => a.priority - b.priority || a.sourceRowIndex - b.sourceRowIndex
    );
  }

  // ---------------------------------------------------------------------------
  // Rendering — clone the captured template, fill in real data
  // ---------------------------------------------------------------------------

  function buildCard(wf: WorkflowRecord): HTMLElement {
    const card = cardTemplate!.cloneNode(true) as HTMLElement;
    card.setAttribute('data-workflow-id', wf.id);

    // ── Main content ─────────────────────────────────────────────────────────
    const titleEl = card.querySelector<HTMLElement>('[data-usecase-title]');
    if (titleEl) titleEl.textContent = wf.useCase;

    const descEl = card.querySelector<HTMLElement>('[data-usecase-description]');
    if (descEl) descEl.textContent = wf.description;

    const workflowEl = card.querySelector<HTMLElement>('[data-usecase-workflow]');
    if (workflowEl) workflowEl.innerHTML = wf.workflowHtml;

    const toolsEl = card.querySelector<HTMLElement>('[data-usecase-tools]');
    if (toolsEl) {
      if (wf.tools.length > 0) {
        toolsEl.textContent = wf.tools.join(', ');
        toolsEl.closest<HTMLElement>('.ai-workflow_item-tools')!.style.display = 'flex';
      } else {
        // No tools for this row — hide the whole tools block rather than show empty
        const toolsWrap = toolsEl.closest<HTMLElement>('.ai-workflow_item-tools');
        if (toolsWrap) toolsWrap.style.display = 'none';
      }
    }

    const exampleEl = card.querySelector<HTMLElement>('[data-usecase-example]');
    if (exampleEl) exampleEl.innerHTML = `<p>${escapeHtml(wf.exampleMessage)}</p>`;

    // ── Reset expand state on every fresh render ────────────────────────────
    const expandEl = card.querySelector<HTMLElement>('[data-expand]');
    if (expandEl) {
      expandEl.classList.remove('is-open');
      expandEl.style.maxHeight = '';
    }

    // ── Bind the expand/collapse trigger ────────────────────────────────────
    const trigger = card.querySelector<HTMLElement>('[data-trigger]');
    trigger?.addEventListener('click', () => {
      if (!expandEl) return;
      const isOpen = expandEl.classList.toggle('is-open');
      expandEl.style.maxHeight = isOpen ? `${expandEl.scrollHeight}px` : '';
      trigger.classList.toggle('is-open', isOpen);
    });

    return card;
  }

  function setFieldValue(testItem: HTMLElement, value: string): void {
    // The test item has two divs: a <strong> label div, then the value div.
    const valueDiv = testItem.children[1] as HTMLElement | undefined;
    if (valueDiv) valueDiv.textContent = value || '—';
  }

  function escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderPage(): void {
    const wrap = document.querySelector<HTMLElement>('[data-workflows-wrap]');
    const listContainer = wrap?.querySelector<HTMLElement>('.ai-workflow_list');

    if (!listContainer || !cardTemplate) {
      console.warn('[AI Workflows] Missing list container or template');
      return;
    }

    const matching = getMatchingWorkflows();
    const pageItems = matching.slice(0, visibleCount);

    const fragment = document.createDocumentFragment();
    pageItems.forEach((wf) => fragment.appendChild(buildCard(wf)));

    listContainer.innerHTML = '';
    listContainer.appendChild(fragment);

    updateLoadMoreVisibility(matching.length);
    updateResultsCount(matching.length);

    setTimeout(() => {
      accordion();
    }, 100);
  }

  function updateLoadMoreVisibility(totalMatching: number): void {
    const loadMoreBtn = document.querySelector<HTMLElement>('[data-workflows-load-more]');
    if (!loadMoreBtn) return;
    loadMoreBtn.style.display = visibleCount >= totalMatching ? 'none' : '';
  }

  function updateResultsCount(totalMatching: number): void {
    const countEl = document.querySelector<HTMLElement>('[data-results-count]');
    if (countEl) countEl.textContent = String(totalMatching);
  }

  // ---------------------------------------------------------------------------
  // Load More
  // ---------------------------------------------------------------------------

  function bindLoadMore(): void {
    const loadMoreBtn = document.querySelector<HTMLElement>('[data-workflows-load-more]');
    loadMoreBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      visibleCount += PAGE_SIZE;
      renderPage();
    });
  }

  function onFilterChanged(): void {
    visibleCount = PAGE_SIZE;
    renderPage();
  }

  // ---------------------------------------------------------------------------
  // Finsweet Select Custom sync — dropdown UI stays, filtering logic is ours
  // ---------------------------------------------------------------------------

  function bindCustomDropdown(select: HTMLSelectElement): void {
    const dropdown = select.closest('.w-dropdown');
    const label = dropdown?.querySelector<HTMLElement>('[fs-selectcustom-element="label"]');
    const links = Array.from(
      dropdown?.querySelectorAll<HTMLAnchorElement>('.w-dropdown-list a') ?? []
    );

    links.forEach((a, i) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        select.value = select.options[i]?.value ?? '';
        if (label) label.textContent = a.querySelector('div')?.textContent ?? '';
        links.forEach((link, j) => link.classList.toggle('w--current', j === i));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  function resetSelectToDefault(select: HTMLSelectElement): void {
    select.value = '';
    const dropdown = select.closest('.w-dropdown');
    const label = dropdown?.querySelector<HTMLElement>('[fs-selectcustom-element="label"]');
    const defaultText = select.options[0]?.textContent ?? '';
    if (label) label.textContent = defaultText;
    dropdown?.querySelectorAll<HTMLElement>('.w-dropdown-list a').forEach((a, i) => {
      a.classList.toggle('w--current', i === 0);
    });
  }

  // ---------------------------------------------------------------------------
  // Healthcare conditional UI
  // ---------------------------------------------------------------------------

  function initHealthcareConditionalLogic(): void {
    const industrySelect = document.querySelector<HTMLSelectElement>('select#industry');
    const businessTypeWrap = document.querySelector<HTMLElement>('[data-business-type-wrap]');
    const businessTypeSelect = document.querySelector<HTMLSelectElement>('select#sub-vertical');
    const roleSelect = document.querySelector<HTMLSelectElement>('select#role');

    if (!industrySelect || !roleSelect) {
      console.warn('[Healthcare Logic] Missing required selects');
      return;
    }

    const teamMemberOpt = roleSelect.querySelector<HTMLOptionElement>(
      'option[value="Team Member"]'
    );
    const clinicalStaffOpt = roleSelect.querySelector<HTMLOptionElement>(
      'option[value="Clinical Staff"]'
    );

    function resetBusinessType(): void {
      if (!businessTypeSelect) return;
      resetSelectToDefault(businessTypeSelect);
    }

    function update(): void {
      const isHealthcare = industrySelect.value === 'Healthcare';

      if (businessTypeWrap) {
        businessTypeWrap.style.display = isHealthcare ? 'flex' : 'none';
      }

      if (!isHealthcare) resetBusinessType();

      if (teamMemberOpt) teamMemberOpt.hidden = isHealthcare;
      if (clinicalStaffOpt) clinicalStaffOpt.hidden = !isHealthcare;

      const roleNav = roleSelect.closest('.w-dropdown')?.querySelector('.w-dropdown-list');
      roleNav?.querySelectorAll('a').forEach((a) => {
        const label = a.querySelector('div')?.textContent?.trim();
        if (label === 'Team Member') (a as HTMLElement).style.display = isHealthcare ? 'none' : '';
        if (label === 'Clinical Staff')
          (a as HTMLElement).style.display = isHealthcare ? '' : 'none';
      });

      if (isHealthcare && roleSelect.value === 'Team Member') roleSelect.value = '';
      if (!isHealthcare && roleSelect.value === 'Clinical Staff') roleSelect.value = '';
    }

    industrySelect.addEventListener('change', () => {
      update();
      onFilterChanged();
    });

    businessTypeSelect?.addEventListener('change', onFilterChanged);
    roleSelect.addEventListener('change', onFilterChanged);

    update();
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------

  function init(): void {
    captureTemplate();
    if (!cardTemplate) return; // nothing to render without a template

    const industrySelect = document.querySelector<HTMLSelectElement>('select#industry');
    const businessTypeSelect = document.querySelector<HTMLSelectElement>('select#sub-vertical');
    const roleSelect = document.querySelector<HTMLSelectElement>('select#role');

    if (industrySelect) bindCustomDropdown(industrySelect);
    if (businessTypeSelect) bindCustomDropdown(businessTypeSelect);
    if (roleSelect) bindCustomDropdown(roleSelect);

    initHealthcareConditionalLogic();
    bindLoadMore();
    renderPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
};
