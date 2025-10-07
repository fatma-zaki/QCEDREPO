// models/Employee.js
/**
 * Production-ready Employee model
 * - Single-department per employee
 * - Auto-generated employeeCode (sequential, via counters collection)
 * - RBAC: role (flexible) + permissions array (granular)
 * - Authentication: password hashing, loginAttempts, accountLocked, reset token
 * - 2FA (optional): twoFactorEnabled + twoFactorCode (OTP) + expiry
 * - Methods: comparePassword, hasPermission, lock/unlock, generatePasswordReset, generateTwoFactorCode
 * - Search static: searchEmployees(...)
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const validator = require('validator')

const { Schema } = mongoose

/* ---------------------------
   Counter model (for sequential employeeCode)
   --------------------------- */
// avoid model overwrite on hot-reload during dev
const Counter =
  mongoose.models.Counter ||
  mongoose.model(
    'Counter',
    new Schema(
      {
        _id: { type: String, required: true },
        seq: { type: Number, default: 0 }
      },
      { _id: false }
    )
  )

async function getNextSequence (name = 'employeeCode') {
  // atomic increment
  const res = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean()
  return res.seq
}

/* ---------------------------
   Sub-schemas
   --------------------------- */
const SkillSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    certification: { type: String, trim: true },
    expiryDate: Date
  },
  { _id: false }
)

const EmergencyContactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: v => !v || validator.isEmail(v),
        message: 'Invalid email'
      }
    }
  },
  { _id: false }
)

const AddressSchema = new Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'Saudi Arabia' }
  },
  { _id: false }
)

/* ---------------------------
   Employee schema
   --------------------------- */
const EmployeeSchema = new Schema(
  {
    // identity
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },

    // login / contact
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: v => validator.isEmail(v),
        message: 'Invalid email'
      }
    },
    password: { type: String, required: true, minlength: 6, select: false },

    // identifiers
    nationalId: { type: String, trim: true, index: true, sparse: true },
    employeeCode: { type: String, unique: true, index: true }, // auto-generated

    // internal phone extension
    extension: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{3,6}$/, 'Extension must be 3-6 digits']
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: v => !v || /^[\+]?[0-9][\d]{0,15}$/.test(v),
        message: 'Invalid phone'
      }
    },

    // org & position
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true
    }, // single department
    position: { type: String, trim: true, maxlength: 100 }, // free text, admin can add new positions in UI

    // RBAC & permissions
    role: { type: String, trim: true, default: 'employee' }, // flexible roles
    permissions: [{ type: String, trim: true }], // e.g., 'employee:create', '*' for full access

    // employment metadata
    hireDate: { type: Date, default: Date.now },
    salary: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['active', 'suspended', 'terminated', 'on_leave'],
      default: 'active',
      index: true
    },
    isActive: { type: Boolean, default: true },

    // authentication & security
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    accountLocked: { type: Boolean, default: false },
    lastPasswordChange: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // 2FA (optional OTP flow)
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorCode: { type: String }, // short OTP stored temporarily
    twoFactorExpires: { type: Date }, // expiration for OTP

    // relations & auditing
    reportsTo: { type: Schema.Types.ObjectId, ref: 'Employee' }, // manager
    createdBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },

    // misc
    skills: [SkillSchema],
    emergencyContacts: [EmergencyContactSchema],
    address: AddressSchema,
    avatar: { type: String }, // URL or base64
    // identity documents
    idFrontUrl: { type: String },
    idBackUrl: { type: String },
    documentsStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    documentsApprovedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
    documentsApprovedAt: { type: Date },
    meta: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

/* ---------------------------
   Virtuals
   --------------------------- */
