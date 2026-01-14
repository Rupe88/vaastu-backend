/**
 * Generate URL-friendly slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string} - Generated slug
 */
export const generateSlug = (text) => {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Generate unique slug by appending a number if slug already exists
 * @param {string} baseSlug - Base slug
 * @param {Function} checkExists - Async function that checks if slug exists
 * @returns {Promise<string>} - Unique slug
 */
export const generateUniqueSlug = async (baseSlug, checkExists) => {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

