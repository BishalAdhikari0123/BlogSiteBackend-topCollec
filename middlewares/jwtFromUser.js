import jwt from "jsonwebtoken";

/**
 * Middleware to extract userId from the Authorization Bearer token.
 * Attaches userId to the request object if token is valid.
 * Returns 401 or 403 status if token is missing or invalid.
 */
const getUserfromAuthToken = async (req, res, next) => {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7) // remove "Bearer "
      : null;

    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    // Verify JWT token using the secret from process.env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If decoded is a string (which shouldn't be the case), deny access
    if (typeof decoded === "string") {
      return res.status(403).json({ message: "You are not authorized" });
    }

    // Attach userId from token payload to request object
    req.userId = decoded.userId;
    console.log("Authenticated userId:", req.userId);

    next();
  } catch (e) {
    console.error("Authentication error:", e.message || e);
    res.status(401).json({ message: e.message || "Authentication failed" });
  }
};

export default getUserfromAuthToken;
