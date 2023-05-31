const checkUserRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.userType === role) {
      next(); // user has the required role, continue to the next middleware or route handler
    } else {
      res.status(403).json({ message: "Forbidden" }); // user does not have the required role, send a 403 Forbidden response
    }
  };
};

module.exports = checkUserRole;