EmployeeSchema.virtual('fullName').get(function () {
  const parts = [this.firstName, this.lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : this.username || this.email || ''
})
EmployeeSchema.virtual('name').get(function () {
  const full = this.fullName
  return full && full.trim().length > 0
    ? full
    : this.username || this.email || ''
}) // backwards compatibility

/* ---------------------------
   Indexes & text search
   --------------------------- */
EmployeeSchema.index({
  firstName: 'text',
  lastName: 'text',
  extension: 'text',
  position: 'text',
  email: 'text'
})

/* ---------------------------
   Pre-save middleware
   --------------------------- */
EmployeeSchema.pre('save', async function (next) {
  try {
    // basic sanitization
    ;['firstName', 'lastName', 'username', 'position', 'avatar'].forEach(f => {
      if (this[f] && typeof this[f] === 'string') this[f] = this[f].trim()
    })
    if (this.email && typeof this.email === 'string')
      this.email = this.email.trim().toLowerCase()

    // validate department existence
    if (this.isModified('department') && this.department) {
      const Department = mongoose.model('Department')
      const dept = await Department.findById(this.department)
        .select('_id')
        .lean()
      if (!dept) return next(new Error('Department not found'))
    }

    // hash password when created/changed
    if (this.isModified('password') && this.password) {
      const salt = await bcrypt.genSalt(12)
      this.password = await bcrypt.hash(this.password, salt)
      this.lastPasswordChange = new Date()
    }

    // generate employeeCode if not present
    if (!this.employeeCode) {
      const seq = await getNextSequence('employeeCode')
      // example format: EMP-000123
      const padded = String(seq).padStart(6, '0')
      this.employeeCode = `EMP-${padded}`
    }

    // default permissions if none and role given: (optional - adapt to your permissions config)
    if ((!this.permissions || this.permissions.length === 0) && this.role) {
      // keep empty by default; admin UI or backend should assign defaults based on role
      this.permissions = this.permissions || []
    }

    next()
  } catch (err) {
    next(err)
  }
})

/* ---------------------------
   Instance methods
   --------------------------- */
EmployeeSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

EmployeeSchema.methods.hasPermission = function (permission) {
  if (!this.permissions) return false
  if (this.permissions.includes('*')) return true
  return this.permissions.includes(permission)
}

EmployeeSchema.methods.lockAccount = function () {
  this.accountLocked = true
  return this.save({ validateBeforeSave: false })
}
EmployeeSchema.methods.unlockAccount = function () {
  this.accountLocked = false
  this.loginAttempts = 0
  return this.save({ validateBeforeSave: false })
}

EmployeeSchema.methods.generatePasswordReset = function (ttlMinutes = 60) {
  const token = crypto.randomBytes(20).toString('hex')
  this.resetPasswordToken = token
  this.resetPasswordExpires = new Date(Date.now() + ttlMinutes * 60 * 1000)
  return token
}

EmployeeSchema.methods.generateTwoFactorCode = function (
  digits = 6,
  ttlMinutes = 5
) {
  // generate numeric code
  const code = String(
    Math.floor(Math.random() * Math.pow(10, digits))
  ).padStart(digits, '0')
  this.twoFactorCode = code
  this.twoFactorExpires = new Date(Date.now() + ttlMinutes * 60 * 1000)
  return code
}

/* ---------------------------
   Static methods
   --------------------------- */
EmployeeSchema.statics.findByCredentials = async function (
  identifier,
  password,
  opts = {}
) {
  // identifier: email | extension | username | phone
  const normalized = (identifier || '').toString().trim().toLowerCase()
  const candidates = [
    { email: normalized },
    { extension: String(identifier).trim() },
    { username: String(identifier).trim() },
    { phone: String(identifier).trim() }
  ]

  let employee = null
  for (const c of candidates) {
    employee = await this.findOne(c).select(
      '+password +accountLocked +loginAttempts'
    )
    if (employee) break
  }

  if (!employee) return null

  if (employee.accountLocked) {
    return { locked: true, employee } // caller can interpret
  }

  const isMatch = await employee.comparePassword(password)
  if (!isMatch) {
    employee.loginAttempts = (employee.loginAttempts || 0) + 1
    const LOCK_THRESHOLD = opts.lockThreshold || 5
    if (employee.loginAttempts > LOCK_THRESHOLD) {
      employee.accountLocked = true
    }
    await employee.save({ validateBeforeSave: false })
    return null
  }

  // success
  employee.loginAttempts = 0
  employee.accountLocked = false
  employee.lastLogin = new Date()
  await employee.save({ validateBeforeSave: false })

  // return populated lean object without password
  const ret = await this.findById(employee._id)
    .populate('department', 'name organizationalCode')
    .lean()
  return ret
}

/**
 * searchEmployees: text search + filters + pagination
 * options = { q, department, role, status, skills, page, limit, sort }
 */
EmployeeSchema.statics.searchEmployees = async function (options = {}) {
  const {
    q = '',
    department,
    role,
    status,
    skills = [],
    page = 1,
    limit = 25,
    sort = { firstName: 1 }
  } = options

  const filter = {}
  if (q && q.trim()) filter.$text = { $search: q }
  if (department) filter.department = department
  if (role) filter.role = role
  if (status) filter.status = status
  if (skills && skills.length) filter['skills.name'] = { $in: skills }

  const skip = (Math.max(1, page) - 1) * limit
  const query = this.find(filter)
    .populate('department', 'name organizationalCode')
    .sort(sort)
    .skip(skip)
    .limit(limit)

  if (filter.$text)
    query
      .select({ score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })

  const [results, total] = await Promise.all([
    query.exec(),
    this.countDocuments(filter)
  ])
  return { results, total, page, pages: Math.ceil(total / limit) }
}

/* ---------------------------
   Export model
   --------------------------- */
module.exports =
  mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema)
