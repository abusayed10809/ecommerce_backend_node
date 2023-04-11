const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const User = require("../models/User");
const router = require("express").Router();

/* 
verification -------------------------------- 
verifyTokenAndAuthorization ->>> acts as the middleware for token verification
*/
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  // encrypt req provided password
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASSWORD_SECURITY
    ).toString();
  }

  try {
    // finds a user id and update that user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json(error);
  }
});

/// delete --------------------------------
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json("User deleted successfully.");
  } catch (error) {
    return res.status(500).json(error);
  }
});

/// get user --------------------------------
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...otherData } = user._doc;
    return res.status(200).json(otherData);
  } catch (error) {
    return res.status(500).json(error);
  }
});

/// get all users --------------------------------
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json(error);
  }
});

/// get user stats --------------------------------
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    // aggregates list of users
    // all users created before last year
    const data = await User.aggregate([
      // filtering created at field
      {
        $match: {
          createdAt: {
            $gte: lastYear,
          },
        },
      },
      // creating new field name month
      // month field has $month extracted from created at field
      {
        $project: {
          month: {
            $month: "$createdAt",
          },
        },
      },
      // fetching every distinct month
      // counting total number of instances of that month in the db
      {
        $group: {
          _id: "$month",
          total: {
            $sum: 1,
          },
        },
      },
    ]);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
