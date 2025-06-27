"use client"

import { useRequireAuth } from "../../hooks/useRequireAuth"
import { useAuth } from "../../contexts/AuthContext"
import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { firestoreService } from "../../services/firestoreService"
import { Edit, Plus, Save, X, Users, Bed, Droplets, Activity, UserPlus, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useRequireAuth()
  const { logout } = useAuth()
  const [tokenInfo, setTokenInfo] = useState(null)
  const [tokenLoading, setTokenLoading] = useState(true)
  const [clinicData, setClinicData] = useState(null)
  const [clinicLoading, setClinicLoading] = useState(true)
  const [clinicError, setClinicError] = useState(null)

  // Edit states
  const [editingBeds, setEditingBeds] = useState(false)
  const [editingBloodBank, setEditingBloodBank] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [bedFormData, setBedFormData] = useState({})
  const [bloodBankFormData, setBloodBankFormData] = useState({})
  const [doctorFormData, setDoctorFormData] = useState({})
  const [newBedType, setNewBedType] = useState({ name: "", count: "" })
  const [newBloodGroup, setNewBloodGroup] = useState({ type: "", count: "" })
  const [newDoctor, setNewDoctor] = useState({
    Name: "",
    department: "",
    location: "",
    TokensProvided: 0,
    TokensServed: 0,
    availaibilitty: true,
  })

  // Dialog states
  const [showAddBedDialog, setShowAddBedDialog] = useState(false)
  const [showAddBloodDialog, setShowAddBloodDialog] = useState(false)
  const [showAddDoctorDialog, setShowAddDoctorDialog] = useState(false)

  // Toast state
  const [toast, setToast] = useState(null)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (user) {
        try {
          const token = await user.getIdToken()
          const tokenResult = await user.getIdTokenResult()

          const decodeJWT = (token) => {
            try {
              const base64Url = token.split(".")[1]
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join(""),
              )
              return JSON.parse(jsonPayload)
            } catch (error) {
              console.error("Error decoding JWT:", error)
              return null
            }
          }

          const decodedToken = decodeJWT(token)

          setTokenInfo({
            token,
            tokenResult,
            decodedToken,
            cookieToken: Cookies.get("auth-token"),
          })
        } catch (error) {
          console.error("Error fetching token info:", error)
        } finally {
          setTokenLoading(false)
        }
      }
    }

    fetchTokenInfo()
  }, [user])

  useEffect(() => {
    const fetchClinicData = async () => {
      if (user && user.email) {
        try {
          setClinicLoading(true)
          setClinicError(null)
          const data = await firestoreService.getClinicByUserEmail(user.email)
          setClinicData(data)

          // Initialize form data
          if (data?.clinic?.bedSection) {
            setBedFormData(data.clinic.bedSection)
          }
          if (data?.clinic?.bloodBank) {
            setBloodBankFormData(data.clinic.bloodBank)
          }
        } catch (error) {
          console.error("Error fetching clinic data:", error)
          setClinicError(error.message)
        } finally {
          setClinicLoading(false)
        }
      }
    }

    fetchClinicData()
  }, [user])

  const refreshClinicData = async () => {
    if (user && user.email) {
      try {
        const data = await firestoreService.getClinicByUserEmail(user.email)
        setClinicData(data)
        setBedFormData(data.clinic.bedSection)
        setBloodBankFormData(data.clinic.bloodBank)
        showToast("Data refreshed successfully")
      } catch (error) {
        showToast("Failed to refresh clinic data", "error")
      }
    }
  }

  // Bed Section Functions
  const handleBedEdit = () => {
    setEditingBeds(true)
  }

  const handleBedSave = async () => {
    setIsSubmitting(true)
    try {
      await firestoreService.updateBedSection(clinicData.clinic.id, bedFormData)
      setEditingBeds(false)
      await refreshClinicData()
      showToast("Bed section updated successfully")
    } catch (error) {
      showToast("Failed to update bed section", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBedCancel = () => {
    setBedFormData(clinicData.clinic.bedSection)
    setEditingBeds(false)
  }

  const handleAddNewBedType = async () => {
    if (!newBedType.name || !newBedType.count) {
      showToast("Please fill in both bed type name and count", "error")
      return
    }

    const updatedBedData = {
      ...bedFormData,
      Bedinfo: {
        ...bedFormData.Bedinfo,
        [newBedType.name]: Number.parseInt(newBedType.count),
      },
    }

    setIsSubmitting(true)
    try {
      await firestoreService.updateBedSection(clinicData.clinic.id, updatedBedData)
      setNewBedType({ name: "", count: "" })
      setShowAddBedDialog(false)
      await refreshClinicData()
      showToast("New bed type added successfully")
    } catch (error) {
      showToast("Failed to add new bed type", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Blood Bank Functions
  const handleBloodBankEdit = () => {
    setEditingBloodBank(true)
  }

  const handleBloodBankSave = async () => {
    setIsSubmitting(true)
    try {
      await firestoreService.updateBloodBank(clinicData.clinic.id, bloodBankFormData)
      setEditingBloodBank(false)
      await refreshClinicData()
      showToast("Blood bank updated successfully")
    } catch (error) {
      showToast("Failed to update blood bank", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBloodBankCancel = () => {
    setBloodBankFormData(clinicData.clinic.bloodBank)
    setEditingBloodBank(false)
  }

  const handleAddNewBloodGroup = async () => {
    if (!newBloodGroup.type || !newBloodGroup.count) {
      showToast("Please fill in both blood group type and count", "error")
      return
    }

    const updatedBloodData = {
      ...bloodBankFormData,
      [newBloodGroup.type]: newBloodGroup.count,
    }

    setIsSubmitting(true)
    try {
      await firestoreService.updateBloodBank(clinicData.clinic.id, updatedBloodData)
      setNewBloodGroup({ type: "", count: "" })
      setShowAddBloodDialog(false)
      await refreshClinicData()
      showToast("New blood group added successfully")
    } catch (error) {
      showToast("Failed to add new blood group", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Doctor Functions
  const handleDoctorEdit = (doctorId) => {
    setEditingDoctor(doctorId)
    setDoctorFormData(clinicData.clinic.doctors[doctorId])
  }

  const handleDoctorSave = async (doctorId) => {
    setIsSubmitting(true)
    try {
      await firestoreService.updateDoctor(clinicData.clinic.id, doctorId, doctorFormData)
      setEditingDoctor(null)
      await refreshClinicData()
      showToast("Doctor information updated successfully")
    } catch (error) {
      showToast("Failed to update doctor information", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDoctorCancel = () => {
    setEditingDoctor(null)
    setDoctorFormData({})
  }

  const handleAddNewDoctor = async () => {
    if (!newDoctor.Name || !newDoctor.department || !newDoctor.location) {
      showToast("Please fill in all required fields", "error")
      return
    }

    const doctorId = Date.now().toString() // Simple ID generation
    setIsSubmitting(true)
    try {
      await firestoreService.updateDoctor(clinicData.clinic.id, doctorId, newDoctor)
      setNewDoctor({
        Name: "",
        department: "",
        location: "",
        TokensProvided: 0,
        TokensServed: 0,
        availaibilitty: true,
      })
      setShowAddDoctorDialog(false)
      await refreshClinicData()
      showToast("New doctor added successfully")
    } catch (error) {
      showToast("Failed to add new doctor", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const renderBedSection = () => {
    if (!clinicData?.clinic?.bedSection) return null

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bed className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Bed Management</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddBedDialog(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bed Type
              </button>
              {!editingBeds ? (
                <button
                  onClick={handleBedEdit}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleBedSave}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={handleBedCancel}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Bed Types */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Bed Types</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {bedFormData.Bedinfo &&
                  Object.entries(bedFormData.Bedinfo).map(([bedType, count]) => (
                    <div
                      key={bedType}
                      className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg"
                    >
                      <div className="text-blue-100 text-sm font-medium">{bedType} Beds</div>
                      {editingBeds ? (
                        <input
                          type="number"
                          value={bedFormData.Bedinfo[bedType]}
                          onChange={(e) =>
                            setBedFormData({
                              ...bedFormData,
                              Bedinfo: {
                                ...bedFormData.Bedinfo,
                                [bedType]: Number.parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          className="mt-2 w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <div className="text-2xl font-bold">{count}</div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Bed Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Bed Status</h4>
              <div className="grid grid-cols-3 gap-4">
                {["available", "cleaning", "occupied"].map((status) => (
                  <div
                    key={status}
                    className={`p-4 rounded-xl shadow-lg text-white ${
                      status === "available"
                        ? "bg-gradient-to-br from-green-500 to-green-600"
                        : status === "cleaning"
                          ? "bg-gradient-to-br from-orange-500 to-orange-600"
                          : "bg-gradient-to-br from-purple-500 to-purple-600"
                    }`}
                  >
                    <div className="text-sm font-medium opacity-90 capitalize">{status}</div>
                    {editingBeds ? (
                      <input
                        type="number"
                        value={bedFormData[status] || 0}
                        onChange={(e) =>
                          setBedFormData({
                            ...bedFormData,
                            [status]: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        className="mt-2 w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="text-2xl font-bold">{bedFormData[status] || 0}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderBloodBankSection = () => {
    if (!clinicData?.clinic?.bloodBank) return null

    const bloodTypes = Object.entries(bloodBankFormData).filter(([key]) => key !== "currentStatus")

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplets className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Blood Bank</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Current Status: {bloodBankFormData.currentStatus || 0}
              </span>
              <button
                onClick={() => setShowAddBloodDialog(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Blood Group
              </button>
              {!editingBloodBank ? (
                <button
                  onClick={handleBloodBankEdit}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleBloodBankSave}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={handleBloodBankCancel}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bloodTypes.map(([bloodType, count]) => (
              <div
                key={bloodType}
                className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-xl shadow-lg text-center"
              >
                <div className="text-red-100 text-sm font-medium mb-2">{bloodType}</div>
                {editingBloodBank ? (
                  <input
                    type="number"
                    value={bloodBankFormData[bloodType]}
                    onChange={(e) =>
                      setBloodBankFormData({
                        ...bloodBankFormData,
                        [bloodType]: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                  />
                ) : (
                  <div className="text-2xl font-bold">{count}</div>
                )}
                <div className="text-red-200 text-xs mt-1">Units Available</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderDoctorsSection = () => {
    if (!clinicData?.clinic?.doctors) return null

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Medical Staff</h2>
            </div>
            <button
              onClick={() => setShowAddDoctorDialog(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Doctor
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(clinicData.clinic.doctors).map(([doctorId, doctor]) => (
              <div
                key={doctorId}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {doctor.Name.charAt(0)}
                    </div>
                    <div>
                      {editingDoctor === doctorId ? (
                        <input
                          type="text"
                          value={doctorFormData.Name}
                          onChange={(e) => setDoctorFormData({ ...doctorFormData, Name: e.target.value })}
                          className="text-lg font-semibold mb-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.Name}</h3>
                      )}
                      {editingDoctor === doctorId ? (
                        <input
                          type="text"
                          value={doctorFormData.department}
                          onChange={(e) => setDoctorFormData({ ...doctorFormData, department: e.target.value })}
                          className="text-sm px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">{doctor.department}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingDoctor === doctorId ? (
                      <select
                        value={doctorFormData.availaibilitty?.toString()}
                        onChange={(e) =>
                          setDoctorFormData({ ...doctorFormData, availaibilitty: e.target.value === "true" })
                        }
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="true">Available</option>
                        <option value="false">Not Available</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          doctor.availaibilitty ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {doctor.availaibilitty ? "🟢 Available" : "🔴 Not Available"}
                      </span>
                    )}
                    {editingDoctor === doctorId ? (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleDoctorSave(doctorId)}
                          disabled={isSubmitting}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={handleDoctorCancel}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDoctorEdit(doctorId)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 font-medium">Location</div>
                    {editingDoctor === doctorId ? (
                      <input
                        type="text"
                        value={doctorFormData.location}
                        onChange={(e) => setDoctorFormData({ ...doctorFormData, location: e.target.value })}
                        className="mt-1 w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="text-gray-900">{doctor.location}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-gray-500 font-medium">Tokens Provided</div>
                    {editingDoctor === doctorId ? (
                      <input
                        type="number"
                        value={doctorFormData.TokensProvided}
                        onChange={(e) =>
                          setDoctorFormData({ ...doctorFormData, TokensProvided: Number.parseInt(e.target.value) || 0 })
                        }
                        className="mt-1 w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="text-blue-600 font-semibold">{doctor.TokensProvided || 0}</div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-500 font-medium">Tokens Served</div>
                    {editingDoctor === doctorId ? (
                      <input
                        type="number"
                        value={doctorFormData.TokensServed}
                        onChange={(e) =>
                          setDoctorFormData({ ...doctorFormData, TokensServed: Number.parseInt(e.target.value) || 0 })
                        }
                        className="mt-1 w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="text-green-600 font-semibold">{doctor.TokensServed || 0}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-md shadow-lg ${
              toast.type === "success"
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Add Bed Type Modal */}
      {showAddBedDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Bed Type</h3>
              <p className="text-sm text-gray-500 mb-4">Add a new type of bed to your hospital inventory.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bed Type Name</label>
                  <input
                    type="text"
                    value={newBedType.name}
                    onChange={(e) => setNewBedType({ ...newBedType, name: e.target.value })}
                    placeholder="e.g., Emergency, Pediatric"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                  <input
                    type="number"
                    value={newBedType.count}
                    onChange={(e) => setNewBedType({ ...newBedType, count: e.target.value })}
                    placeholder="Number of beds"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddBedDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewBedType}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Bed Type
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Blood Group Modal */}
      {showAddBloodDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Blood Group</h3>
              <p className="text-sm text-gray-500 mb-4">Add a new blood group to your blood bank inventory.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group Type</label>
                  <input
                    type="text"
                    value={newBloodGroup.type}
                    onChange={(e) => setNewBloodGroup({ ...newBloodGroup, type: e.target.value })}
                    placeholder="e.g., AB+, O-, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units Available</label>
                  <input
                    type="number"
                    value={newBloodGroup.count}
                    onChange={(e) => setNewBloodGroup({ ...newBloodGroup, count: e.target.value })}
                    placeholder="Number of units"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddBloodDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewBloodGroup}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Blood Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctorDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Doctor</h3>
              <p className="text-sm text-gray-500 mb-4">Add a new doctor to your medical staff.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newDoctor.Name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, Name: e.target.value })}
                    placeholder="Doctor's full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <input
                    type="text"
                    value={newDoctor.department}
                    onChange={(e) => setNewDoctor({ ...newDoctor, department: e.target.value })}
                    placeholder="e.g., Cardiology, Neurology"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={newDoctor.location}
                    onChange={(e) => setNewDoctor({ ...newDoctor, location: e.target.value })}
                    placeholder="Office location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tokens Provided</label>
                    <input
                      type="number"
                      value={newDoctor.TokensProvided}
                      onChange={(e) =>
                        setNewDoctor({ ...newDoctor, TokensProvided: Number.parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tokens Served</label>
                    <input
                      type="number"
                      value={newDoctor.TokensServed}
                      onChange={(e) =>
                        setNewDoctor({ ...newDoctor, TokensServed: Number.parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <select
                    value={newDoctor.availaibilitty.toString()}
                    onChange={(e) => setNewDoctor({ ...newDoctor, availaibilitty: e.target.value === "true" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddDoctorDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewDoctor}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                {clinicData?.clinic?.Name ? `${clinicData.clinic.Name} Dashboard` : "Hospital Dashboard"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshClinicData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Clinic Information */}
          {clinicLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading clinic information...</div>
            </div>
          ) : clinicError ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 text-red-600">
                <X className="w-5 h-5" />
                <div>
                  <h3 className="text-sm font-medium">Error loading clinic data</h3>
                  <p className="text-sm mt-1">{clinicError}</p>
                </div>
              </div>
            </div>
          ) : clinicData ? (
            <>
              {/* Clinic Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Clinic Overview</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl">
                      <div className="text-indigo-600 text-sm font-medium">Clinic Name</div>
                      <div className="text-2xl font-bold text-indigo-900 mt-1">{clinicData.clinic.Name}</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                      <div className="text-yellow-600 text-sm font-medium">Rating</div>
                      <div className="text-2xl font-bold text-yellow-900 mt-1 flex items-center">
                        ⭐ {clinicData.clinic.Rating}/5.0
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                      <div className="text-blue-600 text-sm font-medium">Tokens Provided</div>
                      <div className="text-2xl font-bold text-blue-900 mt-1">{clinicData.clinic.TokensProvided}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                      <div className="text-green-600 text-sm font-medium">User Role</div>
                      <div className="text-2xl font-bold text-green-900 mt-1 capitalize">{clinicData.user.role}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bed Section */}
              {renderBedSection()}

              {/* Blood Bank */}
              {renderBloodBankSection()}

              {/* Doctors */}
              {renderDoctorsSection()}
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}
