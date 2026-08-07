import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Client, HealthRecord, IllnessHistory, DoctorConsultation } from './models/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sanjeevaniai_db';

app.use(cors());
app.use(express.json());

let isMongoConnected = false;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 3000
}).then(() => {
  isMongoConnected = true;
  console.log(' Successfully connected to MongoDB at:', MONGODB_URI);
}).catch((err) => {
  isMongoConnected = false;
  console.warn(' MongoDB connection failed or offline. Using local memory store mode.', err.message);
});

// In-Memory fallback storage if MongoDB service is not running locally
const memoryDB = {
  clients: {},
  healthRecords: {},
  illnessHistory: {},
  doctorConsultations: {}
};

// Seed demo data for memory fallback if needed
function getDemoClient(userId) {
  if (!memoryDB.clients[userId]) {
    memoryDB.clients[userId] = {
      userId,
      fullName: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      age: 32,
      gender: 'Male',
      bloodGroup: 'O+',
      heightCm: 178,
      weightKg: 74,
      phone: '+1 (555) 349-9021',
      emergencyContact: 'Sarah Morgan (+1 555-901-2289)',
      allergies: ['Penicillin', 'Peanuts', 'Dust Mites'],
      chronicConditions: ['Mild Seasonal Asthma', 'Hypertension (Controlled)'],
      address: '742 Evergreen Terrace, Springfield, CA',
      updatedAt: new Date().toISOString()
    };
  }
  return memoryDB.clients[userId];
}

function getDemoIllnessHistory(userId) {
  if (!memoryDB.illnessHistory[userId]) {
    memoryDB.illnessHistory[userId] = [
      {
        _id: 'illness-1',
        userId,
        illnessName: 'Acute Bronchitis & Viral Cough',
        diagnosisDate: '2024-11-10',
        status: 'Recovered',
        severity: 'Moderate',
        symptoms: ['Persistent dry cough', 'Mild fever (100.4°F)', 'Chest tightness'],
        treatment: 'Nebulization, Bronchodilator inhaler & Hydration',
        prescribedMedications: ['Azithromycin 500mg', 'Levosalbutamol Inhaler'],
        doctorNotes: 'Patient responded well to inhaler therapy. Cough resolved within 7 days.'
      },
      {
        _id: 'illness-2',
        userId,
        illnessName: 'Seasonal Allergic Rhinitis',
        diagnosisDate: '2024-04-02',
        status: 'Active',
        severity: 'Mild',
        symptoms: ['Nasal congestion', 'Sneezing episodes', 'Itchy watery eyes'],
        treatment: 'Daily Antihistamine regimen during pollen season',
        prescribedMedications: ['Cetirizine 10mg', 'Fluticasone Nasal Spray'],
        doctorNotes: 'Avoid outdoor exposure during high pollen counts. Follow up in 3 months.'
      },
      {
        _id: 'illness-3',
        userId,
        illnessName: 'Grade 1 Ankle Sprain',
        diagnosisDate: '2023-08-19',
        status: 'Recovered',
        severity: 'Mild',
        symptoms: ['Localized swelling right ankle', 'Pain on weight bearing'],
        treatment: 'R.I.C.E protocol (Rest, Ice, Compression, Elevation) & ankle brace',
        prescribedMedications: ['Ibuprofen 400mg as needed'],
        doctorNotes: 'X-ray confirmed no hairline fracture. Full weight bearing restored.'
      }
    ];
  }
  return memoryDB.illnessHistory[userId];
}

function getDemoDoctorConsultations(userId) {
  if (!memoryDB.doctorConsultations[userId]) {
    memoryDB.doctorConsultations[userId] = [
      {
        _id: 'consult-1',
        userId,
        doctorName: 'Dr. Evelyn Vance, MD',
        specialization: 'Pulmonology & Respiratory Health',
        clinicHospital: 'Sanjivni Pulmonology Specialty Clinic',
        consultationDate: '2024-11-12',
        chiefComplaint: 'Follow-up on post-bronchitis wheezing and exercise chest tightness.',
        diagnosis: 'Post-viral bronchial hyper-responsiveness.',
        prescriptions: ['Budesonide 200mcg inhaler twice daily', 'Montelukast 10mg at bedtime'],
        followUpDate: '2025-02-15',
        consultationFee: '$120',
        notes: 'Spirometry test shows normal FEV1. Inhaler dosage adjusted.'
      },
      {
        _id: 'consult-2',
        userId,
        doctorName: 'Dr. Marcus Sterling, FACC',
        specialization: 'Cardiology & Preventive Medicine',
        clinicHospital: 'City General Heart Institute',
        consultationDate: '2024-06-20',
        chiefComplaint: 'Annual cardiovascular checkup & BP monitoring review.',
        diagnosis: 'Essential Hypertension (Well controlled).',
        prescriptions: ['Telmisartan 40mg daily morning'],
        followUpDate: '2024-12-20',
        consultationFee: '$150',
        notes: 'ECG normal sinus rhythm. Lipid panel within target range.'
      }
    ];
  }
  return memoryDB.doctorConsultations[userId];
}

function getDemoHealthRecords(userId) {
  if (!memoryDB.healthRecords[userId]) {
    memoryDB.healthRecords[userId] = [
      {
        _id: 'vital-1',
        userId,
        bpSystolic: 122,
        bpDiastolic: 78,
        heartRate: 72,
        bloodSugar: 96,
        spo2: 99,
        bmi: 23.4,
        temperatureF: 98.6,
        notes: 'Optimal morning resting vitals.',
        recordedAt: new Date().toISOString()
      }
    ];
  }
  return memoryDB.healthRecords[userId];
}

