var express = require("express");
var router = express.Router();
var Folder = require("../models/folderSchema");
const { upload } = require("../middlewares/uplaodFile");

const aws = require("aws-sdk");
const checkUserRole = require("../middlewares/isAdmin");
const verifyJWT = require("../middlewares/auth");
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
});

const deleteFile = (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `zeniva/${key}`,
  };
  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.error(err);
    }
  });
};

router.get(
  "/get-files",
  verifyJWT,
  checkUserRole("Admin"),
  async function (req, res, next) {
    try {
      let folder = await Folder.findOne({});
      res.send({ message: "working", data: folder?.data ?? [] });
    } catch (error) {
      console.log(error);
      res.send({ message: "not working" });
    }
  }
);

router.post(
  "/create-folder",
  verifyJWT,
  checkUserRole("Admin"),
  async function (req, res, next) {
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
  }
);

router.post(
  "/update-folder",
  verifyJWT,
  checkUserRole("Admin"),
  async function (req, res, next) {
    const { folderName, files } = req.body;

    try {
      let folder = await Folder.findOne({});

      if (!folder.data[folderName]) {
        return res.send({ message: "folder does not exists" });
      }
      folder.data[folderName] = {
        ...folder.data[folderName],
        files: {
          ...folder.data[folderName].files,
          ...files,
        },
      };

      await Folder.findByIdAndUpdate(folder._id, { data: folder.data });
      res.send({ message: "folder data updated", data: folder });
    } catch (error) {
      console.log(error);
      res.send({ message: "not working" });
    }
  }
);

router.post(
  "/delete-files",
  verifyJWT,
  checkUserRole("Admin"),
  async function (req, res, next) {
    const { name } = req.body;
    try {
      let folder = await Folder.findOne({});
      const deleteFilesInObj = (obj) => {
        for (const key in obj) {
          if (obj[key].type === "FILE") {
            deleteFile(key);
          } else if (typeof obj[key] === "object") {
            deleteFilesInObj(obj[key]);
          }
        }
      };

      const deleteKey = (obj, keyToDelete) => {
        for (const key in obj) {
          if (key === keyToDelete) {
            deleteFilesInObj({ [key]: obj[key] });
            delete obj[key];
          } else if (typeof obj[key] === "object") {
            deleteKey(obj[key], name);
          }
        }
      };
      deleteKey(folder.data, name);

      const udpatedData = folder.data;

      await Folder.findByIdAndUpdate(folder._id, { data: udpatedData });

      res.send({ message: "Deleted the key", data: udpatedData });
    } catch (error) {
      console.log(error);
      res.send({ message: "not working" });
    }
  }
);

router.post(
  "/upload",
  verifyJWT,
  checkUserRole("Admin"),
  upload.single("file"),
  (req, res) => {
    if (!req.file) res.status(400).json({ error: "No file were uploaded." });

    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${req.file.key}`;

    res.status(200).json({
      message: "Successfully uploaded ",
      URL: fileUrl,
      name: req.file.key.split("/")[1],
    });
  }
);

router.delete(
  "/delete/:filename",
  verifyJWT,
  checkUserRole("Admin"),
  (req, res) => {
    const filename = req.params.filename;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `zeniva/${filename}`,
    };

    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Failed to delete file from S3." });
      }

      return res.status(200).json({ message: "File deleted from S3." });
    });
  }
);

module.exports = router;
