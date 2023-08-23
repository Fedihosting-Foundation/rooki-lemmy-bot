import express from "express";
import cors from "cors";
import apiRouter from "./router/apiRouter";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import morgan from "morgan";
export const port = process.env.EXPRESS_PORT || 3000;

const app = express();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(cors({allowedHeaders: "*"}));
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));



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
