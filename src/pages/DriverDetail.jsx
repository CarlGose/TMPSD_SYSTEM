import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StarRating from '@/components/StarRating'
import ReviewCard from '@/components/ReviewCard'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Star,
  MessageSquare,
  Trash2,
  Loader2,
  Calendar,
  CreditCard,
  FileText,
  Shield,
  QrCode,
  ExternalLink,
  Image as ImageIcon,
  User
} from 'lucide-react'
import { format } from 'date-fns'

export default function DriverDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [driver, setDriver] = useState(null)
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [renewDialogOpen, setRenewDialogOpen] = useState(false)
  const [updatingPermit, setUpdatingPermit] = useState(false)
  const [newValidUntil, setNewValidUntil] = useState('')

  useEffect(() => {
    fetchDriver()
  }, [id])

  const fetchDriver = async () => {
    try {
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', id)
        .single()

      if (driverError) throw driverError
      setDriver(driverData)

      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('*')
        .eq('driver_id', id)
        .order('created_at', { ascending: false })

      if (ratingsError) throw ratingsError
      setRatings(ratingsData || [])
    } catch (error) {
      console.error('Error fetching driver:', error)
      toast.error('Driver not found')
      navigate('/dashboard/drivers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Driver deleted successfully')
      navigate('/dashboard/drivers')
    } catch (error) {
      console.error('Error deleting driver:', error)
      toast.error('Failed to delete driver')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleUpdatePermit = async () => {
    if (!newValidUntil) {
      toast.error('Please select a new valid until date')
      return
    }
    setUpdatingPermit(true)
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ valid_until: newValidUntil })
        .eq('id', id)

      if (error) throw error
      toast.success('Permit renewed successfully')
      setDriver({ ...driver, valid_until: newValidUntil })
      setRenewDialogOpen(false)
    } catch (error) {
      console.error('Error updating permit:', error)
      toast.error('Failed to update permit')
    } finally {
      setUpdatingPermit(false)
    }
  }

  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.rating === star).length,
    percentage: ratings.length > 0
      ? (ratings.filter((r) => r.rating === star).length / ratings.length) * 100
      : 0,
  }))

  const driverFullName = driver
    ? `${driver.first_name} ${driver.middle_name ? driver.middle_name + ' ' : ''}${driver.last_name}`
    : ''

  let needsRenewal = false
  if (driver?.valid_until) {
    const validUntilDate = new Date(driver.valid_until)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    needsRenewal = validUntilDate <= thirtyDaysFromNow
  }

  const ratingPageUrl = `${window.location.origin}/rate/${id}`

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!driver) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 slide-up">
        <div>
          <Button
            variant="ghost"
            className="gap-2 mb-3 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/dashboard/drivers')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Drivers
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">
            {driverFullName}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground">
              Registered {format(new Date(driver.created_at), 'MMM d, yyyy')}
            </span>
            {needsRenewal && (
              <Badge variant="destructive" className="animate-pulse">
                Permit Expired / Expiring Soon
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-primary border-primary/30 hover:bg-primary/10" onClick={() => navigate(`/dashboard/drivers/${id}/edit`)}>
            <FileText className="h-4 w-4" />
            Edit Driver
          </Button>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Driver</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {driverFullName}? This action cannot be undone.
                  All ratings and reviews for this driver will also be deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 spinner" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Driver'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Driver Info & Photo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Driver Details */}
          <Card className="glass-card border-border/30 slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Driver Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold text-foreground border-b border-border/20 pb-2 mb-4">Driver Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <InfoItem icon={FileText} label="Address" value={driver.address || 'N/A'} />
                <InfoItem icon={FileText} label="TODA Affiliation" value={driver.toda_affiliation || 'N/A'} />
                <InfoItem icon={Shield} label="License" value={driver.license} />
                <InfoItem icon={Calendar} label="Registered" value={format(new Date(driver.created_at), 'MMMM d, yyyy')} />
              </div>

              <h4 className="font-semibold text-foreground border-b border-border/20 pb-2 mb-4">Operator Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <InfoItem icon={User} label="Operator Name" value={[driver.operator_first_name, driver.operator_middle_name, driver.operator_last_name].filter(Boolean).join(' ') || 'N/A'} />
                <InfoItem icon={FileText} label="Operator Address" value={driver.operator_address || 'N/A'} />
              </div>

              <h4 className="font-semibold text-foreground border-b border-border/20 pb-2 mb-4">Tricycle Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoItem icon={FileText} label="Permit No." value={driver.permit_no || 'N/A'} />
                <InfoItem icon={Calendar} label="Valid Until" value={driver.valid_until || 'N/A'} />
                <InfoItem icon={FileText} label="OR No." value={driver.or_no || 'N/A'} />
                <InfoItem icon={FileText} label="Make" value={driver.make || 'N/A'} />
                <InfoItem icon={FileText} label="Motor No." value={driver.motor_no || 'N/A'} />
                <InfoItem icon={FileText} label="Chassis No." value={driver.chassis_no || 'N/A'} />
                <InfoItem icon={FileText} label="Body No." value={driver.body_no || 'N/A'} />
                <InfoItem icon={CreditCard} label="Plate Number" value={driver.plate_number} />
                <InfoItem icon={FileText} label="Body Sticker" value={driver.body_sticker} />
              </div>

              <div className="mt-8 space-y-6">
                <h4 className="font-semibold text-foreground border-b border-border/20 pb-2">Documents & Photos</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {driver.profile_picture_url && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Profile Picture
                      </p>
                      <div className="rounded-xl overflow-hidden border border-border/30 h-48 bg-muted/10 flex items-center justify-center p-2">
                        <img src={driver.profile_picture_url} alt="Profile" className="w-full h-full object-contain rounded-lg" />
                      </div>
                    </div>
                  )}

                  {driver.license_photo_url && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Driver's License
                      </p>
                      <div className="rounded-xl overflow-hidden border border-border/30 h-48 bg-muted/10 flex items-center justify-center p-2">
                        <img src={driver.license_photo_url} alt="License" className="w-full h-full object-contain rounded-lg" />
                      </div>
                    </div>
                  )}

                  {driver.tricycle_photo_url && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Tricycle Photo
                      </p>
                      <div className="rounded-xl overflow-hidden border border-border/30 h-48 bg-muted/10 flex items-center justify-center p-2">
                        <img src={driver.tricycle_photo_url} alt="Tricycle" className="w-full h-full object-contain rounded-lg" />
                      </div>
                    </div>
                  )}

                  {driver.or_cr_url && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        OR/CR Document
                      </p>
                      <div className="rounded-xl overflow-hidden border border-border/30 h-48 bg-muted/10 flex items-center justify-center p-2">
                        {driver.or_cr_url.endsWith('.pdf') ? (
                          <a href={driver.or_cr_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View PDF Document</a>
                        ) : (
                          <img src={driver.or_cr_url} alt="OR/CR" className="w-full h-full object-contain rounded-lg" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Summary */}
          <Card className="glass-card border-border/30 slide-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-primary fill-primary" />
                Rating Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Average */}
                <div className="text-center sm:text-left">
                  <p className="text-5xl font-bold gradient-text">
                    {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                  </p>
                  <StarRating rating={Math.round(avgRating)} size="md" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Distribution */}
                <div className="flex-1 space-y-2">
                  {ratingDistribution.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-3">{star}</span>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="glass-card border-border/30 slide-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Reviews ({ratings.filter(r => r.review).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ratings.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No ratings yet</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">
                    Share the QR code to start collecting ratings
                  </p>
                </div>
              ) : (
                ratings.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - QR Code */}
        <div className="space-y-6">
          <Card className="glass-card border-border/30 slide-up sticky top-4" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Driver QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <QRCodeDisplay
                value={ratingPageUrl}
                driverName={driverFullName}
                size={180}
              />
              <Separator className="my-4 bg-border/30" />
              <div className="w-full">
                <p className="text-xs text-muted-foreground mb-2">Rating Page URL:</p>
                <div className="flex items-center gap-2">
                  <code className="text-[10px] text-primary bg-primary/10 px-2 py-1 rounded flex-1 break-all">
                    {ratingPageUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(ratingPageUrl)
                      toast.success('URL copied to clipboard')
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
