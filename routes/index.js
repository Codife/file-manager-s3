var express = require("express");
var router = express.Router();
var Folder = require("../models/folderSchema");

router.get("/", function (req, res, next) {
  res.send("working");
});

router.post("/create-folder", async function (req, res, next) {
  const body = req.body;
  
  try {
    let folder = await Folder.findOne({});
    let alreadyExists = [];

    if (!folder) {
      folder = new Folder();
      folder.data = { ...folder.data, ...body };
    } else {
      Object.keys(body).forEach((k) => {
        Object.keys(folder.data).forEach((f) => {
          if (f === k) {
            alreadyExists.push(f);
          }
        });
      });
    }

    if (alreadyExists.length >= 1) {
      res.send({ message: "already exists", data: alreadyExists });
    } else {
      folder.data = { ...folder.data, ...body };
      await folder.save();
      res.send({ message: "working", data: folder });
    }
  } catch (error) {
    console.log(error);
    res.send({ message: "not working" });
  }
});

router.post("/uplaod-file", function (req, res, next) {
  res.send("working");
});

module.exports = router;
