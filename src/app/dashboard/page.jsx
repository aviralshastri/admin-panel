"use client"

import { useRequireAuth } from "../../hooks/useRequireAuth"
import { useAuth } from "../../contexts/AuthContext"
import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { firestoreService } from "../../services/firestoreService"
import { useGeolocation } from "../../hooks/useGeolocation"
import MapComponent from "../../components/MapComponent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Edit,
  Plus,
  Save,
  X,
  Users,
  Bed,
  Droplets,
  Activity,
  UserPlus,
  RefreshCw,
  MapPin,
  Navigation,
  Loader,
  Star,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Heart,
  Stethoscope,
  Shield,
} from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useRequireAuth()
  const { logout } = useAuth()
  const {
    location: currentLocation,
    error: locationError,
    loading: locationLoading,
    getCurrentLocation,
  } = useGeolocation()
  const [tokenInfo, setTokenInfo] = useState(null)
  const [tokenLoading, setTokenLoading] = useState(true)
  const [clinicData, setClinicData] = useState(null)
  const [clinicLoading, setClinicLoading] = useState(true)
  const [clinicError, setClinicError] = useState(null)

  // Edit states
  const [editingOverview, setEditingOverview] = useState(false)
  const [editingBeds, setEditingBeds] = useState(false)
  const [editingBloodBank, setEditingBloodBank] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [overviewFormData, setOverviewFormData] = useState({})
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

  // Default/dummy location (New Delhi, India)
  const defaultLocation = {
    latitude: 28.6139,
    longitude: 77.209,
    address: "New Delhi, India",
    timestamp: new Date().toISOString(),
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

          // Initialize form data with proper location handling
          const clinicInfo = {
            Name: data.clinic.Name || "Your Clinic Name",
            Rating: data.clinic.Rating || 4.5,
            TokensProvided: data.clinic.TokensProvided || 0,
            location: data.clinic.location || defaultLocation,
            address: data.clinic.address || defaultLocation.address,
          }
          setOverviewFormData(clinicInfo)

          if (data?.clinic?.bedSection) {
            setBedFormData(data.clinic.bedSection)
          }
          if (data?.clinic?.bloodBank) {
            setBloodBankFormData(data.clinic.bloodBank)
          }
        } catch (error) {
          console.error("Error fetching clinic data:", error)
          setClinicError(error.message)
          // Set default data if clinic doesn't exist
          setOverviewFormData({
            Name: "Your Clinic Name",
            Rating: 4.5,
            TokensProvided: 0,
            location: defaultLocation,
            address: defaultLocation.address,
          })
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

        const clinicInfo = {
          Name: data.clinic.Name || "Your Clinic Name",
          Rating: data.clinic.Rating || 4.5,
          TokensProvided: data.clinic.TokensProvided || 0,
          location: data.clinic.location || defaultLocation,
          address: data.clinic.address || defaultLocation.address,
        }
        setOverviewFormData(clinicInfo)
        setBedFormData(data.clinic.bedSection)
        setBloodBankFormData(data.clinic.bloodBank)
        showToast("Data refreshed successfully")
      } catch (error) {
        showToast("Failed to refresh clinic data", "error")
      }
    }
  }

  // Overview Functions
  const handleOverviewEdit = () => {
    setEditingOverview(true)
  }

  const handleOverviewSave = async () => {
    setIsSubmitting(true)
    try {
      await firestoreService.updateClinicOverview(clinicData.clinic.id, overviewFormData)
      setEditingOverview(false)
      await refreshClinicData()
      showToast("Clinic overview updated successfully")
    } catch (error) {
      showToast("Failed to update clinic overview", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverviewCancel = () => {
    const clinicInfo = {
      Name: clinicData.clinic.Name || "Your Clinic Name",
      Rating: clinicData.clinic.Rating || 4.5,
      TokensProvided: clinicData.clinic.TokensProvided || 0,
      location: clinicData.clinic.location || defaultLocation,
      address: clinicData.clinic.address || defaultLocation.address,
    }
    setOverviewFormData(clinicInfo)
    setEditingOverview(false)
  }

  const handleUseCurrentLocation = async () => {
    if (currentLocation) {
      const address = `Lat: ${currentLocation.latitude.toFixed(6)}, Lng: ${currentLocation.longitude.toFixed(6)}`
      setOverviewFormData({
        ...overviewFormData,
        location: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          timestamp: currentLocation.timestamp,
          accuracy: currentLocation.accuracy,
        },
        address: address,
      })
      showToast("Current location added successfully")
    } else {
      getCurrentLocation()
      showToast("Getting your current location...", "info")
    }
  }

  // Auto-update location when geolocation is successful
  useEffect(() => {
    if (currentLocation && editingOverview) {
      const address = `Lat: ${currentLocation.latitude.toFixed(6)}, Lng: ${currentLocation.longitude.toFixed(6)}`
      setOverviewFormData((prev) => ({
        ...prev,
        location: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          timestamp: currentLocation.timestamp,
          accuracy: currentLocation.accuracy,
        },
        address: address,
      }))
      showToast("Location updated from GPS")
    }
  }, [currentLocation, editingOverview])

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

    const doctorId = Date.now().toString()
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-900">Loading Dashboard</h3>
            <p className="text-sm text-slate-600 mt-2">Please wait while we fetch your clinic data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayLocation = {
    latitude: overviewFormData.location?.latitude ?? defaultLocation.latitude,
    longitude: overviewFormData.location?.longitude ?? defaultLocation.longitude,
    address: overviewFormData.address || defaultLocation.address,
    timestamp: overviewFormData.location?.timestamp || defaultLocation.timestamp,
    accuracy: overviewFormData.location?.accuracy || null,
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Clinic Name</p>
                {editingOverview ? (
                  <Input
                    value={overviewFormData.Name}
                    onChange={(e) => setOverviewFormData({ ...overviewFormData, Name: e.target.value })}
                    className="mt-2 font-bold text-xl"
                  />
                ) : (
                  <h3 className="text-2xl font-bold text-slate-900">{overviewFormData.Name}</h3>
                )}
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Rating</p>
                {editingOverview ? (
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={overviewFormData.Rating}
                    onChange={(e) =>
                      setOverviewFormData({ ...overviewFormData, Rating: Number.parseFloat(e.target.value) || 0 })
                    }
                    className="mt-2 font-bold text-xl"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-bold text-slate-900">{overviewFormData.Rating}</h3>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="text-sm text-slate-600 ml-1">/5.0</span>
                    </div>
                  </div>
                )}
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tokens Provided</p>
                {editingOverview ? (
                  <Input
                    type="number"
                    value={overviewFormData.TokensProvided}
                    onChange={(e) =>
                      setOverviewFormData({
                        ...overviewFormData,
                        TokensProvided: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-2 font-bold text-xl"
                  />
                ) : (
                  <h3 className="text-2xl font-bold text-slate-900">{overviewFormData.TokensProvided}</h3>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">User Role</p>
                <h3 className="text-2xl font-bold text-slate-900 capitalize">{clinicData?.user?.role || "Admin"}</h3>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <CardTitle>Clinic Location</CardTitle>
              </div>
              {editingOverview && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={getCurrentLocation} disabled={locationLoading}>
                    {locationLoading ? (
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Navigation className="h-4 w-4 mr-2" />
                    )}
                    Get GPS
                  </Button>
                  {currentLocation && (
                    <Button size="sm" onClick={handleUseCurrentLocation}>
                      Use Current
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingOverview ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={overviewFormData.address}
                    onChange={(e) => setOverviewFormData({ ...overviewFormData, address: e.target.value })}
                    placeholder="Enter clinic address"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={displayLocation.latitude || 0}
                      onChange={(e) =>
                        setOverviewFormData({
                          ...overviewFormData,
                          location: { ...displayLocation, latitude: Number.parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={displayLocation.longitude || 0}
                      onChange={(e) =>
                        setOverviewFormData({
                          ...overviewFormData,
                          location: { ...displayLocation, longitude: Number.parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                {currentLocation && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      GPS Location Available: {currentLocation.latitude.toFixed(6)},{" "}
                      {currentLocation.longitude.toFixed(6)}
                      {currentLocation.accuracy && ` (±${Math.round(currentLocation.accuracy)}m)`}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">Address</p>
                  <p className="text-slate-900">{overviewFormData.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Latitude</p>
                    <p className="text-slate-900 font-mono">{(displayLocation.latitude || 0).toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Longitude</p>
                    <p className="text-slate-900 font-mono">{(displayLocation.longitude || 0).toFixed(6)}</p>
                  </div>
                </div>
                {displayLocation.accuracy && typeof displayLocation.accuracy === "number" && (
                  <div>
                    <p className="text-sm font-medium text-slate-600">Accuracy</p>
                    <p className="text-slate-900">±{Math.round(displayLocation.accuracy)} meters</p>
                  </div>
                )}
              </div>
            )}

            {locationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle>Location on Map</CardTitle>
            {displayLocation && (
              <CardDescription>
                Last updated: {displayLocation.timestamp && new Date(displayLocation.timestamp).toLocaleDateString()}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80 rounded-lg overflow-hidden">
              <MapComponent location={displayLocation} className="w-full h-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {!editingOverview ? (
          <Button onClick={handleOverviewEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Overview
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={handleOverviewCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleOverviewSave} disabled={isSubmitting}>
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </>
        )}
      </div>
    </div>
  )

  const renderBedManagementTab = () => {
    if (!clinicData?.clinic?.bedSection) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Bed className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Bed Data Available</h3>
            <p className="text-slate-600 text-center">
              Bed management data will appear here once you add bed information to your clinic.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        {/* Bed Types */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Bed className="h-5 w-5" />
                  <span>Bed Types</span>
                </CardTitle>
                <CardDescription>Manage different types of beds in your facility</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Dialog open={showAddBedDialog} onOpenChange={setShowAddBedDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bed Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Bed Type</DialogTitle>
                      <DialogDescription>Add a new type of bed to your hospital inventory.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bedTypeName">Bed Type Name</Label>
                        <Input
                          id="bedTypeName"
                          value={newBedType.name}
                          onChange={(e) => setNewBedType({ ...newBedType, name: e.target.value })}
                          placeholder="e.g., Emergency, Pediatric"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bedCount">Count</Label>
                        <Input
                          id="bedCount"
                          type="number"
                          value={newBedType.count}
                          onChange={(e) => setNewBedType({ ...newBedType, count: e.target.value })}
                          placeholder="Number of beds"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddBedDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddNewBedType} disabled={isSubmitting}>
                        {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
                        Add Bed Type
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {!editingBeds ? (
                  <Button onClick={handleBedEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleBedCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleBedSave} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bedFormData.Bedinfo &&
                Object.entries(bedFormData.Bedinfo).map(([bedType, count]) => (
                  <Card key={bedType} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">{bedType} Beds</p>
                          {editingBeds ? (
                            <Input
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
                              className="mt-2 font-bold text-xl"
                            />
                          ) : (
                            <h3 className="text-2xl font-bold text-slate-900">{count}</h3>
                          )}
                        </div>
                        <Bed className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Bed Status */}
        <Card>
          <CardHeader>
            <CardTitle>Bed Status Overview</CardTitle>
            <CardDescription>Current status of all beds in your facility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { status: "available", label: "Available", color: "green", icon: CheckCircle },
                { status: "cleaning", label: "Cleaning", color: "yellow", icon: RefreshCw },
                { status: "occupied", label: "Occupied", color: "red", icon: Users },
              ].map(({ status, label, color, icon: Icon }) => (
                <Card key={status} className={`border-l-4 border-l-${color}-500`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{label}</p>
                        {editingBeds ? (
                          <Input
                            type="number"
                            value={bedFormData[status] || 0}
                            onChange={(e) =>
                              setBedFormData({
                                ...bedFormData,
                                [status]: Number.parseInt(e.target.value) || 0,
                              })
                            }
                            className="mt-2 font-bold text-xl"
                          />
                        ) : (
                          <h3 className="text-2xl font-bold text-slate-900">{bedFormData[status] || 0}</h3>
                        )}
                      </div>
                      <Icon className={`h-8 w-8 text-${color}-500`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderBloodBankTab = () => {
    if (!clinicData?.clinic?.bloodBank) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Droplets className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Blood Bank Data Available</h3>
            <p className="text-slate-600 text-center">
              Blood bank information will appear here once you add blood inventory data to your clinic.
            </p>
          </CardContent>
        </Card>
      )
    }

    const bloodTypes = Object.entries(bloodBankFormData).filter(([key]) => key !== "currentStatus")

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5" />
                  <span>Blood Bank Inventory</span>
                </CardTitle>
                <CardDescription>
                  Current Status: {bloodBankFormData.currentStatus || 0} units available
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Dialog open={showAddBloodDialog} onOpenChange={setShowAddBloodDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Blood Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Blood Group</DialogTitle>
                      <DialogDescription>Add a new blood group to your blood bank inventory.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bloodType">Blood Group Type</Label>
                        <Input
                          id="bloodType"
                          value={newBloodGroup.type}
                          onChange={(e) => setNewBloodGroup({ ...newBloodGroup, type: e.target.value })}
                          placeholder="e.g., AB+, O-, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="bloodCount">Units Available</Label>
                        <Input
                          id="bloodCount"
                          type="number"
                          value={newBloodGroup.count}
                          onChange={(e) => setNewBloodGroup({ ...newBloodGroup, count: e.target.value })}
                          placeholder="Number of units"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddBloodDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddNewBloodGroup} disabled={isSubmitting}>
                        {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
                        Add Blood Group
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {!editingBloodBank ? (
                  <Button onClick={handleBloodBankEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleBloodBankCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleBloodBankSave} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {bloodTypes.map(([bloodType, count]) => (
                <Card key={bloodType} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Heart className="h-6 w-6 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">{bloodType}</p>
                        {editingBloodBank ? (
                          <Input
                            type="number"
                            value={bloodBankFormData[bloodType]}
                            onChange={(e) =>
                              setBloodBankFormData({
                                ...bloodBankFormData,
                                [bloodType]: e.target.value,
                              })
                            }
                            className="mt-1 text-center font-bold"
                          />
                        ) : (
                          <h3 className="text-xl font-bold text-slate-900">{count}</h3>
                        )}
                        <p className="text-xs text-slate-500">Units</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderMedicalStaffTab = () => {
    if (!clinicData?.clinic?.doctors) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Stethoscope className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Medical Staff Data Available</h3>
            <p className="text-slate-600 text-center">
              Medical staff information will appear here once you add doctor profiles to your clinic.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Medical Staff</span>
                </CardTitle>
                <CardDescription>Manage your clinic's medical professionals</CardDescription>
              </div>
              <Dialog open={showAddDoctorDialog} onOpenChange={setShowAddDoctorDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Doctor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Doctor</DialogTitle>
                    <DialogDescription>Add a new doctor to your medical staff.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="doctorName">Name *</Label>
                      <Input
                        id="doctorName"
                        value={newDoctor.Name}
                        onChange={(e) => setNewDoctor({ ...newDoctor, Name: e.target.value })}
                        placeholder="Doctor's full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
                        value={newDoctor.department}
                        onChange={(e) => setNewDoctor({ ...newDoctor, department: e.target.value })}
                        placeholder="e.g., Cardiology, Neurology"
                      />
                    </div>
                    <div>
                      <Label htmlFor="doctorLocation">Location *</Label>
                      <Input
                        id="doctorLocation"
                        value={newDoctor.location}
                        onChange={(e) => setNewDoctor({ ...newDoctor, location: e.target.value })}
                        placeholder="Office location"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tokensProvided">Tokens Provided</Label>
                        <Input
                          id="tokensProvided"
                          type="number"
                          value={newDoctor.TokensProvided}
                          onChange={(e) =>
                            setNewDoctor({ ...newDoctor, TokensProvided: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="tokensServed">Tokens Served</Label>
                        <Input
                          id="tokensServed"
                          type="number"
                          value={newDoctor.TokensServed}
                          onChange={(e) =>
                            setNewDoctor({ ...newDoctor, TokensServed: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="availability">Availability</Label>
                      <Select
                        value={newDoctor.availaibilitty.toString()}
                        onValueChange={(value) => setNewDoctor({ ...newDoctor, availaibilitty: value === "true" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Available</SelectItem>
                          <SelectItem value="false">Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDoctorDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddNewDoctor} disabled={isSubmitting}>
                      {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
                      Add Doctor
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(clinicData.clinic.doctors).map(([doctorId, doctor]) => (
                <Card key={doctorId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {doctor.Name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          {editingDoctor === doctorId ? (
                            <div className="space-y-2">
                              <Input
                                value={doctorFormData.Name}
                                onChange={(e) => setDoctorFormData({ ...doctorFormData, Name: e.target.value })}
                                className="font-semibold"
                              />
                              <Input
                                value={doctorFormData.department}
                                onChange={(e) => setDoctorFormData({ ...doctorFormData, department: e.target.value })}
                                className="text-sm"
                              />
                            </div>
                          ) : (
                            <>
                              <h3 className="font-semibold text-slate-900">{doctor.Name}</h3>
                              <p className="text-sm text-slate-600">{doctor.department}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {editingDoctor === doctorId ? (
                          <Select
                            value={doctorFormData.availaibilitty?.toString()}
                            onValueChange={(value) =>
                              setDoctorFormData({ ...doctorFormData, availaibilitty: value === "true" })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Available</SelectItem>
                              <SelectItem value="false">Not Available</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={doctor.availaibilitty ? "default" : "secondary"}>
                            {doctor.availaibilitty ? "Available" : "Not Available"}
                          </Badge>
                        )}
                        {editingDoctor === doctorId ? (
                          <div className="flex space-x-1">
                            <Button size="sm" onClick={() => handleDoctorSave(doctorId)} disabled={isSubmitting}>
                              {isSubmitting ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleDoctorCancel}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleDoctorEdit(doctorId)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-slate-600">Location</p>
                        {editingDoctor === doctorId ? (
                          <Input
                            value={doctorFormData.location}
                            onChange={(e) => setDoctorFormData({ ...doctorFormData, location: e.target.value })}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-slate-900">{doctor.location}</p>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-600">Tokens Provided</p>
                        {editingDoctor === doctorId ? (
                          <Input
                            type="number"
                            value={doctorFormData.TokensProvided}
                            onChange={(e) =>
                              setDoctorFormData({
                                ...doctorFormData,
                                TokensProvided: Number.parseInt(e.target.value) || 0,
                              })
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-blue-600 font-semibold">{doctor.TokensProvided || 0}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <p className="font-medium text-slate-600">Tokens Served</p>
                        {editingDoctor === doctorId ? (
                          <Input
                            type="number"
                            value={doctorFormData.TokensServed}
                            onChange={(e) =>
                              setDoctorFormData({
                                ...doctorFormData,
                                TokensServed: Number.parseInt(e.target.value) || 0,
                              })
                            }
                            className="mt-1"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-green-600 font-semibold">{doctor.TokensServed || 0}</p>
                            {doctor.TokensProvided > 0 && (
                              <Progress
                                value={(doctor.TokensServed / doctor.TokensProvided) * 100}
                                className="flex-1 h-2"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Alert
            className={`w-96 ${
              toast.type === "success"
                ? "border-green-500 bg-green-50"
                : toast.type === "info"
                  ? "border-blue-500 bg-blue-50"
                  : "border-red-500 bg-red-50"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : toast.type === "info" ? (
              <AlertCircle className="h-4 w-4 text-blue-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={
                toast.type === "success" ? "text-green-800" : toast.type === "info" ? "text-blue-800" : "text-red-800"
              }
            >
              {toast.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {overviewFormData?.Name ? `${overviewFormData.Name}` : "Hospital Dashboard"}
                  </h1>
                  <p className="text-sm text-slate-600">Healthcare Management System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={refreshClinicData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-100 text-slate-600">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-900">{user.email}</p>
                  <p className="text-xs text-slate-600">{clinicData?.user?.role || "Admin"}</p>
                </div>
              </div>
              <Button variant="destructive" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {clinicLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-semibold text-slate-900">Loading clinic information...</h3>
              <p className="text-sm text-slate-600 mt-2">Please wait while we fetch your data.</p>
            </CardContent>
          </Card>
        ) : clinicError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error loading clinic data:</strong> {clinicError}
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="beds" className="flex items-center space-x-2">
                <Bed className="h-4 w-4" />
                <span>Bed Management</span>
              </TabsTrigger>
              <TabsTrigger value="blood" className="flex items-center space-x-2">
                <Droplets className="h-4 w-4" />
                <span>Blood Bank</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Medical Staff</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
            <TabsContent value="beds">{renderBedManagementTab()}</TabsContent>
            <TabsContent value="blood">{renderBloodBankTab()}</TabsContent>
            <TabsContent value="staff">{renderMedicalStaffTab()}</TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
