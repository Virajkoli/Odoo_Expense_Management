import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ['travel', 'food', 'office', 'other'], default: 'other' },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    notes: { type: String },
  },
  { timestamps: true },
)

export default mongoose.model('Expense', expenseSchema)
