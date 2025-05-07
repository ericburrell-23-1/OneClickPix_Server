const express = require("express");
const router = express.Router();
const fs = require("fs");

router.get("/coverImages", (req, res) => {
  const folderName = "images/marketing/coverImages";

  fs.readdir(folderName, async (err, files) => {
    if (err) console.log("error: ", err);

    if (!(err == null)) return res.status(404).send(err);
    return res.send(files);
  });
});

module.exports = router;
