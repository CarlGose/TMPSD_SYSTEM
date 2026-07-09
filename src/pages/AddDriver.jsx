import { useState } from 'react'
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
  Camera
} from 'lucide-react'

export default function AddDriver() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  const [form, setForm] = useState({
    // Authorized Driver
    first_name: '',
    last_name: '',
    middle_name: '',      
    address: '',
    license: '',
    toda_affiliation: '',
    // Operator
    operator_first_name: '',
    operator_last_name: '',
    operator_middle_name: '',
    operator_address: '',
    // Vehicle
    permit_no: '',
    valid_until: '',
    or_no: '',
    make: '',
    motor_no: '',
    chassis_no: '',
    plate_number: '',
    body_no: '',
    body_sticker: '',
  })

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
    setForm((prev) => ({ ...prev, [field]: value }))
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

  const handleSubmit = async (e) => {
    e.preventDefault()
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
          body_sticker: form.body_no || 'N/A', // Using body_no for body_sticker if needed
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

  const FileUploadBox = ({ id, label, accept, preview, file, onChange, icon: Icon, desc }) => (
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
              <p className="text-sm text-foreground font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Click to change</p>
            </div>
          ) : (
            <>
              <Icon className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground text-center px-4">{desc}</p>
            </>
          )}
        </label>
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
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">Register Driver & Operator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the details below to register the Operator and Authorized Driver
        </p>
      </div>

      <Card className="glass-card border-border/30 slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Registration Information
          </CardTitle>
          <CardDescription>All fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Operator Details */}
            <div className="p-4 rounded-xl border border-border/30 bg-muted/5 space-y-6">
              <h3 className="font-semibold text-foreground border-b border-border/20 pb-2">
                Operator Details
              </h3>
              
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

            {/* Authorized Driver Details */}
            <div className="p-4 rounded-xl border border-border/30 bg-muted/5 space-y-6">
              <h3 className="font-semibold text-foreground border-b border-border/20 pb-2">
                Authorized Driver Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Driver First Name *</Label>
                  <Input
                    required
                    value={form.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    className="bg-input/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Driver Last Name *</Label>
                  <Input
                    required
                    value={form.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    className="bg-input/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Driver Middle Name</Label>
                  <Input
                    value={form.middle_name}
                    onChange={(e) => handleChange('middle_name', e.target.value)}
                    className="bg-input/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Driver Address</Label>
                <Input
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
                  <Input
                    value={form.toda_affiliation}
                    onChange={(e) => handleChange('toda_affiliation', e.target.value)}
                    className="bg-input/50 border-border/50"
                  />
                </div>
              </div>
            </div>

            {/* Tricycle Details */}
            <div className="p-4 rounded-xl border border-border/30 bg-muted/5 space-y-6">
              <h3 className="font-semibold text-foreground border-b border-border/20 pb-2">
                Tricycle Details
              </h3>
              
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

            {/* File Uploads */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Upload Documents</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FileUploadBox
                  id="profile-pic"
                  label="2x2 Profile Picture"
                  accept="image/*"
                  file={profilePic}
                  preview={profilePreview}
                  onChange={(e) => handleFileChange(e, setProfilePic, setProfilePreview)}
                  icon={Camera}
                  desc="Click to upload profile photo"
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

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 spinner" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Submit Registration
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
