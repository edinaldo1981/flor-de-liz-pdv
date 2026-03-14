import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api", router);

const root = process.cwd();
const portalDist = path.join(root, "artifacts/portal-cliente/dist/public");
const boticarioDist = path.join(root, "artifacts/boticario/dist/public");

app.use("/portal-cliente", express.static(portalDist));
app.get("/portal-cliente/*splat", (_req, res) => {
  res.sendFile(path.join(portalDist, "index.html"));
});

app.use("/", express.static(boticarioDist));
app.get("*splat", (_req, res) => {
  res.sendFile(path.join(boticarioDist, "index.html"));
});

export default app;
