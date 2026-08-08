import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage, isDemoMode } from '../firebase'

export const recordStorageService = {
  /**
   * Uploads a file to Firebase Storage under path `medicalRecords/{patientId}/{timestamp}_{filename}`.
   * If in Demo Mode or storage is unavailable, reads the file as Data URL string.
   */
  async uploadFile(patientId, file) {
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `medicalRecords/${patientId}/${timestamp}_${sanitizedName}`

    if (isDemoMode || !storage) {
      // Fallback: Read file as Data URL for local demo mode persistence
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
      })

      return {
        fileUrl: dataUrl,
        storagePath: `local-${storagePath}`,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size || 0,
      }
    }

    try {
      const storageRef = ref(storage, storagePath)
      const metadata = {
        contentType: file.type || 'application/octet-stream',
        customMetadata: {
          patientId,
          originalName: file.name,
        },
      }

      await uploadBytes(storageRef, file, metadata)
      const downloadUrl = await getDownloadURL(storageRef)

      return {
        fileUrl: downloadUrl,
        storagePath,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size || 0,
      }
    } catch (err) {
      console.warn('Firebase Storage upload error, using local fallback:', err)
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = (e) => reject(e)
        reader.readAsDataURL(file)
      })

      return {
        fileUrl: dataUrl,
        storagePath: `local-${storagePath}`,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size || 0,
      }
    }
  },

  /**
   * Deletes a file from Firebase Storage given its storage path.
   */
  async deleteFile(storagePath) {
    if (!storagePath || storagePath.startsWith('local-') || isDemoMode || !storage) {
      return true
    }

    try {
      const storageRef = ref(storage, storagePath)
      await deleteObject(storageRef)
      return true
    } catch (err) {
      console.warn('Firebase Storage file delete error:', err)
      return false
    }
  },
}
