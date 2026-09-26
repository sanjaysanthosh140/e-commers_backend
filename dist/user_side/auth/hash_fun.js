"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.setjwttoken = exports.verifypass = exports.hashpassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const rounds = 10;
const JWT_SECRET = "#0efsecretkey";
exports.JWT_SECRET = JWT_SECRET;
let hashpassword = (password) => {
    return bcrypt_1.default.hash(password, rounds);
};
exports.hashpassword = hashpassword;
let verifypass = (password, hashpass) => {
    return bcrypt_1.default.compare(password, hashpass);
};
exports.verifypass = verifypass;
let setjwttoken = (id) => {
    return jsonwebtoken_1.default.sign({ id: id.toString() }, JWT_SECRET, { expiresIn: "7d" });
};
exports.setjwttoken = setjwttoken;
