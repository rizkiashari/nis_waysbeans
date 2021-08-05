require("dotenv").config();

const express = require("express");
const cors = require("cors");
const router = require("./src/routes");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1", router);
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => console.log(`Server on Port ${PORT}`));
