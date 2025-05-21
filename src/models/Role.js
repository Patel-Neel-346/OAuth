import mongoose from "mongoose";

const ROLE_TYPES = {
  ADMIN: "admin",
  USER: "user",
  LENDER: "lender",
  BORROWER: "borrower",
  MANAGER: "manager",
};

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: Object.values(ROLE_TYPES),
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  permissions: [
    {
      type: String,
    },
  ],
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamps on save
RoleSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Role = mongoose.model("Role", RoleSchema);

// Export both the model and the role types enum
export { Role, ROLE_TYPES };
export default Role;
