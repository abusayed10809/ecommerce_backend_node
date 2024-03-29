const User = require("../models/User");

const router = require("express").Router();

const cryptojs = require("crypto-js");
const jwt = require("jsonwebtoken");

// registration-----------------------------------------------------
router.post("/register", async (req, res) => {
  const newUser = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: cryptojs.AES.encrypt(
      req.body.password,
      process.env.PASSWORD_SECURITY
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

///
/// login -----------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    // find the user
    const user = await User.findOne({ userName: req.body.userName });
    !user && res.status(401).json("Wrong credentials!");

    // decrypt user objects password using secret key
    console.log("user is: " + user);
    const hashedPassword = cryptojs.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECURITY
    );
    const passwordString = hashedPassword.toString(cryptojs.enc.Utf8);
    console.log("password is: " + passwordString);

    // check if user object password match with form submitted password
    passwordString != req.body.password &&
      res.status(401).json("Wrong credentials!");

    // create an access token when
    // user is found
    // passwords is correct
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "3d" }
    );

    const { password, ...otherData } = user._doc;

    res.status(200).json({ ...otherData, accessToken });
    console.log("success");
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
