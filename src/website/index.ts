import express from "express";
import cors from "cors";

export const port = process.env.EXPRESS_PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const api = express.Router();

api.get("/test", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.use("/api", api);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
