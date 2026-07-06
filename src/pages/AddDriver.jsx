import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  UserPlus, 
  Loader2, 
  Upload, 
  Image as ImageIcon, 
  FileText,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react'

export default function AddDriver() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    plate_number: '',
    license: '',
    body_sticker: '',
    driver_type: '',
  })
  const [tricyclePhoto, setTricyclePhoto] = useState(null)
  const [tricyclePreview, setTricyclePreview] = useState(null)
  const [orCrFile, setOrCrFile] = useState(null)
  const [orCrPreview, setOrCrPreview] = useState(null)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setTricyclePhoto(file)
      const reader = new FileReader()
      reader.onload = (ev) => setTricyclePreview(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleOrCrChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setOrCrFile(file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => setOrCrPreview(ev.target.result)
        reader.readAsDataURL(file)
      } else {
        setOrCrPreview(null)
      }
    }
  }

  const uploadFile = async (file, bucket, folder) => {
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
    
    if (!form.driver_type) {
      toast.error('Please select a driver type')
      return
    }
    if (!tricyclePhoto) {
      toast.error('Please upload a tricycle photo')
      return
    }
    if (!orCrFile) {
      toast.error('Please upload the OR/CR document')
      return
    }

    setLoading(true)

    try {
      // Upload files
      const photoUrl = await uploadFile(tricyclePhoto, 'tricycle-photos', 'photos')
      const orCrUrl = await uploadFile(orCrFile, 'documents', 'or-cr')

      // Insert driver
      const { data, error } = await supabase
        .from('drivers')
        .insert({
          ...form,
          middle_name: form.middle_name || null,
          tricycle_photo_url: photoUrl,
          or_cr_url: orCrUrl,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Driver registered successfully!')
      navigate(`/dashboard/drivers/${data.id}`)
    } catch (error) {
      console.error('Error adding driver:', error)
      toast.error(error.message || 'Failed to register driver')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">Register New Driver</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in all required details to register a new tricycle driver
        </p>
      </div>

      <Card className="glass-card border-border/30 slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Driver Information
          </CardTitle>
          <CardDescription>All fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  placeholder="Juan"
                  value={form.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  required
                  className="bg-input/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  placeholder="Dela Cruz"
                  value={form.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  required
                  className="bg-input/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name (Optional)</Label>
              <Input
                id="middle_name"
                placeholder="Santos"
                value={form.middle_name}
                onChange={(e) => handleChange('middle_name', e.target.value)}
                className="bg-input/50 border-border/50"
              />
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plate_number">Plate Number *</Label>
                <Input
                  id="plate_number"
                  placeholder="ABC-1234"
                  value={form.plate_number}
                  onChange={(e) => handleChange('plate_number', e.target.value)}
                  required
                  className="bg-input/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License Number *</Label>
                <Input
                  id="license"
                  placeholder="N01-23-456789"
                  value={form.license}
                  onChange={(e) => handleChange('license', e.target.value)}
                  required
                  className="bg-input/50 border-border/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="body_sticker">Body Sticker *</Label>
                <Input
                  id="body_sticker"
                  placeholder="BS-001"
                  value={form.body_sticker}
                  onChange={(e) => handleChange('body_sticker', e.target.value)}
                  required
                  className="bg-input/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver_type">Driver Type *</Label>
                <Select value={form.driver_type} onValueChange={(v) => handleChange('driver_type', v)}>
                  <SelectTrigger id="driver_type" className="bg-input/50 border-border/50">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="authorized_driver">Authorized Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              {/* Tricycle Photo */}
              <div className="space-y-2">
                <Label>Tricycle Photo *</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="tricycle-photo"
                  />
                  <label
                    htmlFor="tricycle-photo"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 overflow-hidden"
                  >
                    {tricyclePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={tricyclePreview}
                          alt="Tricycle preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm font-medium">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload tricycle photo</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* OR/CR Document */}
              <div className="space-y-2">
                <Label>OR/CR Document *</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleOrCrChange}
                    className="hidden"
                    id="or-cr-file"
                  />
                  <label
                    htmlFor="or-cr-file"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 overflow-hidden"
                  >
                    {orCrPreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={orCrPreview}
                          alt="OR/CR preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm font-medium">Click to change</p>
                        </div>
                      </div>
                    ) : orCrFile ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
                        <p className="text-sm text-foreground font-medium">{orCrFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                      </div>
                    ) : (
                      <>
                        <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload OR/CR</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Image or PDF up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
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
                  Registering Driver...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register Driver
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
