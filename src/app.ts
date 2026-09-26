import express from "express";
import bodyparser from "body-parser";
import user_route from "./user_side/users_route";
import admin_route from "./admin_side/admin"
import cors from "cors";
import db_connection from "./mongo_db/db_connection";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(

  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-type", "Authorization"],
    credentials: true,
  }),
);
db_connection()
app.use("/api", user_route);
app.use("/admin", admin_route);
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
