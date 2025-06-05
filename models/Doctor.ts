import mongoose, { Schema, model, models } from 'mongoose';

const doctorSchema = new Schema({
  name: String,
  surname: String,
  specialization: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default models.Doctor || model('Doctor', doctorSchema);
