const Order = require("../models/Order");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

/* 
create new order ----------------------------------------------------------------
- when user will checkout
*/
router.post("/", verifyToken, async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* 
UPDATE ----------------------------------------------------------------
- only admin can update a created order
- id params ->>> order id
*/
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* 
DELETE ----------------------------------------------------------------
- id param ->>> order id
 */
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

/* 
GET USER ORDER ------------------------------------------------------
- show all user orders
*/
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.params.userId,
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* 
GET ALL ----------------------------------------------------------------
 */
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* 
GET MONTHLY INCOME ----------------------------------------------------------
*/
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  try {
    const productId = req.query.pid;
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(
      new Date().setMonth(lastMonth.getMonth() - 1)
    );
    const income = await Order.aggregate([
      // filter by the last two months
      // date greater than current month - 2 months
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      // create two new variables
      // month will hold the month values extracting month from createdAt date
      // sales will hold the amount values
      {
        $project: {
          month: {
            $month: "$createdAt",
          },
          sales: "$amount",
        },
      },
      // group by month value
      // total will hold the sum of all sales value for that month
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
