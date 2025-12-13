import sanitizeHtmlLibrary from 'sanitize-html';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Allows basic formatting tags but removes scripts and dangerous attributes
 * 
 * @param {string} dirty - The dirty HTML string
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHtml(dirty) {
    if (!dirty) return dirty;

    return sanitizeHtmlLibrary(dirty, {
        allowedTags: sanitizeHtmlLibrary.defaults.allowedTags.concat([
            'h1', 'h2', 'img', 'span'
        ]),
        allowedAttributes: {
            ...sanitizeHtmlLibrary.defaults.allowedAttributes,
            'img': ['src', 'alt', 'title', 'width', 'height'],
            'span': ['class', 'style']
        },
        allowedSchemes: ['http', 'https', 'mailto', 'data'],
    });
}
