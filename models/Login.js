const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema({
  username: { type: String,},
  password: { type: String,},
});

module.exports = mongoose.model("Login", LoginSchema);
