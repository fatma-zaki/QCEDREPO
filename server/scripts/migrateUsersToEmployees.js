/*
  Migration: Move Users into Employees with roles/credentials
  Usage: NODE_PATH=./ node server/scripts/migrateUsersToEmployees.js
*/
const mongoose = require('mongoose')
require('dotenv').config({ path: './config.env' })

const User = require('../models/User')
const Employee = require('../models/Employee')

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected')

    const users = await User.find({})
    console.log(`Found ${users.length} users`)

    let migrated = 0
    for (const u of users) {
      // Try to find existing employee by email
      let employee = null
      if (u.email) {
        employee = await Employee.findOne({ email: u.email })
      }

      if (!employee) {
        employee = new Employee({
          name: u.username,
          extension: String(Date.now()).slice(-4),
          department: u.department || null,
          email: u.email,
          role: u.role || 'employee',
          permissions: u.permissions || [],
          password: u.password ? undefined : undefined, // cannot reuse hashed user password safely
          isActive: u.isActive !== false
        })

        // If no department, skip invalid docs
        if (!employee.department) {
          console.warn(`Skipping user ${u._id} - missing department`)
          continue
        }

        await employee.save()
        migrated++
      } else {
        // Update role/permissions
        employee.role = u.role || employee.role
        employee.permissions = Array.isArray(u.permissions) ? u.permissions : employee.permissions
        await employee.save()
      }
    }

    console.log(`Migrated ${migrated} users to employees.`)
  } catch (err) {
    console.error(err)
  } finally {
    await mongoose.disconnect()
  }
}

run()


