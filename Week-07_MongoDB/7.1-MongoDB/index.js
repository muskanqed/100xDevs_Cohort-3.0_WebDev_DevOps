const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const zod = require("zod");

const { UserModel, TodoModel } = require("./db");
const { connectToDb } = require("./dbconnect");
const { auth } = require("./auth.js")

const JWT_SECRET = "muskan123";

function initServer() {
  const app = express();
  app.use(express.json());

  connectToDb();

  app.post("/signup", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    await UserModel.create({
      email: email,
      password: password,
      name: name,
    });

    res.json({
      message: "You are signed up",
    });
  });

  app.post("/signin", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
      email: email,
      password: password,
    });

    console.log(response);

    if (response) {
      const token = jwt.sign({
        id: response._id.toString(),
      }, JWT_SECRET);

      res.json({
        token,
      });
    }
    else {
      res.status(403).json({
        message: "Incorrect creds",
      });
    }
  });

  app.post("/todo", auth, (req, res) => {
    const userId = req.userId
    const title = req.body.title
    const done = req.body.done

    TodoModel.create({
      userId,
      title,
      done
    })

    res.json({
      message: "Todo created successfully",
      userId
    })



  });

  app.get("/todos", auth, async (req, res) => {

    const userId = req.userId

    const todos = await TodoModel.find({
      userId
    });

    if (userId === todos.userId) {
      res.json({
        todos
      })
    }
    else {
      res.json({
        message: "Please create one todo"
      })
    }

  });



  app.listen(3000, () => {
    console.log("server running on port 3000");
  });
}

initServer();
