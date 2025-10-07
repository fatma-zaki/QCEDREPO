const mongoose = require("mongoose");
const validator = require("validator");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Department name cannot exceed 100 characters"],
      index: true
    },

    organizationalCode: {
      type: String,
      required: false,
      trim: true,
      unique: true,
      sparse: true, // Allows multiple null values
      uppercase: true,
      match: [/^[A-Z]{2,5}-\d{2,4}$/, "Invalid organizational code format"],
      index: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    level: {
      type: String,
      enum: ["board", "administration", "department", "sub_department", "team"],
      required: [true, "Department level is required"],
      default: "department",
    },

    parentDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => !value || validator.isEmail(value),
        message: "Please provide a valid email address",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//
// 📊 Indexes for performance
//
departmentSchema.index({ level: 1 });
departmentSchema.index({ parentDepartment: 1 });

//
// 📈 Virtual: employee count
//
departmentSchema.virtual("employeeCount", {
  ref: "Employee",
  localField: "_id",
  foreignField: "department",
  count: true,
});

//
// 📁 Virtual: subDepartments (recursive structure)
//
departmentSchema.virtual("subDepartments", {
  ref: "Department",
  localField: "_id",
  foreignField: "parentDepartment",
});

//
// ✅ Pre-save validation
//
departmentSchema.pre("save", async function (next) {
  if (this.parentDepartment) {
    const parent = await mongoose.model("Department").findById(this.parentDepartment);
    if (!parent) {
      return next(new Error("Parent department not found"));
    }
  }

  if (this.head) {
    const Employee = mongoose.model("Employee");
    const head = await Employee.findById(this.head);
    if (!head) {
      return next(new Error("Department head not found"));
    }
  }

  if (this.contactEmail) {
    this.contactEmail = this.contactEmail.toLowerCase().trim();
  }

  next();
});

//
// 🔐 Helper Method: permission check
//
departmentSchema.methods.hasPermission = function (permission) {
  return this.permissions?.includes(permission);
};

//
// 📊 Static Methods
//

// Find departments by level
departmentSchema.statics.findByLevel = function (level) {
  return this.find({ level, isActive: true });
};

// Build hierarchical tree (recursive)
departmentSchema.statics.findHierarchy = async function () {
  const departments = await this.find({ isActive: true }).lean();
  const map = {};
  departments.forEach((dept) => (map[dept._id] = { ...dept, subDepartments: [] }));

  const tree = [];
  departments.forEach((dept) => {
    if (dept.parentDepartment) {
      map[dept.parentDepartment]?.subDepartments.push(map[dept._id]);
    } else {
      tree.push(map[dept._id]);
    }
  });

  return tree;
};

module.exports = mongoose.model("Department", departmentSchema);
