// server.js - Main backend server for C-VisioN Resume Analyzer
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
require("dotenv").config();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Resume analysis functions
class ResumeAnalyzer {
  constructor() {
    this.skillKeywords = [
      "javascript",
      "python",
      "java",
      "react",
      "angular",
      "vue",
      "node.js",
      "express",
      "mongodb",
      "sql",
      "postgresql",
      "mysql",
      "aws",
      "azure",
      "docker",
      "kubernetes",
      "git",
      "github",
      "ci/cd",
      "agile",
      "scrum",
      "html",
      "css",
      "bootstrap",
      "tailwind",
    ];

    this.projectKeywords = [
      "developed",
      "built",
      "created",
      "designed",
      "implemented",
      "deployed",
      "project",
      "application",
      "website",
      "system",
      "platform",
      "tool",
    ];

    this.industryKeywords = [
      "software engineer",
      "full stack",
      "frontend",
      "backend",
      "developer",
      "programmer",
      "architect",
      "analyst",
      "manager",
      "lead",
      "senior",
    ];
  }

  async analyzeResume(text) {
    const analysis = {
      overallRating: this.calculateOverallRating(text),
      extractedHighlights: this.extractHighlights(text),
      professionalSummary: this.generateProfessionalSummary(text),
      sectionImprovements: this.generateSectionImprovements(text),
      strengths: this.identifyStrengths(text),
      improvements: this.suggestImprovements(text),
    };

    analysis.overallScore = analysis.overallRating * 10;
    return analysis;
  }

  calculateOverallRating(text) {
    let score = 5; // Base score
    const textLower = text.toLowerCase();

    // Check for contact info
    if (textLower.includes("@") && textLower.includes(".com")) score += 0.5;
    if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text)) score += 0.5;

    // Check for skills
    const skillCount = this.skillKeywords.filter((skill) =>
      textLower.includes(skill.toLowerCase())
    ).length;
    score += Math.min(skillCount * 0.2, 2);

    // Check for experience indicators
    if (/\b(years?|months?)\s+(of\s+)?experience\b/i.test(text)) score += 0.5;
    if (/\b(led|managed|developed|created|built)\b/i.test(text)) score += 0.5;

    // Check for quantified achievements
    if (
      /\b\d+%\b/.test(text) ||
      /\$\d+/.test(text) ||
      /\b\d+\s+(users|customers|projects)\b/i.test(text)
    ) {
      score += 1;
    }

    return Math.min(Math.round(score * 10) / 10, 10);
  }

  extractHighlights(text) {
    const textLower = text.toLowerCase();

    // Extract skills
    const skills = this.skillKeywords
      .filter((skill) => textLower.includes(skill.toLowerCase()))
      .slice(0, 8);

    // Extract potential projects (sentences with project keywords)
    const sentences = text.split(/[.!?]+/);
    const projects = sentences
      .filter((sentence) =>
        this.projectKeywords.some((keyword) =>
          sentence.toLowerCase().includes(keyword)
        )
      )
      .slice(0, 3)
      .map((project) => project.trim().substring(0, 100) + "...");

    // Extract industry keywords
    const keywords = this.industryKeywords
      .filter((keyword) => textLower.includes(keyword.toLowerCase()))
      .slice(0, 5);

    return { skills, projects, keywords };
  }

  generateProfessionalSummary(text) {
    const textLower = text.toLowerCase();

    // Determine experience level
    const experienceMatch = text.match(/\b(\d+)\s*\+?\s*(years?|yrs?)\b/i);
    const experience = experienceMatch ? parseInt(experienceMatch[1]) : 2;

    // Determine primary role
    let role = "Professional";
    if (
      textLower.includes("software engineer") ||
      textLower.includes("developer")
    ) {
      role = "Software Engineer";
    } else if (
      textLower.includes("data scientist") ||
      textLower.includes("analyst")
    ) {
      role = "Data Analyst";
    } else if (textLower.includes("designer")) {
      role = "Designer";
    } else if (textLower.includes("manager")) {
      role = "Manager";
    }

    // Generate summary
    const summaries = [
      `Experienced ${role.toLowerCase()} with ${experience}+ years building scalable solutions and leading cross-functional teams. Passionate about creating innovative products that drive business growth and deliver exceptional user experiences.`,
      `Results-driven ${role.toLowerCase()} with ${experience}+ years of experience in developing high-performance applications and technical leadership. Expert in modern technologies with a proven track record of delivering impactful solutions.`,
      `Dynamic ${role.toLowerCase()} with ${experience}+ years specializing in end-to-end product development and team collaboration. Committed to leveraging cutting-edge technologies to solve complex business challenges.`,
    ];

    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  generateSectionImprovements(text) {
    const improvements = {
      experience: [
        'Add specific metrics and quantified achievements (e.g., "increased efficiency by 40%")',
        "Include technologies and tools used in each role",
        "Highlight leadership responsibilities and team sizes",
      ],
      skills: [
        "Organize skills by category (Programming Languages, Frameworks, Tools)",
        "Add proficiency levels or years of experience",
        "Include both technical and soft skills",
      ],
      education: [
        "Include relevant coursework and academic projects",
        "Add GPA if above 3.5",
        "Mention academic achievements or honors",
      ],
      projects: [
        "Provide links to live demos or GitHub repositories",
        "Quantify project impact and user metrics",
        "Highlight specific technologies and methodologies used",
      ],
    };

    return improvements;
  }

  identifyStrengths(text) {
    const strengths = [];
    const textLower = text.toLowerCase();

    if (
      this.skillKeywords.filter((skill) => textLower.includes(skill)).length > 5
    ) {
      strengths.push(
        "Strong technical skill set with diverse technology stack"
      );
    }

    if (/\b(led|managed|supervised)\b/i.test(text)) {
      strengths.push("Demonstrated leadership and management experience");
    }

    if (/\b\d+%\b/.test(text) || /\$\d+/.test(text)) {
      strengths.push("Includes quantified achievements and measurable impact");
    }

    if (
      textLower.includes("education") ||
      textLower.includes("university") ||
      textLower.includes("degree")
    ) {
      strengths.push("Strong educational background");
    }

    if (text.length > 1000) {
      strengths.push("Comprehensive and detailed resume content");
    }

    return strengths.length > 0
      ? strengths
      : ["Well-structured resume format", "Clear presentation of information"];
  }

  suggestImprovements(text) {
    const improvements = [];
    const textLower = text.toLowerCase();

    if (!/\b\d+%\b/.test(text) && !/\$\d+/.test(text)) {
      improvements.push(
        "Add quantified achievements with specific metrics and numbers"
      );
    }

    if (!textLower.includes("github") && !textLower.includes("portfolio")) {
      improvements.push(
        "Include links to portfolio, GitHub, or personal website"
      );
    }

    if (!/\b(led|managed|collaborated)\b/i.test(text)) {
      improvements.push(
        "Highlight leadership experience and teamwork examples"
      );
    }

    if (
      this.skillKeywords.filter((skill) => textLower.includes(skill)).length < 3
    ) {
      improvements.push(
        "Expand technical skills section with relevant technologies"
      );
    }

    return improvements.length > 0
      ? improvements
      : ["Consider adding more industry-specific keywords"];
  }
}

