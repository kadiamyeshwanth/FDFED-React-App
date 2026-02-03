const jwt = require("jsonwebtoken");
const {
  JWT_SECRET,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_PASSKEY,
} = require("../config/constants");

module.exports = function authAdmin(req, res, next) {
  try {
    if (req.path === "/admin/login" || req.url === "/admin/login") {
      const { email, password, passKey } = req.body;

      if (
        email === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD &&
        passKey === ADMIN_PASSKEY
      ) {
        // Generate JWT token for admin
        const token = jwt.sign({ role: "admin" }, JWT_SECRET, {
          expiresIn: "1h",
        });
        res.cookie("admin_token", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          maxAge: 60 * 60 * 1000,
          path: "/",
        });
        return res.json({ message: "Admin authenticated", token });
      } else {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
    }

    const headerToken = req.header("Authorization")?.replace("Bearer ", "");
    const cookieToken = req.cookies?.admin_token;
    const token = headerToken || cookieToken;

    if (!token) {
      const err = new Error("Access Denied: No token provided");
      err.status = 401;
      return next(err);
    }

    const verified = jwt.verify(token, JWT_SECRET);
    if (verified.role !== "admin") {
      const err = new Error("Forbidden: Not an admin");
      err.status = 403;
      return next(err);
    }

    req.admin = verified;
    next();
  } catch (err) {
    const error = new Error("Invalid or expired token");
    error.status = 401;
    return next(error);
  }
};
