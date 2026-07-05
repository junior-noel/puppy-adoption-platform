import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import "./config/cloudinary.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import initSocket from "./sockets/socketHandler.js";
import authRoutes from "./routes/authRoutes.js";
import shelterRoutes from "./routes/shelterRoutes.js";
import puppyRoutes from "./routes/puppyRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import successStoryRoutes from "./routes/successStoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Allowed origins — main URL + any Vercel preview deployment URL
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://puppy-adoption-platform.vercel.app",
  /^https:\/\/puppy-adoption-platform.*\.vercel\.app$/,
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    const allowed = ALLOWED_ORIGINS.some((o) =>
      typeof o === "string" ? o === origin : o.test(origin),
    );

    if (allowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`CORS origin not allowed: ${origin}`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/shelters", shelterRoutes);
app.use("/api/puppies", puppyRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stories", successStoryRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = ALLOWED_ORIGINS.some((o) =>
        typeof o === "string" ? o === origin : o.test(origin),
      );
      callback(allowed ? null : new Error("Socket CORS blocked"), allowed);
    },
    credentials: true,
  },
});

initSocket(io);

const PORT = Number(process.env.PORT) || 5000;
const FALLBACK_PORT = PORT + 1;

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    if (error.port === PORT) {
      console.warn(`Port ${PORT} in use, trying ${FALLBACK_PORT}...`);
      server.listen(FALLBACK_PORT);
      return;
    }
    console.error(`Port ${error.port} is in use.`);
    process.exit(1);
  }
  throw error;
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
