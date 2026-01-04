import express from "express";
import routes from "./routes/routes.ts";

const app = express();
app.use(express.json());
routes(app);

export default app;