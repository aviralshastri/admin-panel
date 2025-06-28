import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore"
import { db } from "../lib/firebase"

export const firestoreService = {
  // Get user data by email
  async getUserByEmail(email) {
    try {
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("email", "==", email))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]
        return {
          id: userDoc.id,
          ...userDoc.data(),
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching user:", error)
      throw error
    }
  },

  // Get clinic data by clinic ID
  async getClinicById(clinicId) {
    try {
      const clinicRef = doc(db, "clinics", clinicId)
      const clinicSnap = await getDoc(clinicRef)

      if (clinicSnap.exists()) {
        return {
          id: clinicSnap.id,
          ...clinicSnap.data(),
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching clinic:", error)
      throw error
    }
  },

  // Combined function to get clinic data by user email
  async getClinicByUserEmail(email) {
    try {
      const userData = await this.getUserByEmail(email)
      if (!userData || !userData.clinicId) {
        throw new Error("User not found or no clinic associated")
      }

      const clinicData = await this.getClinicById(userData.clinicId)
      if (!clinicData) {
        throw new Error("Clinic not found")
      }

      return {
        user: userData,
        clinic: clinicData,
      }
    } catch (error) {
      console.error("Error fetching clinic by user email:", error)
      throw error
    }
  },

  // Update clinic overview data with enhanced location handling
  async updateClinicOverview(clinicId, overviewData) {
    try {
      const clinicRef = doc(db, "clinics", clinicId)
      const updateData = {
        Name: overviewData.Name,
        Rating: overviewData.Rating,
        TokensProvided: overviewData.TokensProvided,
        address: overviewData.address,
      }

      // Only update location if it's provided and valid
      if (
        overviewData.location &&
        typeof overviewData.location.latitude === "number" &&
        typeof overviewData.location.longitude === "number"
      ) {
        updateData.location = {
          latitude: overviewData.location.latitude,
          longitude: overviewData.location.longitude,
          timestamp: overviewData.location.timestamp || new Date().toISOString(),
          accuracy: overviewData.location.accuracy || null,
        }
      }

      await updateDoc(clinicRef, updateData)
      return true
    } catch (error) {
      console.error("Error updating clinic overview:", error)
      throw error
    }
  },

  // Update bed section data
  async updateBedSection(clinicId, bedSectionData) {
    try {
      const clinicRef = doc(db, "clinics", clinicId)
      await updateDoc(clinicRef, {
        bedSection: bedSectionData,
      })
      return true
    } catch (error) {
      console.error("Error updating bed section:", error)
      throw error
    }
  },

  // Update blood bank data
  async updateBloodBank(clinicId, bloodBankData) {
    try {
      const clinicRef = doc(db, "clinics", clinicId)
      await updateDoc(clinicRef, {
        bloodBank: bloodBankData,
      })
      return true
    } catch (error) {
      console.error("Error updating blood bank:", error)
      throw error
    }
  },

  // Update doctors data
  async updateDoctors(clinicId, doctorsData) {
    try {
      const clinicRef = doc(db, "clinics", clinicId)
      await updateDoc(clinicRef, {
        doctors: doctorsData,
      })
      return true
    } catch (error) {
      console.error("Error updating doctors:", error)
      throw error
    }
  },

  // Add or update a single doctor
  async updateDoctor(clinicId, doctorId, doctorData) {
    try {
      const clinicRef = doc(db, "clinics", clinicId)
      const clinicSnap = await getDoc(clinicRef)

      if (clinicSnap.exists()) {
        const clinicData = clinicSnap.data()
        const updatedDoctors = {
          ...clinicData.doctors,
          [doctorId]: doctorData,
        }

        await updateDoc(clinicRef, {
          doctors: updatedDoctors,
        })
        return true
      }
      throw new Error("Clinic not found")
    } catch (error) {
      console.error("Error updating doctor:", error)
      throw error
    }
  },
}
