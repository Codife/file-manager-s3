const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  data: {
    type: Object,
    required: true,
  },
});

const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder;
