const bcryptjs = require('bcryptjs');
const router = require("express").Router()

const Users = require("./users-model.js")

router.get("/", (req, res, next) => {
  Users.find()
    .then(users => {
      res.status(200).json(users)
    })
    .catch(err => res.send(err));
})






module.exports = router;
