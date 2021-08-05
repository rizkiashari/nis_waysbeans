const { Router } = require("express");
const {
  getProducts,
  addProduct,
  getProductById,
} = require("../controller/Product/product");
const {
  addTransaction,
  getAllTransaction,
  getSingleTransactionId,
  myTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controller/Transactions/transaction");
const {
  createUser,
  login,
  checkAuth,
  getUserById,
  updateUser,
} = require("../controller/User/user");
const { auth } = require("../middleware/auth");
const { uploadFile } = require("../middleware/uploadFile");

const router = Router();

// Endpoint
// Sign Up
router.post("/register", createUser);
// Sign In
router.post("/login", login);
// Get User Id
router.get("/users/:id", getUserById);
// Update
router.patch("/users/:id", auth, uploadFile("profile"), updateUser);
// Check Auth
router.get("/check-auth", auth, checkAuth);
// Get Products
router.get("/products", getProducts);
// Get Product By id
router.get("/product/:id", getProductById);
// Add Product
router.post("/product", auth, uploadFile("photo"), addProduct);

// Add Transaction
router.post("/transaction", auth, uploadFile("attachment"), addTransaction);
// Get All Transactions
router.get("/transactions", auth, getAllTransaction);
// Get Transactions By Id
router.get("/transaction/:id", auth, getSingleTransactionId);
// Update Transaction
router.patch("/transaction/:id", auth, updateTransaction);
// Delete Transaction
router.delete("/transaction/:id", auth, deleteTransaction);
// My transactions
router.get("/my-transactions", auth, myTransaction);

module.exports = router;
