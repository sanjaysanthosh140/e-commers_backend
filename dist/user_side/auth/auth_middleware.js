"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hash_fun_1 = require("./hash_fun");
const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Please login to continue" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(header.slice(7), hash_fun_1.JWT_SECRET);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id)) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.userId = decoded.id;
        next();
    }
    catch (_a) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.authMiddleware = authMiddleware;
