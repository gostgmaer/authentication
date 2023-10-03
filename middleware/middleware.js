// Middleware for token validation
function authenticateToken(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, "your-secret-key", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Retrieve session data from Redis using the decoded user ID
    const userId = decoded.userId;

    asyncGet(userId)
      .then((storedToken) => {
        if (storedToken !== token) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        // User is authenticated
        req.userId = userId;
        next();
      })
      .catch((error) => {
        console.error("Error retrieving token from Redis:", error);
        res.status(500).json({ message: "Internal Server Error" });
      });
  });
}

module.exports = {
    authenticateToken
  };