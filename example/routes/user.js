export default {
  /**
   * 
   * @route   GET /api/v1/user
   * @desc    Fetch user
   * @access  Public
   * @params  id
   * @return  message
   * @error   400, { error }
   * @status  200, 400
   * 
   * @example /api/v1/user
   */
  GET: (req) => ({ message: "Fetching user" }),

  POST: (req) => ({ message: "Creating user", data: req.body }),
  DELETE: (req) => ({ message: "Deleting user" })
};
