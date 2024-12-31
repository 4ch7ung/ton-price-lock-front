const express = require("express");
const path = require("path");
const compression = require("compression");

const app = express();
app.use(compression());

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
