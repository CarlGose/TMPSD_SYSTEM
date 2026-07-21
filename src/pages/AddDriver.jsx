import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  UserPlus, 
  Loader2, 
  Image as ImageIcon, 
  FileText,
  ArrowLeft,
  CheckCircle2,
  Camera,
  ArrowRight,
  Video,
  Eye
} from 'lucide-react'
import TodaCombobox from '@/components/TodaCombobox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

const CameraCapture = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        setStream(s)
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
      })
      .catch(err => {
        console.error("Error accessing camera:", err)
        toast.error("Could not access camera. Please ensure permissions are granted.")
      })
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })
        const preview = URL.createObjectURL(blob)
        onCapture(file, preview)
        if (stream) stream.getTracks().forEach(t => t.stop())
      }, 'image/jpeg')
    }
  }

  const cancel = () => {
    if (stream) stream.getTracks().forEach(t => t.stop())
    onCancel()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-background rounded-xl p-4 max-w-md w-full space-y-4">
        <h3 className="text-lg font-semibold">Take a Picture</h3>
        <div className="relative rounded-lg overflow-hidden bg-black aspect-square flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full" onClick={cancel}>Cancel</Button>
          <Button className="w-full" onClick={capture}>
            <Camera className="w-4 h-4 mr-2" />
            Capture
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AddDriver() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  
  const [form, setForm] = useState({
    // Operator
    operator_first_name: '',
    operator_last_name: '',
    operator_middle_name: '',
    operator_address: '',
    // Authorized Driver
    first_name: '',
    last_name: '',
    middle_name: '',      
    address: '',
    license: '',
    toda_affiliation: '',
    // Vehicle
    permit_no: '',
    valid_until: '',
    or_no: '',
    make: '',
    motor_no: '',
    chassis_no: '',
    plate_number: '',
    body_no: '',
  })

  // Checkboxes & UI State
  const [sameAsOperator, setSameAsOperator] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  // Photos
  const [profilePic, setProfilePic] = useState(null)
  const [profilePreview, setProfilePreview] = useState(null)
  
  const [licensePhoto, setLicensePhoto] = useState(null)
  const [licensePreview, setLicensePreview] = useState(null)

  const [orCrFile, setOrCrFile] = useState(null)
  const [orCrPreview, setOrCrPreview] = useState(null)

  const [tricyclePhoto, setTricyclePhoto] = useState(null)
  const [tricyclePreview, setTricyclePreview] = useState(null)

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Keep in sync if checkbox is checked
      if (sameAsOperator && field.startsWith('operator_')) {
        const driverField = field.replace('operator_', '')
        next[driverField] = value
      }
      return next
    })
  }

  const handleSameAsOperator = (e) => {
    const checked = e.target.checked
    setSameAsOperator(checked)
    if (checked) {
      setForm(prev => ({
        ...prev,
        first_name: prev.operator_first_name,
        last_name: prev.operator_last_name,
        middle_name: prev.operator_middle_name,
        address: prev.operator_address
      }))
    }
  }

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => setPreview(ev.target.result)
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    }
  }

  const handleCameraCapture = (file, preview) => {
    setProfilePic(file)
    setProfilePreview(preview)
    setShowCamera(false)
  }

  const uploadFile = async (file, bucket, folder) => {
    if (!file) return null
    const ext = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  const validateStep = () => {
    if (currentStep === 1) {
      if (!form.operator_first_name || !form.operator_last_name) {
        toast.error("Please fill in all required operator fields")
        return false
      }
    }
    if (currentStep === 2) {
      if (!form.first_name || !form.last_name || !form.license) {
        toast.error("Please fill in all required driver fields")
        return false
      }
    }
    if (currentStep === 3) {
      if (!form.plate_number || !form.body_no) {
        toast.error("Please fill in all required tricycle fields")
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(p => Math.min(p + 1, totalSteps))
    }
  }
  
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 1))

  const handleOpenSummary = (e) => {
    e.preventDefault()
    if (validateStep()) {
      setShowSummary(true)
    }
  }

  const handleSubmit = async () => {
    setShowSummary(false)
    setLoading(true)

    try {
      // Upload files
      const profilePicUrl = await uploadFile(profilePic, 'tricycle-photos', 'profiles')
      const licensePhotoUrl = await uploadFile(licensePhoto, 'documents', 'licenses')
      const orCrUrl = await uploadFile(orCrFile, 'documents', 'or-cr')
      const tricyclePhotoUrl = await uploadFile(tricyclePhoto, 'tricycle-photos', 'photos')

      // Insert driver
      const { data, error } = await supabase
        .from('drivers')
        .insert({
          driver_type: 'operator',
          first_name: form.first_name,
          last_name: form.last_name,
          middle_name: form.middle_name || null,
          address: form.address || null,
          license: form.license || 'N/A',
          toda_affiliation: form.toda_affiliation || null,
          operator_first_name: form.operator_first_name || null,
          operator_last_name: form.operator_last_name || null,
          operator_middle_name: form.operator_middle_name || null,
          operator_address: form.operator_address || null,
          plate_number: form.plate_number || 'N/A',
          body_sticker: form.body_no || 'N/A', 
          body_no: form.body_no || null,
          permit_no: form.permit_no || null,
          valid_until: form.valid_until || null,
          or_no: form.or_no || null,
          make: form.make || null,
          motor_no: form.motor_no || null,
          chassis_no: form.chassis_no || null,
          profile_picture_url: profilePicUrl,
          license_photo_url: licensePhotoUrl,
          or_cr_url: orCrUrl,
          tricycle_photo_url: tricyclePhotoUrl,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Registered successfully!')
      navigate(`/dashboard/drivers/${data.id}`)
    } catch (error) {
      console.error('Error adding:', error)
      toast.error(error.message || 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  const FileUploadBox = ({ id, label, accept, preview, file, onChange, icon: Icon, desc, onCameraClick }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
          id={id}
        />
        <div className="flex flex-col gap-2">
          <label
            htmlFor={id}
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 overflow-hidden"
          >
            {preview ? (
              <div className="relative w-full h-full bg-muted/10">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">Click to change</p>
                </div>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
                <p className="text-sm text-foreground font-medium truncate max-w-[80%]">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Click to change</p>
              </div>
            ) : (
              <>
                <Icon className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground text-center px-4">{desc}</p>
              </>
            )}
          </label>
          {onCameraClick && (
            <Button type="button" variant="outline" size="sm" onClick={onCameraClick} className="w-full">
              <Video className="w-4 h-4 mr-2" />
              Use Live Camera
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="slide-up">
        <Button
          variant="ghost"
          className="gap-2 mb-4 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Register Driver & Operator</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted/30 h-2 rounded-full mt-4 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Card className="glass-card border-border/30 slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {currentStep === 1 && "Operator Details"}
            {currentStep === 2 && "Authorized Driver Details"}
            {currentStep === 3 && "Tricycle Details"}
            {currentStep === 4 && "Upload Documents"}
          </CardTitle>
          <CardDescription>All fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* Step 1: Operator Details */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Operator First Name *</Label>
                    <Input
                      required
                      value={form.operator_first_name}
                      onChange={(e) => handleChange('operator_first_name', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Operator Last Name *</Label>
                    <Input
                      required
                      value={form.operator_last_name}
                      onChange={(e) => handleChange('operator_last_name', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Operator Middle Name</Label>
                    <Input
                      value={form.operator_middle_name}
                      onChange={(e) => handleChange('operator_middle_name', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Operator Address</Label>
                  <Input
                    value={form.operator_address}
                    onChange={(e) => handleChange('operator_address', e.target.value)}
                    className="bg-input/50 border-border/50"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Authorized Driver Details */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center space-x-2 bg-primary/10 p-3 rounded-lg border border-primary/20">
                  <input 
                    type="checkbox" 
                    id="sameAsOp" 
                    checked={sameAsOperator}
                    onChange={handleSameAsOperator}
                    className="h-4 w-4 rounded border-primary text-primary focus:ring-primary accent-primary"
                  />
                  <Label htmlFor="sameAsOp" className="font-semibold cursor-pointer">
                    Driver is also the Operator
                  </Label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Driver First Name *</Label>
                    <Input
                      required
                      disabled={sameAsOperator}
                      value={form.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Driver Last Name *</Label>
                    <Input
                      required
                      disabled={sameAsOperator}
                      value={form.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Driver Middle Name</Label>
                    <Input
                      disabled={sameAsOperator}
                      value={form.middle_name}
                      onChange={(e) => handleChange('middle_name', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Driver Address</Label>
                  <Input
                    disabled={sameAsOperator}
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="bg-input/50 border-border/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Driver's License No. *</Label>
                    <Input
                      required
                      value={form.license}
                      onChange={(e) => handleChange('license', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>TODA Affiliation</Label>
                    <TodaCombobox 
                      value={form.toda_affiliation}
                      onChange={(val) => handleChange('toda_affiliation', val)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Tricycle Details */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Permit No.</Label>
                    <Input
                      value={form.permit_no}
                      onChange={(e) => handleChange('permit_no', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date Valid Until</Label>
                    <Input
                      type="date"
                      value={form.valid_until}
                      onChange={(e) => handleChange('valid_until', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>OR No.</Label>
                    <Input
                      value={form.or_no}
                      onChange={(e) => handleChange('or_no', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Make (Brand of Motor)</Label>
                    <Input
                      value={form.make}
                      onChange={(e) => handleChange('make', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Motor No.</Label>
                    <Input
                      value={form.motor_no}
                      onChange={(e) => handleChange('motor_no', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chassis No.</Label>
                    <Input
                      value={form.chassis_no}
                      onChange={(e) => handleChange('chassis_no', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plate No. *</Label>
                    <Input
                      required
                      value={form.plate_number}
                      onChange={(e) => handleChange('plate_number', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body No. *</Label>
                    <Input
                      required
                      value={form.body_no}
                      onChange={(e) => handleChange('body_no', e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: File Uploads */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FileUploadBox
                    id="profile-pic"
                    label="2x2 Profile Picture"
                    accept="image/*"
                    file={profilePic}
                    preview={profilePreview}
                    onChange={(e) => handleFileChange(e, setProfilePic, setProfilePreview)}
                    icon={Camera}
                    desc="Click to upload or use camera"
                    onCameraClick={() => setShowCamera(true)}
                  />
                  <FileUploadBox
                    id="license-pic"
                    label="Driver's License of Authorized Driver"
                    accept="image/*"
                    file={licensePhoto}
                    preview={licensePreview}
                    onChange={(e) => handleFileChange(e, setLicensePhoto, setLicensePreview)}
                    icon={FileText}
                    desc="Click to upload License photo"
                  />
                  <FileUploadBox
                    id="or-cr"
                    label="OR/CR of Tricycle"
                    accept="image/*,.pdf"
                    file={orCrFile}
                    preview={orCrPreview}
                    onChange={(e) => handleFileChange(e, setOrCrFile, setOrCrPreview)}
                    icon={FileText}
                    desc="Click to upload OR/CR"
                  />
                  <FileUploadBox
                    id="tricycle-photo"
                    label="Tricycle Photo (with PERMIT NO. front)"
                    accept="image/*"
                    file={tricyclePhoto}
                    preview={tricyclePreview}
                    onChange={(e) => handleFileChange(e, setTricyclePhoto, setTricyclePreview)}
                    icon={ImageIcon}
                    desc="Click to upload tricycle photo"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border/20">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
              >
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleOpenSummary}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Review Registration
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Summary Modal */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Registration Details</DialogTitle>
            <DialogDescription>
              Please double check all information before submitting to the database.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-semibold text-foreground border-b border-border/50 pb-1 mb-2">Operator</p>
                <p><span className="text-muted-foreground">Name:</span> {form.operator_first_name} {form.operator_middle_name} {form.operator_last_name}</p>
                <p><span className="text-muted-foreground">Address:</span> {form.operator_address || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground border-b border-border/50 pb-1 mb-2">Driver</p>
                <p><span className="text-muted-foreground">Name:</span> {form.first_name} {form.middle_name} {form.last_name}</p>
                <p><span className="text-muted-foreground">License:</span> {form.license}</p>
                <p><span className="text-muted-foreground">TODA:</span> {form.toda_affiliation || 'N/A'}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="font-semibold text-foreground border-b border-border/50 pb-1 mb-2">Tricycle Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="text-muted-foreground">Plate No:</span> {form.plate_number}</p>
                  <p><span className="text-muted-foreground">Body No:</span> {form.body_no}</p>
                  <p><span className="text-muted-foreground">Make:</span> {form.make || 'N/A'}</p>
                  <p><span className="text-muted-foreground">Permit No:</span> {form.permit_no || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-foreground border-b border-border/50 pb-1 text-sm">Uploaded Documents</p>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {profilePreview && <img src={profilePreview} alt="Profile" className="h-20 w-20 object-cover rounded-md border" />}
                {licensePreview && <img src={licensePreview} alt="License" className="h-20 w-32 object-cover rounded-md border" />}
                {orCrPreview && <img src={orCrPreview} alt="ORCR" className="h-20 w-32 object-cover rounded-md border" />}
                {tricyclePreview && <img src={tricyclePreview} alt="Tricycle" className="h-20 w-32 object-cover rounded-md border" />}
                {!profilePreview && !licensePreview && !orCrPreview && !tricyclePreview && (
                  <p className="text-muted-foreground text-sm italic">No photos uploaded.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSummary(false)} disabled={loading}>
              Edit Details
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm & Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onCancel={() => setShowCamera(false)} 
        />
      )}
    </div>
  )
}
