const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
//CrmTZ7Eqsh4IHQmnrSZf8XwnhgWbwJEh29BaC67kF4zMtNfbkTvYM761v8IXXPOl
dotenv.config();

const app = express();

// MongoDB connection
const database = process.env.MONGOLAB_URI;
console.log('Database URL:', database);

mongoose
  .connect(database, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database connection error:", err));

// Middleware for parsing JSON bodies
app.use(express.json());

// Enable CORS for all routes and origins
app.use(cors());

// Model
const Product = require('./models/Product');

// Get all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new product
app.post('/products', async (req, res) => {
  const { name } = req.body;
  const newProduct = new Product({ name: name, purchased: false });

  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Toggle purchase status of a product
app.patch('/products/:id/toggle-purchase', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.purchased = !product.purchased;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a product
app.delete('/products/:id', async (req, res) => {
  try {
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 411;

app.listen(PORT, () => console.log("Server has started at port " + PORT));
