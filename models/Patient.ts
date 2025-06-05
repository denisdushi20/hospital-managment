import mongoose, { Schema, model, models } from 'mongoose';

const PatientSchema = new Schema({
  name: { type: String },
  surname: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },  // Not required if user is OAuth
  role: { type: String, default: 'patient' },
});



export default models.Patient || model('Patient', PatientSchema);
