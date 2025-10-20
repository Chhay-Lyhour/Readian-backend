const sendSuccessResponse = (res, data, message, statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

const sendErrorResponse = (res, error) => {
  res.status(error.statusCode).json({
    success: false,
    error: { code: error.code, message: error.message },
  });
};

export { sendSuccessResponse, sendErrorResponse };
