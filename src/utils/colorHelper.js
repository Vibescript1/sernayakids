/**
 * Color metadata and swatch resolver for clothing products.
 * Maps color names to accurate hex codes, CSS styles, and Tailwind classes.
 */

const COLOR_MAP = [
  // Multi / Pattern / Rainbow
  { keywords: ['multi', 'rainbow', 'multicolor', 'multicolour', 'floral', 'print', 'stripe', 'pattern'], hex: '#FF9EAF', style: { backgroundImage: 'linear-gradient(135deg, #FF9EAF 0%, #FEF08A 50%, #9EBDD8 100%)' }, class: 'bg-linear-to-br from-brand-pink via-yellow-200 to-brand-blue' },

  // Red & Deep Reds
  { keywords: ['crimson'], hex: '#DC143C', class: 'bg-[#DC143C]' },
  { keywords: ['maroon', 'burgundy', 'wine', 'bordeaux', 'berry'], hex: '#800020', class: 'bg-[#800020]' },
  { keywords: ['ruby', 'scarlet', 'cherry'], hex: '#E11D48', class: 'bg-rose-600' },
  { keywords: ['red', 'brick'], hex: '#EF4444', class: 'bg-red-500' },

  // Coral, Rust & Terracotta
  { keywords: ['coral'], hex: '#E46A4B', class: 'bg-brand-coral' },
  { keywords: ['rust', 'terracotta', 'clay'], hex: '#C2410C', class: 'bg-orange-700' },

  // Pinks & Peaches
  { keywords: ['dusty rose', 'rose'], hex: '#FB7185', class: 'bg-rose-400' },
  { keywords: ['blush', 'pink', 'baby pink', 'powder pink', 'bubblegum', 'flamingo'], hex: '#FF9EAF', class: 'bg-brand-pink' },
  { keywords: ['fuchsia', 'magenta'], hex: '#D946EF', class: 'bg-fuchsia-500' },
  { keywords: ['peach', 'apricot', 'melon', 'salmon'], hex: '#FDBA74', class: 'bg-orange-200' },

  // Oranges & Yellows
  { keywords: ['tangerine', 'carrot', 'ginger', 'orange'], hex: '#F97316', class: 'bg-orange-500' },
  { keywords: ['amber', 'marigold'], hex: '#F59E0B', class: 'bg-amber-500' },
  { keywords: ['mustard', 'ochre', 'gold'], hex: '#CA8A04', class: 'bg-yellow-600' },
  { keywords: ['lemon', 'butter', 'canary', 'yellow', 'sunshine'], hex: '#FDE047', class: 'bg-yellow-300' },

  // Greens
  { keywords: ['mint', 'pistachio', 'seafoam'], hex: '#6EE7B7', class: 'bg-emerald-300' },
  { keywords: ['sage', 'eucalyptus'], hex: '#9CA986', class: 'bg-[#9CA986]' },
  { keywords: ['olive', 'army'], hex: '#65A30D', class: 'bg-lime-600' },
  { keywords: ['emerald', 'jade'], hex: '#059669', class: 'bg-emerald-600' },
  { keywords: ['forest', 'pine', 'hunter', 'dark green'], hex: '#166534', class: 'bg-green-800' },
  { keywords: ['lime'], hex: '#84CC16', class: 'bg-lime-500' },
  { keywords: ['green'], hex: '#10B981', class: 'bg-emerald-500' },

  // Blues & Teals
  { keywords: ['teal'], hex: '#0D9488', class: 'bg-teal-600' },
  { keywords: ['turquoise', 'aqua', 'aquamarine', 'cyan'], hex: '#06B6D4', class: 'bg-cyan-500' },
  { keywords: ['sky', 'sky blue', 'light blue', 'baby blue', 'powder blue', 'ice blue', 'pastel blue'], hex: '#7DD3FC', class: 'bg-sky-300' },
  { keywords: ['navy', 'midnight', 'dark blue'], hex: '#0A1E33', class: 'bg-brand-navy' },
  { keywords: ['denim', 'chambray', 'slate'], hex: '#4F759B', class: 'bg-[#4F759B]' },
  { keywords: ['indigo'], hex: '#6366F1', class: 'bg-indigo-500' },
  { keywords: ['royal blue', 'cobalt', 'sapphire'], hex: '#1D4ED8', class: 'bg-blue-700' },
  { keywords: ['blue'], hex: '#9EBDD8', class: 'bg-brand-blue' },

  // Purples & Lavenders
  { keywords: ['lavender', 'lilac'], hex: '#B59ED8', class: 'bg-brand-lavender' },
  { keywords: ['mauve', 'plum', 'orchid', 'eggplant'], hex: '#A855F7', class: 'bg-purple-500' },
  { keywords: ['purple', 'violet'], hex: '#8B5CF6', class: 'bg-violet-500' },

  // Neutrals, Whites, Creams, Browns
  { keywords: ['cream', 'ivory', 'off white', 'off-white', 'eggshell', 'pearl', 'vanilla', 'linen', 'oatmeal', 'sand', 'champagne'], hex: '#FBF9F4', class: 'bg-[#FBF9F4]' },
  { keywords: ['beige', 'ecru'], hex: '#E7D8C9', class: 'bg-[#E7D8C9]' },
  { keywords: ['tan', 'camel', 'khaki', 'nude', 'fawn', 'wheat'], hex: '#D2B48C', class: 'bg-[#D2B48C]' },
  { keywords: ['mocha', 'coffee', 'caramel', 'walnut', 'bronze', 'copper'], hex: '#967969', class: 'bg-[#967969]' },
  { keywords: ['brown', 'chocolate', 'chestnut'], hex: '#78350F', class: 'bg-amber-900' },
  { keywords: ['white', 'snow'], hex: '#FFFFFF', class: 'bg-white' },
  { keywords: ['charcoal', 'anthracite'], hex: '#374151', class: 'bg-gray-700' },
  { keywords: ['grey', 'gray', 'silver', 'ash', 'smoke', 'heather'], hex: '#9CA3AF', class: 'bg-gray-400' },
  { keywords: ['black', 'jet black', 'obsidian', 'onyx'], hex: '#111827', class: 'bg-gray-900' }
];

/**
 * Resolves color details for a given color name string.
 * @param {string} colorName 
 * @returns {{ name: string, hex: string, class: string, style?: object }}
 */
export function getColorMeta(colorName) {
  if (!colorName) {
    return { name: '', hex: '#FBF9F4', class: 'bg-[#FBF9F4]' };
  }

  const trimmed = String(colorName).trim();
  const lower = trimmed.toLowerCase();

  // If already a valid hex code
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    return { name: trimmed, hex: trimmed, class: '', style: { backgroundColor: trimmed } };
  }

  // Look for matching keywords
  for (const item of COLOR_MAP) {
    if (item.keywords.some(k => lower.includes(k))) {
      return {
        name: trimmed,
        hex: item.hex,
        class: item.class || '',
        style: item.style || { backgroundColor: item.hex }
      };
    }
  }

  // Fallback: Use standard CSS color keyword if browser recognizes it, or clean pastel fallback
  return {
    name: trimmed,
    hex: lower,
    class: 'bg-brand-coral/20',
    style: { backgroundColor: lower }
  };
}
