import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'manager', 'admin'], default: 'user' },
  },
  { timestamps: true },
)

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash)
}

export default mongoose.model('User', userSchema)
