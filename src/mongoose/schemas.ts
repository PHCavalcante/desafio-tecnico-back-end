import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userMongooseModel = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email é necessário"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Por favor, insira um email válido"],
  },
  password: {
    type: String,
    required: [true, "Senha é necessária"],
    minlength: [6, "A senha deve ter pelo menos 6 caracteres"],
    select: false,
  },
});

userMongooseModel.pre("save", async function (next) {
  if (!this.isModified("password")) return next;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next;
});

userMongooseModel.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const orderMongooseModel = new mongoose.Schema({
  lab: String,
  patient: String,
  customer: String,
  state: { type: String, enum: ["CREATED", "ANALYSIS", "COMPLETED"] },
  status: { type: String, enum: ["ACTIVE", "DELETED"] },
  services: [
    {
      name: String,
      value: Number,
      status: { type: String, enum: ["PENDING", "DONE"] },
    },
  ],
});

const UserModel = mongoose.model("User", userMongooseModel);
const OrderModel = mongoose.model("Order", orderMongooseModel);

export { UserModel, OrderModel };
