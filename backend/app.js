const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// 📁 storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 📤 upload route — forwards to Python AI service
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Build absolute path to the uploaded file
    const filePath = path.resolve(req.file.path);

    console.log(`📂 File uploaded: ${filePath}`);
    console.log(`🔄 Forwarding to Python AI service...`);

    // Call the Python Flask service at port 5001
    const pythonResponse = await axios.post("http://localhost:5001/analyze", {
      file_path: filePath,
    }, {
      timeout: 30000, // 30s timeout for large datasets
    });

    console.log(`✅ Analysis complete`);

    res.json({
      message: "File processed successfully",
      data: pythonResponse.data,
    });

  } catch (error) {
    console.error("❌ Analysis error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Python AI service is not running. Start it with: cd ai-service && python app.py",
      });
    }

    res.status(500).json({
      error: error.response?.data?.error || error.message || "Server error",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
  console.log("Make sure Python AI service is running on port 5001");
});