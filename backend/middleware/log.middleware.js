// backend/middleware/log.middleware.js
export const activityLogger = (req, res, next) => {
  const user = req.session?.user;
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${
      user ? user.username + " (" + user.role + ")" : "Guest"
    }`
  );
  next();
};
