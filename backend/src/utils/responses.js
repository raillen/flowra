/**
 * Standardized API response utilities
 * Ensures consistent response format across all endpoints
 * 
 * @module utils/responses
 */

/**
 * Creates a successful response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Formatted success response
 */
export function successResponse(data = null, message = 'Success', statusCode = 200) {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates a paginated response object
 * @param {Array} items - Array of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Formatted paginated response
 */
export function paginatedResponse(items, page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  
  return successResponse({
    items,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}

/**
 * Creates an error response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} errors - Additional error details
 * @returns {Object} Formatted error response
 */
export function errorResponse(message, statusCode = 500, errors = null) {
  return {
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  };
}

