/**
 * Async handler to catch errors and pass them to the error middleware
 * @param {Function} fn The async function to handle
 * @returns {Function} The wrapped function with error handling
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;