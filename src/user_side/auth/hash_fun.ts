import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const rounds = 10;
const JWT_SECRET = "#0efsecretkey";

let hashpassword = (password: string) => {
  return bcrypt.hash(password, rounds);
};

let verifypass = (password: string, hashpass: string) => {
  return bcrypt.compare(password, hashpass);
};

let setjwttoken = (id: Types.ObjectId | string) => {
  return jwt.sign({ id: id.toString() }, JWT_SECRET, { expiresIn: "7d" });
};

export { hashpassword, verifypass, setjwttoken, JWT_SECRET };
