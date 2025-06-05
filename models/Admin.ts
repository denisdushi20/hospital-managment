import mongoose, { Schema, model, models } from 'mongoose';

const adminSchema = new Schema({
  name: String,
  surname: String,
  role: { type: String, default: 'admin' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default models.Admin || model('Admin', adminSchema);
