const express = require("express");
const cors = require("cors");

require("dotenv").config();

// app
const app = express();

const Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// middleware
app.use(express.json({ limit: "5mb" }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello Wold");
});

// app.post("/pay", async (req, res) => {
//   await Stripe.charges.create({
//     source: req.body.token.id,
//     amount: req.body.amount,
//     currency: "usd",
//   });
// });

app.post("/api/create-checkout-session", async (req, res) => {
  const { products } = req.body;

  const lineItems = products.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product.title,
        images: [product.image],
      },
      unit_amount: product.price * 100,
    },
    quantity: product.quantity,
  }));
  const session = await Stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/payment?session_id={CHECKOUT_SESSION_ID}`,
  });

  res.json({ id: session.id });
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on Port ${port}`);
});
