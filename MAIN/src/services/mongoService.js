const API_BASE_URL = 'http://localhost:5000/api';

export const mongoService = {
  async getHealthStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/health-check`);
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch {
      return { status: 'offline', mongoConnected: false };
    }
  },

  async getClientProfile(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch client profile');
      return await res.json();
    } catch (e) {
      console.warn('mongoService getClientProfile error:', e);
      return null;
    }
  },

  async updateClientProfile(userId, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update client profile');
      return await res.json();
    } catch (e) {
      console.error('mongoService updateClientProfile error:', e);
      throw e;
    }
  },

  async getIllnessHistory(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/illness-history/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch illness history');
      return await res.json();
    } catch (e) {
      console.warn('mongoService getIllnessHistory error:', e);
      return [];
    }
  },

  async addIllnessHistory(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/illness-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to add illness history');
      return await res.json();
    } catch (e) {
      console.error('mongoService addIllnessHistory error:', e);
      throw e;
    }
  },

  async deleteIllnessHistory(id, userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/illness-history/${id}?userId=${userId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete illness history record');
      return await res.json();
    } catch (e) {
      console.error('mongoService deleteIllnessHistory error:', e);
      throw e;
    }
  },

  async getDoctorConsultations(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/doctor-consultations/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch doctor consultations');
      return await res.json();
    } catch (e) {
      console.warn('mongoService getDoctorConsultations error:', e);
      return [];
    }
  },

  async addDoctorConsultation(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/doctor-consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to add doctor consultation');
      return await res.json();
    } catch (e) {
      console.error('mongoService addDoctorConsultation error:', e);
      throw e;
    }
  },

  async deleteDoctorConsultation(id, userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/doctor-consultations/${id}?userId=${userId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete doctor consultation record');
      return await res.json();
    } catch (e) {
      console.error('mongoService deleteDoctorConsultation error:', e);
      throw e;
    }
  },

  async getHealthRecords(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/health-records/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch health records');
      return await res.json();
    } catch (e) {
      console.warn('mongoService getHealthRecords error:', e);
      return [];
    }
  },

  async addHealthRecord(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/health-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to add health record');
      return await res.json();
    } catch (e) {
      console.error('mongoService addHealthRecord error:', e);
      throw e;
    }
  },

  async getFullHistory(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${userId}/full-history`);
      if (!res.ok) throw new Error('Failed to fetch full history');
      return await res.json();
    } catch (e) {
      console.warn('mongoService getFullHistory error:', e);
      return null;
    }
  }
};
