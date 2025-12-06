import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config.js";
import { connectDB } from "./config/db.js";
import { activityLogger } from "./middleware/log.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import requestRoutes from "./routes/request.routes.js";
import reportRoutes from "./routes/report.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;


app.use(
  cors({
    origin: ["http://localhost:5173"], // add prod URL here
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: "10kb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 60 * 60 * 24,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(activityLogger);

// main server route
app.get("/", (req, res) => {
  res.send("Project Management System API is running");
});
// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/reports", reportRoutes);

// global error handler (optional)
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
