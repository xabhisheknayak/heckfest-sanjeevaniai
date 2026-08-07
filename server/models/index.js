import mongoose from 'mongoose';

// 1. Client Basic Profile Schema
const ClientSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, default: 30 },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], default: 'Other' },
  bloodGroup: { type: String, default: 'O+' },
  heightCm: { type: Number, default: 172 },
  weightKg: { type: Number, default: 68 },
  phone: { type: String, default: '+1 (555) 234-5678' },
  emergencyContact: { type: String, default: 'Jane Doe (+1 555-987-6543)' },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  address: { type: String, default: '123 Health Ave, San Francisco, CA' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 2. Health Vitals / Records Schema
const HealthRecordSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  bpSystolic: { type: Number, default: 120 },
  bpDiastolic: { type: Number, default: 80 },
  heartRate: { type: Number, default: 72 },
  bloodSugar: { type: Number, default: 95 },
  spo2: { type: Number, default: 98 },
  bmi: { type: Number, default: 23.0 },
  temperatureF: { type: Number, default: 98.6 },
  notes: { type: String, default: 'Routine vital measurements recorded.' },
  recordedAt: { type: Date, default: Date.now }
});

// 3. Illness History Schema
const IllnessHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  illnessName: { type: String, required: true },
  diagnosisDate: { type: String, required: true }, // e.g., '2024-03-15'
  status: { type: String, enum: ['Active', 'Recovered', 'Chronic', 'Under Treatment'], default: 'Active' },
  severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'], default: 'Moderate' },
  symptoms: [{ type: String }],
  treatment: { type: String, default: 'Prescribed medication & bed rest' },
  prescribedMedications: [{ type: String }],
  doctorNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// 4. Doctor Consultation History Schema
const DoctorConsultationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  doctorName: { type: String, required: true },
  specialization: { type: String, required: true },
  clinicHospital: { type: String, required: true },
  consultationDate: { type: String, required: true },
  chiefComplaint: { type: String, required: true },
  diagnosis: { type: String, required: true },
  prescriptions: [{ type: String }],
  followUpDate: { type: String, default: '' },
  consultationFee: { type: String, default: '$50' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);
export const HealthRecord = mongoose.models.HealthRecord || mongoose.model('HealthRecord', HealthRecordSchema);
export const IllnessHistory = mongoose.models.IllnessHistory || mongoose.model('IllnessHistory', IllnessHistorySchema);
export const DoctorConsultation = mongoose.models.DoctorConsultation || mongoose.model('DoctorConsultation', DoctorConsultationSchema);
