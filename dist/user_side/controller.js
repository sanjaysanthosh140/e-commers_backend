"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user_login = exports.user_signup = void 0;
const user_1 = __importDefault(require("../mongo_db/Schemas/user"));
const hash_fun_1 = require("./auth/hash_fun");
let user_signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }
        const existing = yield user_1.default.findOne({ email: String(email).toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: "Email already registered" });
        }
        const hash = yield (0, hash_fun_1.hashpassword)(password);
        const user = yield user_1.default.create({
            name,
            email,
            password: hash,
        });
        const token = (0, hash_fun_1.setjwttoken)(user._id);
        res.status(201).json({
            message: "Signup successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Signup failed",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.user_signup = user_signup;
let user_login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = yield user_1.default.findOne({ email: String(email).toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const match = yield (0, hash_fun_1.verifypass)(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = (0, hash_fun_1.setjwttoken)(user._id);
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.user_login = user_login;
