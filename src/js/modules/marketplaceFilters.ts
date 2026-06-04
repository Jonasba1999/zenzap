type FilterMatch = 'and' | 'or';

type FiltersCondition = {
  id: string;
  type: string;
  fieldKey: string;
  value: string | string[];
  op?: string;
  filterMatch?: FilterMatch;
  fieldMatch?: FilterMatch;
  fuzzyThreshold?: number;
  interacted?: boolean;
  customTagField?: string;
};

type FiltersGroup = {
  id: string;
  conditionsMatch: FilterMatch;
  conditions: FiltersCondition[];
};

type Filters = {
  groupsMatch?: FilterMatch;
  groups: FiltersGroup[];
};

type ListInstance = {
  filters: { value: Filters };
  watch: (
    source: unknown,
    callback: (value: unknown) => void,
    options?: { deep?: boolean }
  ) => void;
};

declare global {
  interface Window {
    FinsweetAttributes: Array<[string, (instances: ListInstance[]) => void]>;
  }
}

export function marketplaceTitle(): void {
  window.FinsweetAttributes ||= [];
  window.FinsweetAttributes.push([
    'list',
    (listInstances) => {
      const listInstance = listInstances[0] as any;
      const heading = document.querySelector<HTMLElement>('[data-filters-heading]');

      if (!listInstance || !heading) return;

      const defaultText = heading.textContent ?? '';

      listInstance.watch(
        listInstance.filters,
        (filtersProxy: any) => {
          const conditions = filtersProxy.groups?.[0]?.conditions ?? [];

          const topicCondition = conditions.find(
            (c: any) => c.fieldKey === 'topic' && c.type === 'radio' && c.value
          );

          if (!topicCondition) {
            heading.textContent = defaultText;
            return;
          }

          // Try to get the human-readable label from the radio DOM
          const radioInput = document.querySelector<HTMLInputElement>(
            `[fs-list-field="topic"][fs-list-value="${topicCondition.value}"]`
          );
          const label = radioInput
            ?.closest('.w-radio')
            ?.querySelector('.w-form-label')?.textContent;

          heading.textContent = label ?? topicCondition.value;
        },
        { deep: true }
      );
    },
  ]);
}

export function clearTopicsOnSearch(): void {
  const searchInput = document.querySelector<HTMLElement>('[data-search-filter]');
  const clearButton = document.querySelector<HTMLElement>('[fs-list-element="clear"]');

  if (!searchInput || !clearButton) return;

  searchInput.addEventListener('beforeinput', () => {
    console.log('test');
    clearButton.click();
  });
}
