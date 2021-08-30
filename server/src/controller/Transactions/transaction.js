const { Product, User, Orders, Roll, transaction } = require("../../../models");
const Joi = require("joi");

// Get Transaction All
exports.getAllTransaction = async (req, res) => {
  try {
    const transactions = await transaction.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId"],
      },
      orders: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: Product,
          as: "Products",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          through: {
            attributes: [["orderQuantity", "qty"]],
            as: "orderQuantity",
          },
        },
      ],
    });

    if (!transactions) {
      return res.status(500).send({
        status: "User Tidak Tersedia",
        data: {
          transactions,
        },
      });
    }
    res.status(200).send({
      status: "success",
      message: "Transaction Get All Success",
      data: { transactions },
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).send({
      status: "failed",
      message: "Get Transaction Invalid",
    });
  }
};
// Get Transaction by Id
exports.getSingleTransactionId = async (req, res) => {
  try {
    const trxOne = await transaction.findOne({
      where: {
        id: req.params.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: Product,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          through: {
            model: Orders,
            as: "orders",
            attributes: ["orderQuantity"],
          },
        },
      ],
    });

    res.status(200).send({
      status: "success",
      message: "Transaction Get Success",
      data: {
        transaction: trxOne,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Get Transaction id Invalid",
    });
  }
};
// Add Transaction
exports.addTransaction = async (req, res) => {
  try {
    const path = process.env.PATH_TRANSACTION;
    const { body } = req.body;
    const schema = Joi.object({
      name: Joi.string().min(4).required(),
      email: Joi.string().email().required(),
      postCode: Joi.number().required(),
      phone: Joi.string().required(),
      address: Joi.string().min(5).required(),
      products: Joi.string().required(),
      attachment: Joi.string().required(),
    });

    const { error } = schema.validate(body);
    if (error) {
      return res.status(200).send({
        status: "failed",
        message: error.details[0].message,
      });
    }
    const { name, email, postCode, phone, address, products, attachment } =
      req.body;
    const transactions = await transaction.create({
      name,
      email,
      postCode,
      phone,
      address,
      attachment: path + req.files.attachment[0].filename,
      status: "Waiting Approve",
      userId: req.idUser,
    });

    const dataProduct = JSON.parse(products);
    await Promise.all(
      dataProduct.map(async (product) => {
        const { id, orderQuantity } = product;
        console.log("Aku Product: ", product);
        await Orders.create({
          transactionId: transactions.id,
          productId: id,
          orderQuantity: orderQuantity,
        });
      })
    );

    const transactionAfter = await transaction.findOne({
      where: { id: transactions.id },
      attributes: {
        exclude: ["createdAt", "updatedAt", "userId"],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: Product,
          as: "Products",
          attributes: {
            exclude: ["createdAt", "updatedAt", "stock"],
          },
          through: {
            as: "orderQuantity",
            attributes: [["orderQuantity", "qty"]],
          },
        },
      ],
    });

    res.status(200).send({
      status: "success",
      message: "Transaction Created Success",
      data: {
        transaction: transactionAfter,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Add Transaction Invalid",
    });
  }
};

// Update Transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { body } = req;

    const schema = Joi.object({
      status: Joi.string().min(4).required(),
    });
    const { error } = schema.validate(body);
    if (error) {
      return res.status(200).send({
        status: "failed",
        message: error.details[0].message,
      });
    }
    const getTransactionId = await transaction.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!getTransactionId) {
      return res.status(400).send({
        status: "failed",
        message: `Transaction ${req.params.id} Not Found`,
      });
    }

    const transactioUpdate = await transaction.update(body, {
      where: {
        id: req.params.id,
      },
    });
    const getTransctions = await transaction.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: Product,
          attributes: {
            exclude: ["createdAt", "updatedAt", "stock"],
          },
          through: {
            attributes: [["orderQuantity", "value"]],
            as: "orderQuantity",
          },
        },
      ],
    });
    res.status(200).send({
      status: "success",
      message: "Transaction Updated Success",
      data: {
        transaction: getTransctions,
      },
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      status: "failed",
      message: "Update Transaction Invalid",
    });
  }
};
// Delete Transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const getTransactionId = await transaction.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!getTransactionId) {
      return res.status(400).send({
        status: "failed",
        message: `Transaction ${req.params.id} Not Found`,
      });
    }
    const transactionDelete = await transaction.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).send({
      status: "success",
      message: "Transaction Deleted Success",
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      status: "failed",
      message: "Delete Transaction Invalid",
    });
  }
};
// My Transaction
exports.myTransaction = async (req, res) => {
  try {
    const path = process.env.PATH_PRODUCT;
    const transactions = await transaction.findAll({
      where: {
        userId: req.idUser,
      },
      attributes: {
        exclude: ["updatedAt", "userId"],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: Product,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          through: {
            attributes: [["orderQuantity", "qty"]],
            as: "orderQuantity",
          },
        },
      ],
    });

    if (transactions.length === 0) {
      return res.status(500).send({
        status: "User Tidak Tersedia",
        data: null,
      });
    }
    res.status(200).send({
      status: "success",
      message: "Transaction Get All Success",
      data: {
        transactions,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "My Transaction Invalid",
    });
  }
};

// Update Stock
exports.updateStock = async (req, res) => {
  try {
    const { body, params } = req;

    await transaction.update(body, {
      where: {
        id: req.params.id,
      },
    });
    console.log("body: ", body);
    body.Products.map(async (item) => {
      const quantity = item.orderQuantity.qty;
      let productId = "";
      const itemProduct = await Product.findOne({
        where: {
          id: item.id,
        },
      });
      console.log("ItemProduct", itemProduct);
      productId = itemProduct.dataValues;
      productId = {
        ...productId,
        stock: +productId.stock - +quantity,
      };
      await Product.update(productId, {
        where: {
          id: item.id,
        },
      });
    });

    const afterUpdate = await transaction.findOne({
      where: {
        id: req.params.id,
      },
      attributes: {
        exclude: ["updatedAt", "userId", "createdAt"],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        {
          model: Product,
          as: "Products",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          through: {
            attributes: [["orderQuantity", "qty"]],
            as: "orderQuantity",
          },
        },
      ],
    });
    res.status(200).send({
      status: "success",
      message: "Stock Updated Success",
      data: afterUpdate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Update Stock Invalid",
    });
  }
};
