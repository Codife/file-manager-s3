var express = require("express");
var router = express.Router();
var Folder = require("../models/folderSchema");
const { upload } = require("../middlewares/uplaodFile");

router.get("/get-files", async function (req, res, next) {
  try {
    let folder = await Folder.findOne({});
    res.send({ message: "working", data: folder.data });
  } catch (error) {
    console.log(error);
    res.send({ message: "not working" });
  }
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

router.delete("/delete-files", async function (req, res, next) {
  const { name } = req.body;
  try {
    let folder = await Folder.findOne({});
    const deleteKey = (obj, keyToDelete) => {
      for (const key in obj) {
        if (key === keyToDelete) {
          delete obj[key];
        } else if (typeof obj[key] === "object") {
          deleteKey(obj[key], name);
        }
      }
    };
    deleteKey(folder.data, name);
    await folder.save();
    res.send({ message: "Deleted the key", data: folder.data });
  } catch (error) {
    console.log(error);
    res.send({ message: "not working" });
  }
});

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) res.status(400).json({ error: "No file were uploaded." });

  res.status(200).json({
    message: "Successfully uploaded ",
    files: req.file,
  });
});

module.exports = router;
