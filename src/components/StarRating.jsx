import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function StarRating({ 
  rating = 0, 
  maxStars = 5, 
  size = 'md', 
  interactive = false, 
  onRatingChange,
  showValue = false 
}) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
    xl: 'h-9 w-9',
  }

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: maxStars }, (_, i) => {
          const value = i + 1
          const isFilled = value <= displayRating
          const isPartial = !isFilled && value - 0.5 <= displayRating

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(value)}
              onMouseEnter={() => interactive && setHoverRating(value)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={cn(
                'transition-all duration-150 disabled:cursor-default',
                interactive && 'star-interactive'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors duration-150',
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isPartial
                    ? 'fill-amber-400/50 text-amber-400'
                    : interactive && hoverRating >= value
                    ? 'fill-amber-300 text-amber-300'
                    : 'fill-transparent text-muted-foreground/40'
                )}
              />
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground ml-1">
          {rating > 0 ? rating.toFixed(1) : 'N/A'}
        </span>
      )}
    </div>
  )
}
