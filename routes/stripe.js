const router = require("express").Router();
// const stripe = require("stripe")(process.env.STRIPE_KEY);
const stripe = require("stripe")(
  "sk_test_51MwZWrD4Mmtyc8EQOA1rc0BP71KwcgKxVTpnoCiadza3xbATxFaDXk9roHKK05NaG2KRfpzjd4GrzumSDIYc3iEZ00QXR28mhR"
);

router.post("/payment", (req, res) => {
  console.log("stripe payment api request");
  stripe.charges.create(
    {
      source: req.body.tokenId,
      amount: req.body.amount,
      currency: "usd",
    },
    (stripeErr, stripeRes) => {
      if (stripeErr) {
        console.log("stripe error");
        console.log(stripeErr);
        res.status(500).json(stripeErr);
      } else {
        res.status(200).json(stripeRes);
      }
    }
  );
});

module.exports = router;
