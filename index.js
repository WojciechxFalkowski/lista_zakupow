const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require('express-session');
dotenv.config();
// const passport = require("passport");
// const { loginCheck } = require("./auth/passport");
// loginCheck(passport);

// Mongo DB conncetion
const database = process.env.MONGOLAB_URI;
console.log('database')
console.log(database)
mongoose
  .connect(database)
  .then(() => console.log("connected"))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");

//BodyParsing
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'oneboy',
  saveUninitialized: true,
  resave: true
}));


//Routes
// app.use("/", require("./routes/login"));

const Product = require('./models/Product');

app.get('/', async (req, res) => {
  const products = await Product.find();
  res.render('index', { products: products });
});

app.post('/add-product', async (req, res) => {
  const productName = req.body.name;
  const newProduct = new Product({ name: productName, purchased: false });
  await newProduct.save();
  res.redirect('/');
});

app.post('/toggle-purchase/:id', async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  product.purchased = !product.purchased;
  await product.save();
  res.redirect('/');
});

app.post('/delete-product/:id', async (req, res) => {
  const productId = req.params.id;
  await Product.deleteOne({ _id: productId });
  res.redirect('/');
});

const PORT = process.env.PORT || 4111;

app.listen(PORT, console.log("Server has started at port " + PORT));