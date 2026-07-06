import { Card, CardContent } from '@/components/ui/card'
import StarRating from '@/components/StarRating'
import { User, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function ReviewCard({ review }) {
  return (
    <Card className="glass-card border-border/30 hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-full bg-primary/10 text-primary shrink-0">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <p className="font-semibold text-sm text-foreground">
                  {review.passenger_name || 'Anonymous Passenger'}
                </p>
                <StarRating rating={review.rating} size="sm" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(review.created_at), 'MMM d, yyyy h:mm a')}</span>
              </div>
            </div>
            {review.review && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.review}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
