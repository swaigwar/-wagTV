import {
  ContentFilter as BaseContentFilter,
  FilterResult,
  FilterConfig,
} from './index';

/**
 * Simplified wrapper around ContentFilter for easier use
 */
export class ContentFilterWrapper {
  private filter: BaseContentFilter;

  constructor(config?: Partial<FilterConfig>) {
    this.filter = new BaseContentFilter({
      strictMode: config?.strictMode ?? true,
      customBlocklist: config?.customBlocklist ?? [],
      allowEducational: config?.allowEducational ?? true,
    });
  }

  /**
   * Filter content and return result
   * @param content The text content to filter
   * @returns FilterResult with allowed status, confidence, and optional reason/suggestions
   */
  filterContent(content: string): FilterResult {
    return this.filter.filterContent(content);
  }

  /**
   * Quick check if content is allowed
   * @param content The text content to check
   * @returns boolean indicating if content is allowed
   */
  isAllowed(content: string): boolean {
    const result = this.filter.filterContent(content);
    return result.allowed;
  }
}

/**
 * Create a singleton instance for easy imports
 */
export const contentFilter = new ContentFilterWrapper();

/**
 * Quick helper function for simple content checks
 */
export function checkContent(content: string): boolean {
  return contentFilter.isAllowed(content);
}
