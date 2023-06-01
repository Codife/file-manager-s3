const checkUserRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.userType === role) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  };
};

module.exports = checkUserRole;
