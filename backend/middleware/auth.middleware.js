// backend/middleware/auth.middleware.js
export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success:false, message: "Not authenticated" });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user || req.session.user.role !== "Admin") {
    return res.status(403).json({ success:false, message: "Admin can access this resource" });
  }
  next();
};
