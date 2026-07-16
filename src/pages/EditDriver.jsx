import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import { TODA_LIST } from '@/lib/constants'
import TodaCombobox from '@/components/TodaCombobox'

export default function EditDriver() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  
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

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const { data, error } = await supabase.from('drivers').select('*').eq('id', id).single()
        if (error) throw error
        if (data) {
          setForm({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            middle_name: data.middle_name || '',      
            address: data.address || '',
            license: data.license || '',
            toda_affiliation: data.toda_affiliation || '',
            operator_first_name: data.operator_first_name || '',
            operator_last_name: data.operator_last_name || '',
            operator_middle_name: data.operator_middle_name || '',
            operator_address: data.operator_address || '',
            permit_no: data.permit_no || '',
            valid_until: data.valid_until || '',
            or_no: data.or_no || '',
            make: data.make || '',
            motor_no: data.motor_no || '',
            chassis_no: data.chassis_no || '',
            plate_number: data.plate_number || '',
            body_no: data.body_no || '',
            body_sticker: data.body_sticker || '',
          })
          if (data.profile_picture_url) setProfilePreview(data.profile_picture_url)
          if (data.license_photo_url) setLicensePreview(data.license_photo_url)
          if (data.or_cr_url) setOrCrPreview(data.or_cr_url)
          if (data.tricycle_photo_url) setTricyclePreview(data.tricycle_photo_url)
        }
      } catch (err) {
        toast.error('Failed to load driver details')
        navigate('/dashboard/drivers')
      } finally {
        setInitialLoading(false)
      }
    }
    fetchDriver()
  }, [id, navigate])

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
      // Upload files if they exist
      const profilePicUrl = profilePic ? await uploadFile(profilePic, 'tricycle-photos', 'profiles') : undefined
      const licensePhotoUrl = licensePhoto ? await uploadFile(licensePhoto, 'documents', 'licenses') : undefined
      const orCrUrl = orCrFile ? await uploadFile(orCrFile, 'documents', 'or-cr') : undefined
      const tricyclePhotoUrl = tricyclePhoto ? await uploadFile(tricyclePhoto, 'tricycle-photos', 'photos') : undefined

      const updateData = {
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
      }
      
      if (profilePicUrl) updateData.profile_picture_url = profilePicUrl
      if (licensePhotoUrl) updateData.license_photo_url = licensePhotoUrl
      if (orCrUrl) updateData.or_cr_url = orCrUrl
      if (tricyclePhotoUrl) updateData.tricycle_photo_url = tricyclePhotoUrl

      // Update driver
      const { data, error } = await supabase
        .from('drivers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      toast.success('Updated successfully!')
      navigate(`/dashboard/drivers/${data.id}`)
    } catch (error) {
      console.error('Error updating:', error)
      toast.error(error.message || 'Failed to update')
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

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Edit Driver & Operator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update the details below for the Operator and Authorized Driver
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
                  <TodaCombobox 
                    value={form.toda_affiliation}
                    onChange={(val) => handleChange('toda_affiliation', val)}
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
                  Updating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
