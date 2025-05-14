export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      // Fixed: error.code -> error.statusCode
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
