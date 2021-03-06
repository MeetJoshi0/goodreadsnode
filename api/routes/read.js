const express = require("express");
require("dotenv").config();
const router = express.Router();
const mongoose = require("mongoose");
const s = require("../../helper/getSequence");
const userAuth = require("../middleware/userAuth");
const Read = require("../model/read");

//!get

router.get("/", userAuth, (req, res) => {
  Read.find({ user_id: req.userData.id })
    .then((result) => {
      res.status(200).json({
        message: "Reads",
        reads: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//!post

router.post("/add-read", userAuth, (req, res) => {
  let book = req.body.book_id;
  Read.find({ user_id: req.userData.id }).then(async (result) => {
    if (result.length > 0) {
      let resultRev = result.reverse();
      if (resultRev[0].book_id === req.body.book_id) {
        return res.status(409).json({
          message: "Read exists",
        });
      } else {
        let seq = await s.getSequence("reads");
        let read = new Read({
          _id: new mongoose.Types.ObjectId(),
          id: seq,
          user_id: req.userData.id,
          book_id: book,
          status: "R",
        });
        read
          .save()
          .then((result) => {
            console.log(result);
            res.status(201).json({
              message: "Read Created",
              read: result,
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      }
    } else {
      let seq = await s.getSequence("reads");
      let read = new Read({
        _id: new mongoose.Types.ObjectId(),
        id: seq,
        user_id: req.userData.id,
        book_id: book,
        status: "R",
      });
      read
        .save()
        .then((result) => {
          console.log(result);
          res.status(201).json({
            message: "Read Created",
            read: result,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
          });
        });
    }
  });
});

//!patch

router.patch("/read-complete", userAuth, async (req, res) => {
  let result = await Read.find({ id: req.body.id }).catch((err) => {
    console.log(err);
    res.status(500).json({ error: err });
  });
  if (result.length > 0) {
    if (result[0].user_id === req.userData.id) {
      result[0].status = "C";
      result[0]
        .save()
        .then((doc) => {
          res.status(200).json({
            message: "Status Changed",
            read: doc,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
          });
        });
    } else {
      res.status(500).json({ error: "Can Not change Status of Another User" });
    }
  } else {
    res.status(409).json({ error: "Read Does not Exisist" });
  }
});

//!Delete

router.delete("/delete/:id", userAuth, async (req, res) => {
  Read.findOneAndRemove({ id: req.params.id })
    // eslint-disable-next-line no-unused-vars
    .then((result) => {
      res.status(200).json({
        message: "Read deleted",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
