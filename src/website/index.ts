import express from "express";
import cors from "cors";
import apiRouter from "./router/apiRouter";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
export const port = process.env.EXPRESS_PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.use(express.static(path.join(__dirname, "frontend")));

if (process.env.DEVELOPMENT === "true") {
  app.use(
    createProxyMiddleware({
      target: "http://127.0.0.1:3005",
      changeOrigin: true,
    })
  );
} else {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/index.html"));
  });
}
export default app;
export function startServer() {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
  });
}
