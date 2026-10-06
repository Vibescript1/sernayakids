/**
 * Universal product search matcher
 * Searches across:
 * - Product Name
 * - Product Colors (color names, variation attributes, color metadata)
 * - Product Categories & Category Slugs (e.g., 'girls', 'boys', 'summer', 'newborn', 'unisex', 'frocks', 'rompers', etc.)
 * - Product Tags (e.g., 'Sale', 'New', 'Bestseller')
 * - Tokenized multi-word search (e.g., "pink frock", "boys blue dungaree", "summer yellow")
 *
 * @param {Object} product - The product object from catalog
 * @param {string} query - The search query string
 * @returns {boolean} - Whether the product matches the query
 */
export const matchesUniversalSearch = (product, query) => {
  if (!query || !query.trim()) return true;
  if (!product) return false;

  const cleanQuery = query.toLowerCase().trim();
  const searchTerms = cleanQuery.split(/\s+/).filter(Boolean);

  // 1. Name
  const name = (product.name || '').toLowerCase();

  // 2. Categories
  const category = (product.category || '').toLowerCase();
  const categories = Array.isArray(product.categories) 
    ? product.categories.join(' ').toLowerCase() 
    : '';

  // 3. Colors
  const colorNames = Array.isArray(product.colors)
    ? product.colors.map(c => (typeof c === 'string' ? c : c?.name || c?.label || '')).join(' ').toLowerCase()
    : '';

  // 4. Variation attributes (including colors & sizes)
  const variationAttrs = Array.isArray(product.variations)
    ? product.variations.flatMap(v => (v.attributes?.nodes || v.attributes || []).map(a => a.value || '')).join(' ').toLowerCase()
    : '';

  // 5. Tags & Descriptions
  const tag = (product.tag || '').toLowerCase();

  // Composite search corpus
  const fullSearchString = `${name} ${category} ${categories} ${colorNames} ${variationAttrs} ${tag}`;

  // Every word/term in the search query must match
  return searchTerms.every(term => {
    // Direct substring match
    if (fullSearchString.includes(term)) return true;

    // Plural / singular loose match (e.g. "frocks" matches "frock", "girls" matches "girl")
    if (term.endsWith('s') && fullSearchString.includes(term.slice(0, -1))) return true;
    if (!term.endsWith('s') && fullSearchString.includes(term + 's')) return true;
    if (term.endsWith('es') && fullSearchString.includes(term.slice(0, -2))) return true;

    return false;
  });
};
