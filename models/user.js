const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
  username: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {           // ✅ Manual password field
    type: String,
    required: true,
  },
  photo: String,
  image: {
    data: Buffer,
    contentType: String,
  },
  cart: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
    },
  ],
  role: {
    type: String,
    default: "Customer",
  },
});

userSchema.plugin(findOrCreate);
const User = mongoose.model("users", userSchema);
module.exports = User;
