import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AdminUser from "../models/AdminUser.js";

const COOKIE_NAME = "admin_session";
const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day
const REMEMBER_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

function issueSession(res, user, { remember = false } = {}) {
  const maxAge = remember ? REMEMBER_MAX_AGE : DEFAULT_MAX_AGE;
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    subject: user.id.toString(),
    expiresIn: maxAge / 1000,
  });
  res.cookie(COOKIE_NAME, token, cookieOptions(maxAge));
}

export const signup = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const inviteCode = String(req.body.inviteCode || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  // Gate signup behind a shared invite code so random visitors can't
  // create admin accounts for themselves. Set ADMIN_SIGNUP_CODE in .env.
  if (process.env.ADMIN_SIGNUP_CODE && inviteCode !== process.env.ADMIN_SIGNUP_CODE) {
    return res.status(403).json({ message: "That invite code isn't valid." });
  }

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await AdminUser.create({ email, passwordHash });

  issueSession(res, user, { remember: true });
  res.status(201).json({ ok: true, email: user.email });
};

export const login = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const remember = Boolean(req.body.remember);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const genericError = "That email and password don't match our records.";
  const user = await AdminUser.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: genericError });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: genericError });
  }

  issueSession(res, user, { remember });
  res.json({ ok: true, email: user.email });
};

export const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
};

export const me = (req, res) => {
  res.json({ authenticated: true, email: req.admin.email });
};