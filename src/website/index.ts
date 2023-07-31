import express from "express";
import cors from "cors";
import apiRouter from "./router/apiRouter";
import { createProxyMiddleware } from "http-proxy-middleware";

export const port = process.env.EXPRESS_PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/api", apiRouter);
if(process.env.DEVELOPMENT === "true"){
  app.use(createProxyMiddleware({ target: 'http://127.0.0.1:3005', changeOrigin: true }));
}else{
  app.use(express.static("./frontend"));
}
export default app;
export function startServer() {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
  });
}
