const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,
    password: {
      type: String,
      minlength: [6, "password to short"],
      required: [true, "password required"],
    },
    passwordChangedAt:Date,
    passwordResetCode:String,
    passwordResetExpires:Date,
    passwordResetVerified:Boolean,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // child reference (one to many)
    wishlist:[{
      type:mongoose.Schema.ObjectId,
      ref:'Product'
  }],
  addresses:[{
    id:{type:mongoose.Schema.Types.ObjectId},
    alias:{type:String,required:[true,"Address Title Required"]},
    phone:{type:String,required:[true,"Phone Number Required"]},
    city:{type:String,required:[true,"City Required"]},
    description: {type:String,required:[true,"Description Required"]},
    postalCode:{type:String,required:[true,"Postal Code Required"]},
  }],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const User = mongoose.model("User", UserSchema);
module.exports = User;
