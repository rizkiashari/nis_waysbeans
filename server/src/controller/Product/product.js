const { Product, User, Roll } = require("../../../models");

// Get All Product
exports.getProducts = async (req, res) => {
  const path = process.env.PATH_PRODUCT;
  try {
    let products = await Product.findAll({
      attributes: {
        exclude: ["updatedAt"],
      },
      Orders: [["createdAt", "DESC"]],
    });
    //products = JSON.parse(JSON.stringify(products));
    products = products.map((product) => {
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        stock: product.stock,
        photo: product.photo ? path + product.photo : null,
      };
    });
    res.status(200).send({
      status: "success",
      message: "Get All Product",
      data: {
        products,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Get Product not Found",
    });
  }
};

// Get Product by Id
exports.getProductById = async (req, res) => {
  try {
    const path = process.env.PATH_PRODUCT;

    const productOne = await Product.findOne({
      where: {
        id: req.params.id,
      },
      attributes: {
        exclude: ["updatedAt"],
      },
    });
    res.status(200).send({
      status: "success",
      message: "Get Product by Id",
      data: {
        product: {
          id: productOne.id,
          name: productOne.name,
          price: productOne.price,
          description: productOne.description,
          stock: productOne.stock,
          photo: productOne.photo ? path + productOne.photo : null,
          createdAt: productOne.createdAt,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Get Product Id not Found",
    });
  }
};

// Add Product
exports.addProduct = async (req, res) => {
  try {
    const userValid = await User.findOne({
      where: {
        id: req.idUser,
      },
      include: {
        model: Roll,
        as: "rolls",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password", "listId"],
      },
    });
    if (userValid.rolls.name === "Owner") {
      const path = process.env.PATH_PRODUCT;
      const product = req.body;

      const productOne = await Product.create({
        ...product,
        photo: req.files.photo[0].filename,
      });

      let dataProduct = await Product.findOne({
        where: {
          name: productOne.name,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt", "cityId"],
        },
      });

      dataProduct = JSON.parse(JSON.stringify(dataProduct));
      res.status(200).send({
        status: "success",
        message: "Add Product berhasil",
        data: {
          product: {
            id: dataProduct.id,
            name: dataProduct.name,
            price: dataProduct.price,
            description: dataProduct.description,
            stock: dataProduct.stock,
            photo: dataProduct.photo ? path + dataProduct.photo : null,
          },
        },
      });
    } else {
      res.status(500).send({
        status: "failed",
        message: `gagal add product, kamu ${userValid.rolls.name}`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "product add invalid",
    });
  }
};
