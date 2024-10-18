const mongoose = require('mongoose');
const crypto = require("crypto");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: false,
    index: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  forget_password: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ["active", "inactive"]
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    default: "user"
  },
  password_changed_at: Date,
  password_reset_token: String,
  password_reset_token_expires: Date,
}, { timestamps: true });

userSchema.methods.createResetPpasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.password_reset_token = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.password_reset_token_expires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);