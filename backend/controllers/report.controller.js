import { AccessRequest } from "../models/accessRequest.model.js";

export const fetchReports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");
  // Optional but nice for browsers
  res.setHeader("Cache-Control", "no-cache");

  try {
    const cursor = AccessRequest.find()
      .populate("project", "name email")
      .populate("client", "username")
      .sort({ createdAt: -1 })
      .cursor();

    res.write("[");

    let isFirst = true;

    cursor
      .on("data", (doc) => {
        if (!isFirst) res.write(",");
        else isFirst = false;
        res.write(JSON.stringify(doc));
      })
      .on("end", () => {
        res.write("]");
        res.end();
      })
      .on("error", (err) => {
        console.error(err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: "Stream error" });
        } else {
          res.end();
        }
      });
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

export default { fetchReports };
