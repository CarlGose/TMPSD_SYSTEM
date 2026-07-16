import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StarRating from '@/components/StarRating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import ReviewCard from '@/components/ReviewCard'
import {
  Star,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
} from 'lucide-react'

export default function RateDriver() {
  const { id } = useParams()
  const [driver, setDriver] = useState(null)
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [passengerName, setPassengerName] = useState('')

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

      if (driverError || !driverData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setDriver(driverData)

      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('*')
        .eq('driver_id', id)
        .order('created_at', { ascending: false })
        .limit(10)

      setRatings(ratingsData || [])
    } catch (error) {
      console.error('Error:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from('ratings').insert({
        driver_id: id,
        rating,
        review: review.trim() || null,
        passenger_name: passengerName.trim() || null,
      })

      if (error) throw error
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0

  const driverFullName = driver
    ? `${driver.first_name} ${driver.middle_name ? driver.middle_name + ' ' : ''}${driver.last_name}`
    : ''

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  // Not found
  if (notFound) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="text-center slide-up">
          <div className="inline-flex p-4 rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Driver Not Found</h1>
          <p className="text-muted-foreground text-sm">
            The driver you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="text-center slide-up max-w-sm">
          <div className="mb-6 success-circle inline-flex">
            <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="oklch(0.65 0.2 150)"
                strokeWidth="3"
                opacity="0.2"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="oklch(0.65 0.2 150 / 10%)"
                stroke="oklch(0.65 0.2 150)"
                strokeWidth="3"
              />
              <polyline
                points="26,42 36,52 54,30"
                fill="none"
                stroke="oklch(0.65 0.2 150)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="success-check"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Thank You!</h1>
          <p className="text-muted-foreground text-sm mb-2">
            Your rating for <strong className="text-foreground">{driverFullName}</strong> has been submitted.
          </p>
          <div className="flex justify-center mt-4">
            <StarRating rating={rating} size="lg" />
          </div>
          <p className="text-muted-foreground/60 text-xs mt-6">
            Your feedback helps improve our tricycle service.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-chart-2/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Driver Profile Card */}
        <Card className="glass-card border-border/30 overflow-hidden slide-up">
          {/* Photo Banner */}
          {driver.tricycle_photo_url && (
            <div className="h-44 overflow-hidden">
              <img
                src={driver.tricycle_photo_url}
                alt="Tricycle"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardContent className={`text-center ${driver.tricycle_photo_url ? 'pt-6' : 'pt-8'} pb-6 px-6`}>
            {/* Driver Avatar */}
            <div className={`${driver.tricycle_photo_url ? '-mt-14' : ''} mb-4`}>
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 border-4 border-background flex items-center justify-center text-primary font-bold text-2xl shadow-lg">
                {driver.first_name[0]}{driver.last_name[0]}
              </div>
            </div>

            <h1 className="text-xl font-bold text-foreground">{driverFullName}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {driver.driver_type === 'operator' ? 'Operator' : 'Authorized Driver'} • {driver.plate_number}
            </p>

            <Separator className="my-4 bg-border/30" />

            {/* Rating Display */}
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">
                  {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                </p>
                <StarRating rating={Math.round(avgRating)} size="md" />
                <p className="text-xs text-muted-foreground mt-1">
                  {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Form */}
        <Card className="glass-card border-border/30 slide-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Rate this Driver</h2>
            <p className="text-sm text-muted-foreground mb-5">
              How was your experience?
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star Rating */}
              <div className="flex flex-col items-center gap-2 py-4">
                <StarRating
                  rating={rating}
                  size="xl"
                  interactive
                  onRatingChange={setRating}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {rating === 0 && 'Tap a star to rate'}
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              </div>

              {/* Passenger Name */}
              <div className="space-y-2">
                <Label htmlFor="passengerName" className="text-sm">
                  Your Name (Optional)
                </Label>
                <Input
                  id="passengerName"
                  placeholder="Enter your name"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="bg-input/50 border-border/50"
                />
              </div>

              {/* Review */}
              <div className="space-y-2">
                <Label htmlFor="review" className="text-sm">
                  Review (Optional)
                </Label>
                <Textarea
                  id="review"
                  placeholder="Share your experience..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={3}
                  className="bg-input/50 border-border/50 resize-none"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={rating === 0 || submitting}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all duration-300"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 spinner" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Rating
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        {ratings.filter(r => r.review).length > 0 && (
          <Card className="glass-card border-border/30 slide-up" style={{ animationDelay: '250ms' }}>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Recent Reviews
              </h2>
              <div className="space-y-3">
                {ratings
                  .filter((r) => r.review)
                  .slice(0, 5)
                  .map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/50 pb-4">
          Powered by TricycleRate
        </p>
      </div>
    </div>
  )
}
