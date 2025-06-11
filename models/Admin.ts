import mongoose, { Schema, model, models } from 'mongoose';

const adminSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
  },
  surname: {
    type: String,
    required: [true, 'Surname is required'],
    trim: true,
    minlength: [3, 'Surname must be at least 3 characters long'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
  },
  role: { type: String, default: 'admin' },
  password: { type: String, required: true },
}, {
  timestamps: true,
});

export default models.Admin || model('Admin', adminSchema);
