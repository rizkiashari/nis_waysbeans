const { User, Roll } = require("../../../models");
const joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Sign Up
exports.createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = req.body;

    const schema = joi.object({
      fullname: joi.string().min(3).required(),
      email: joi.string().email().required(),
      password: joi.string().min(6).required(),
      listId: joi.number(),
    });

    const { error } = schema.validate(userData);

    if (error) {
      return res.status(500).send({
        status: "failed",
        message: error.details[0].message,
      });
    }

    // Check Email
    const checkEmail = await User.findOne({
      where: {
        email,
      },
    });

    if (checkEmail) {
      return res.status(500).send({
        status: "failed",
        message: "Email already exists",
      });
    }

    // Hash Password
    const hashStrenght = 10;
    const hashedPassword = await bcrypt.hash(password, hashStrenght);

    const dataUser = await User.create({
      ...userData,
      listId: req.body.listId,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: userData.id,
      },
      process.env.SECRET_KEY
    );

    res.status(200).send({
      status: "success",
      message: "resource successfully create user",
      data: {
        user: {
          email: dataUser.email,
          token,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: "failed",
      message: "Sign Up Invalid",
    });
  }
};

// Sign In
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = req.body;

    const schema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().min(6).required(),
    });

    const { error } = schema.validate(userData);

    if (error) {
      return res.status(200).send({
        status: "failed",
        message: error.details[0].message,
      });
    }

    // Check Email
    const checkEmail = await User.findOne({
      where: {
        email,
      },
      include: {
        model: Roll,
        as: "rolls",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
    });

    if (!checkEmail) {
      return res.status(500).send({
        status: "failed",
        message: "Email Or Password Don't Match",
      });
    }

    const isValidPassword = await bcrypt.compare(password, checkEmail.password);

    if (!isValidPassword) {
      return res.status(500).send({
        status: "failed",
        message: "Email Or Password Don't Match",
      });
    }
    const token = jwt.sign(
      {
        id: checkEmail.id,
      },
      process.env.SECRET_KEY
    );

    res.status(200).send({
      status: "success",
      message: "resource successfully login",
      data: {
        user: {
          email: checkEmail.email,
          token,
          listAs: checkEmail.rolls.name,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Sign In Invalid",
    });
  }
};

// Get Users
exports.getUsers = async (req, res) => {
  try {
    let users = await User.findAll({
      include: {
        model: Roll,
        as: "rolls",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "address", "password"],
      },
    });
    users = JSON.parse(JSON.stringify(users));
    res.status(200).send({
      status: "success",
      message: "resource successfully get users",
      data: {
        users,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "internal server error",
    });
  }
};

// Get User By Id
exports.getUserById = async (req, res) => {
  try {
    let userOne = await User.findOne({
      where: {
        id: req.params.id,
      },
      include: {
        model: Roll,
        as: "rolls",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    userOne = JSON.parse(JSON.stringify(userOne));
    res.status(200).send({
      status: "success",
      message: "resource successfully get user",
      data: userOne,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "User id not found",
    });
  }
};

// Check Auth
exports.checkAuth = async (req, res) => {
  try {
    const id = req.idUser;
    const dataUser = await User.findOne({
      where: {
        id,
      },
      include: {
        model: Roll,
        as: "rolls",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });
    if (!dataUser) {
      return res.status(500).send({
        status: "Data User tidak ada",
      });
    }
    res.status(200).send({
      status: "success",
      message: "resource successfully check auth",
      data: {
        id: dataUser.id,
        email: dataUser.email,
        profile: dataUser.profile,
        listAs: dataUser.rolls.name,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Auth Gagal",
    });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const path = process.env.PATH_PROFILE;
  try {
    let userStored = req.body;
    userStored = {
      profile: path + req.files.profile[0].filename,
      ...userStored,
    };
    let userData = await User.update(userStored, {
      where: {
        id: id,
      },
    });
    let user = await User.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    res.status(200).send({
      status: "Success",
      message: "resource has successfully updated user",
      data: {
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          profile: user.profile,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Update Profile not found",
    });
  }
};
