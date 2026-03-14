import express from "express";

const app = express();

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "AI Music Recommendation API is running 🚀",
  });
});

// Health check route
app.get("/healthz", (req, res) => {
  res.json({
    status: "ok",
  });
});

export default app;