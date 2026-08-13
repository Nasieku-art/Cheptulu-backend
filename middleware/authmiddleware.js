import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  const token = req.cookies?.admin_session;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }
}