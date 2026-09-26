"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const users_route_1 = __importDefault(require("./user_side/users_route"));
const admin_1 = __importDefault(require("./admin_side/admin"));
const cors_1 = __importDefault(require("cors"));
const db_connection_1 = __importDefault(require("./mongo_db/db_connection"));
const app = (0, express_1.default)();
const PORT = 8080;
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-type", "Authorization"],
    credentials: true,
}));
(0, db_connection_1.default)();
app.use("/api", users_route_1.default);
app.use("/admin", admin_1.default);
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});