// Routes

// 1. Health Status
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'online',
    mongoConnected: isMongoConnected,
    database: isMongoConnected ? 'MongoDB' : 'InMemoryFallback'
  });
});

// 2. Client Profile
app.get('/api/clients/:userId', async (req, res) => {
  const { userId } = req.params;
  if (isMongoConnected) {
    try {
      let client = await Client.findOne({ userId });
      if (!client) {
        client = await Client.create(getDemoClient(userId));
      }
      return res.json(client);
    } catch (e) {
      console.error(e);
    }
  }
  return res.json(getDemoClient(userId));
});

app.put('/api/clients/:userId', async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;
  if (isMongoConnected) {
    try {
      const client = await Client.findOneAndUpdate({ userId }, { ...updates, updatedAt: new Date() }, { new: true, upsert: true });
      return res.json(client);
    } catch (e) {
      console.error(e);
    }
  }
  memoryDB.clients[userId] = { ...getDemoClient(userId), ...updates, updatedAt: new Date().toISOString() };
  return res.json(memoryDB.clients[userId]);
});

// 3. Illness History
app.get('/api/illness-history/:userId', async (req, res) => {
  const { userId } = req.params;
  if (isMongoConnected) {
    try {
      const list = await IllnessHistory.find({ userId }).sort({ createdAt: -1 });
      if (list.length > 0) return res.json(list);
    } catch (e) {
      console.error(e);
    }
  }
  return res.json(getDemoIllnessHistory(userId));
});

app.post('/api/illness-history', async (req, res) => {
  const data = req.body;
  if (isMongoConnected) {
    try {
      const item = await IllnessHistory.create(data);
      return res.status(201).json(item);
    } catch (e) {
      console.error(e);
    }
  }
  const newItem = { _id: `illness-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  const current = getDemoIllnessHistory(data.userId);
  current.unshift(newItem);
  return res.status(201).json(newItem);
});

app.delete('/api/illness-history/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  if (isMongoConnected) {
    try {
      await IllnessHistory.findByIdAndDelete(id);
      return res.json({ success: true });
    } catch (e) {
      console.error(e);
    }
  }
  if (userId && memoryDB.illnessHistory[userId]) {
    memoryDB.illnessHistory[userId] = memoryDB.illnessHistory[userId].filter(i => i._id !== id);
  }
  return res.json({ success: true });
});

// 4. Doctor Consultation History
app.get('/api/doctor-consultations/:userId', async (req, res) => {
  const { userId } = req.params;
  if (isMongoConnected) {
    try {
      const list = await DoctorConsultation.find({ userId }).sort({ createdAt: -1 });
      if (list.length > 0) return res.json(list);
    } catch (e) {
      console.error(e);
    }
  }
  return res.json(getDemoDoctorConsultations(userId));
});

app.post('/api/doctor-consultations', async (req, res) => {
  const data = req.body;
  if (isMongoConnected) {
    try {
      const item = await DoctorConsultation.create(data);
      return res.status(201).json(item);
    } catch (e) {
      console.error(e);
    }
  }
  const newItem = { _id: `consult-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  const current = getDemoDoctorConsultations(data.userId);
  current.unshift(newItem);
  return res.status(201).json(newItem);
});

app.delete('/api/doctor-consultations/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  if (isMongoConnected) {
    try {
      await DoctorConsultation.findByIdAndDelete(id);
      return res.json({ success: true });
    } catch (e) {
      console.error(e);
    }
  }
  if (userId && memoryDB.doctorConsultations[userId]) {
    memoryDB.doctorConsultations[userId] = memoryDB.doctorConsultations[userId].filter(c => c._id !== id);
  }
  return res.json({ success: true });
});

// 5. Health Records / Vitals
app.get('/api/health-records/:userId', async (req, res) => {
  const { userId } = req.params;
  if (isMongoConnected) {
    try {
      const list = await HealthRecord.find({ userId }).sort({ recordedAt: -1 });
      if (list.length > 0) return res.json(list);
    } catch (e) {
      console.error(e);
    }
  }
  return res.json(getDemoHealthRecords(userId));
});

app.post('/api/health-records', async (req, res) => {
  const data = req.body;
  if (isMongoConnected) {
    try {
      const item = await HealthRecord.create(data);
      return res.status(201).json(item);
    } catch (e) {
      console.error(e);
    }
  }
  const newItem = { _id: `vital-${Date.now()}`, ...data, recordedAt: new Date().toISOString() };
  const current = getDemoHealthRecords(data.userId);
  current.unshift(newItem);
  return res.status(201).json(newItem);
});

// 6. Comprehensive Full History Endpoint
app.get('/api/clients/:userId/full-history', async (req, res) => {
  const { userId } = req.params;
  
  let client, illnesses, consultations, vitals;
  if (isMongoConnected) {
    try {
      [client, illnesses, consultations, vitals] = await Promise.all([
        Client.findOne({ userId }),
        IllnessHistory.find({ userId }).sort({ createdAt: -1 }),
        DoctorConsultation.find({ userId }).sort({ createdAt: -1 }),
        HealthRecord.find({ userId }).sort({ recordedAt: -1 })
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  res.json({
    client: client || getDemoClient(userId),
    illnessHistory: illnesses && illnesses.length ? illnesses : getDemoIllnessHistory(userId),
    doctorConsultationHistory: consultations && consultations.length ? consultations : getDemoDoctorConsultations(userId),
    healthVitals: vitals && vitals.length ? vitals : getDemoHealthRecords(userId)
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Sanjeevani AI MongoDB Express Server running on port ${PORT}`);
});