// Routes
const analyzer = new ResumeAnalyzer();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "C-VisioN Backend is running" });
});

// Analyze resume endpoint
app.post("/api/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Parse PDF
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    // Analyze resume
    const analysis = await analyzer.analyzeResume(text);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      analysis,
      metadata: {
        filename: req.file.originalname,
        fileSize: req.file.size,
        textLength: text.length,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Failed to analyze resume",
      message: error.message,
    });
  }
});

// Get sample analysis (for demo)
app.get("/api/sample", (req, res) => {
  const sampleAnalysis = {
    overallRating: 8,
    overallScore: 80,
    extractedHighlights: {
      skills: [
        "React",
        "JavaScript",
        "Python",
        "AWS",
        "Git",
        "SQL",
        "Docker",
        "Node.js",
      ],
      projects: [
        "Real-time Chat Application with Socket.io",
        "E-commerce Dashboard with Analytics",
        "AI-powered Resume Analyzer (C-VisioN)",
      ],
      keywords: [
        "Software Engineer",
        "Full Stack Developer",
        "Frontend Development",
        "Backend APIs",
        "Cloud Computing",
      ],
    },
    professionalSummary:
      "Innovative software engineer with 4+ years developing high-performance web applications and leading technical initiatives. Expert in modern JavaScript frameworks with a proven track record of delivering scalable solutions that drive business growth.",
    sectionImprovements: {
      experience: [
        'Include specific impact metrics (e.g., "improved performance by 40%")',
        "Add team size and leadership responsibilities",
      ],
      skills: [
        "Group technical skills by proficiency level",
        "Add soft skills relevant to your target role",
      ],
      education: [
        "Include relevant academic projects",
        "Mention any honors or distinctions",
      ],
      projects: [
        "Add deployment links or GitHub repositories",
        "Quantify project outcomes and user impact",
      ],
    },
    strengths: [
      "Excellent technical depth and breadth",
      "Strong project portfolio showcasing real-world applications",
      "Clear demonstration of full-stack capabilities",
      "Professional formatting and structure",
    ],
    improvements: [
      "Add more quantified achievements with specific metrics",
      "Include leadership and collaboration examples",
      "Expand on problem-solving methodologies",
      "Add links to live projects or portfolio",
    ],
  };

  res.json({ success: true, analysis: sampleAnalysis });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 10MB." });
    }
  }

  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 C-VisioN Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(
    `🔍 Analysis endpoint: POST http://localhost:${PORT}/api/analyze`
  );
});
