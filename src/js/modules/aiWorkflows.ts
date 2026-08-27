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
  // Availability — disable/hide options that would yield 0 results
  // ---------------------------------------------------------------------------

  function wouldMatch(
    wf: WorkflowRecord,
    overrides: {
      industry?: string;
      subVertical?: string;
      role?: string;
    }
  ): boolean {
    const industry = overrides.industry ?? getSelectValue('industry');
    const subVertical = overrides.subVertical ?? getSelectValue('sub-vertical');
    const role = overrides.role ?? getSelectValue('role');

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
  }

  // function onFilterSelectionChanged(): void {
  //   // Filters just update option availability + healthcare UI.
  //   // They do NOT trigger a re-render of the cards.
  //   refreshAllOptionAvailability();
  // }

  // function bindShowWorkflowsButton(): void {
  //   const showBtn = document.querySelector<HTMLElement>('[data-show-workflows]');
  //   showBtn?.addEventListener('click', (e) => {
  //     console.log('ClicK: [data-show-workflows]');
  //     e.preventDefault();
  //     visibleCount = PAGE_SIZE;
  //     renderPage();
  //   });
  // }

  // ---------------------------------------------------------------------------
  // Availability — HIDE options that would yield 0 results (not just disable)
  // ---------------------------------------------------------------------------

  function updateOptionAvailability(
    select: HTMLSelectElement,
    field: 'industry' | 'sub-vertical' | 'role'
  ): void {
    const dropdown = select.closest('.w-dropdown');
    const links = Array.from(
      dropdown?.querySelectorAll<HTMLAnchorElement>('.w-dropdown-list a') ?? []
    );

    Array.from(select.options).forEach((opt, i) => {
      const link = links[i];
      if (!opt.value) {
        // "All ..." option is always available
        opt.hidden = false;
        opt.disabled = false;
        if (link) link.style.display = '';
        return;
      }

      const hasMatch = workflows.some((wf) => {
        const overrides: { industry?: string; subVertical?: string; role?: string } = {};
        if (field === 'industry') overrides.industry = opt.value;
        if (field === 'sub-vertical') overrides.subVertical = opt.value;
        if (field === 'role') overrides.role = opt.value;
        return wouldMatch(wf, overrides);
      });

      opt.hidden = !hasMatch;
      opt.disabled = !hasMatch;
      if (link) link.style.display = hasMatch ? '' : 'none';
    });

    // If the currently selected value just became unavailable, reset to "All"
    if (select.value && select.options[select.selectedIndex]?.hidden) {
      resetSelectToDefault(select);
    }
  }

  function refreshAllOptionAvailability(): void {
    const industrySelect = document.querySelector<HTMLSelectElement>('select#industry');
    const businessTypeSelect = document.querySelector<HTMLSelectElement>('select#sub-vertical');
    const roleSelect = document.querySelector<HTMLSelectElement>('select#role');

    if (industrySelect) updateOptionAvailability(industrySelect, 'industry');
    if (businessTypeSelect) updateOptionAvailability(businessTypeSelect, 'sub-vertical');
    if (roleSelect) updateOptionAvailability(roleSelect, 'role');
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
    card.setAttribute('data-item', '');
    card.style.display = 'flex';

    // ── Main content ─────────────────────────────────────────────────────────
    const titleEl = card.querySelector<HTMLElement>('[data-usecase-title]');
    if (titleEl) titleEl.textContent = wf.useCase;

    const descEl = card.querySelector<HTMLElement>('[data-usecase-description]');
    if (descEl) descEl.textContent = wf.description;

    const workflowEl = card.querySelector<HTMLElement>('[data-usecase-workflow]');
    if (workflowEl) workflowEl.innerHTML = wf.workflowHtml;

    const toolsEl = card.querySelector<HTMLElement>('[data-usecase-tools]');
    if (toolsEl) {
      const toolsWrap = toolsEl.closest<HTMLElement>('.ai-workflow_item-tools');

      if (wf.tools.length > 0) {
        const badge = toolsEl.closest<HTMLElement>('.ai-workflow_tool-badge');

        if (badge) {
          toolsWrap?.querySelectorAll('.ai-workflow_tool-badge').forEach((el, index) => {
            if (index > 0) el.remove();
          });

          const tools = wf.tools
            .flatMap((tool) => tool.split(','))
            .map((tool) => tool.trim())
            .filter(Boolean);

          tools.forEach((tool, index) => {
            const currentBadge = index === 0 ? badge : (badge.cloneNode(true) as HTMLElement);
            const textEl = currentBadge.querySelector<HTMLElement>('[data-usecase-tools]');

            if (textEl) {
              textEl.innerHTML = '';
              const span = document.createElement('span');
              span.textContent = tool;
              textEl.appendChild(span);
            }

            if (index > 0) {
              toolsWrap?.appendChild(currentBadge);
            }
          });

          if (toolsWrap) toolsWrap.style.display = 'flex';
        }
      } else {
        if (toolsWrap) toolsWrap.style.display = 'none';
      }
    }

    const exampleEl = card.querySelector<HTMLElement>('[data-usecase-example]');
    if (exampleEl) exampleEl.innerHTML = `<p>${escapeHtml(wf.exampleMessage)}</p>`;

    // ── Reset accordion state on every fresh render ─────────────────────────
    // (accordion.ts owns opening/closing; we just make sure a freshly built
    //  card always starts closed, matching a fresh height:0 state)
    card.classList.remove('is-open');
    const expandEl = card.querySelector<HTMLElement>('[data-expand]');
    if (expandEl) {
      expandEl.style.height = '0px';
    }

    return card;
  }

  function onFilterChanged(): void {
    visibleCount = PAGE_SIZE;
    renderPage();
    refreshAllOptionAvailability();
  }

  function escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderPage(): void {
    const wrap = document.querySelector<HTMLElement>('[data-workflows-wrap]');
    const listContainer = wrap?.querySelector<HTMLElement>('.ai-workflow_list');

    if (!listContainer) {
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
    }, 300);
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

    businessTypeSelect?.addEventListener('change', onFilterChanged); // ← now wired
    roleSelect.addEventListener('change', onFilterChanged); // ← now wired

    update();
  }
  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------

  function init(): void {
    captureTemplate();
    if (!cardTemplate) return;

    const industrySelect = document.querySelector<HTMLSelectElement>('select#industry');
    const businessTypeSelect = document.querySelector<HTMLSelectElement>('select#sub-vertical');
    const roleSelect = document.querySelector<HTMLSelectElement>('select#role');

    if (industrySelect) bindCustomDropdown(industrySelect);
    if (businessTypeSelect) bindCustomDropdown(businessTypeSelect);
    if (roleSelect) bindCustomDropdown(roleSelect);

    initHealthcareConditionalLogic();
    bindLoadMore();

    renderPage(); // Render cards on page load
    refreshAllOptionAvailability(); // hide zero-match options from the start

    // Render cards only after settings chosen ⬇️
    // bindShowWorkflowsButton();
    // updateLoadMoreVisibility(0);
    // refreshAllOptionAvailability(); //  all options available since no filters set
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
};
