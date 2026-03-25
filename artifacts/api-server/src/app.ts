import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api", router);

const root = process.cwd();
const portalDist = path.join(root, "artifacts/portal-cliente/dist/public");
const boticarioDist = path.join(root, "artifacts/boticario/dist/public");

const noCache = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};

const noCacheFor = (filenames: string[]) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const shouldNoCache = filenames.some(f => req.path === "/" || req.path.includes(f));
  if (shouldNoCache) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
};

app.use("/portal-cliente", noCacheFor(["index.html", "sw.js", "manifest"]));
app.use("/portal-cliente", express.static(portalDist));
app.get("/portal-cliente/*splat", noCache, (_req, res) => {
  res.sendFile(path.join(portalDist, "index.html"));
});

app.use("/", noCacheFor(["index.html", "sw.js", "manifest"]));
app.use("/", express.static(boticarioDist));
app.get("*splat", noCache, (_req, res) => {
  res.sendFile(path.join(boticarioDist, "index.html"));
});

export default app;
