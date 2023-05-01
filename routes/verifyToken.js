const jwt = require("jsonwebtoken");

/* 
verify json webtoken
*/
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  console.log("token is ->>> " + token);
  // if header is available
  if (authHeader) {
    // verify token with secret key
    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, user) => {
      if (error) {
        res.status(403).json("Invalid token");
      }
      // extracts the user from token payload
      // putting that user in request object
      // moving onto the next middleware function
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated. No web token.");
  }
};

/* 
  verify token and authorization --------------------------------
*/
const verifyTokenAndAuthorization = (req, res, next) => {
  // check for token verification
  verifyToken(req, res, () => {
    // req.user is the token payload
    // req.user has two fields as specified when creating the token
    // 1. id
    // 2. isAdmin
    if (req.user.id === req.params.id) {
      next();
    } else {
      res.status(403).json("Action is not allowed by user!");
    }
  });
};

/* 
  verify token and admin --------------------------------
*/
const verifyTokenAndAdmin = (req, res, next) => {
  // check if user is admin or not
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("Action is not allowed by user!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
