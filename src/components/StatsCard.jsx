import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useEffect, useState, useRef } from 'react'

function useCountUp(end, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0)
  const countRef = useRef(null)

  useEffect(() => {
    const numEnd = typeof end === 'string' ? parseFloat(end) : end
    if (isNaN(numEnd) || numEnd === 0) {
      setCount(end)
      return
    }

    const timeout = setTimeout(() => {
      const startTime = performance.now()
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = Math.round(eased * numEnd)
        setCount(current)
        if (progress < 1) {
          countRef.current = requestAnimationFrame(animate)
        } else {
          setCount(end)
        }
      }
      countRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (countRef.current) cancelAnimationFrame(countRef.current)
    }
  }, [end, duration, delay])

  return count
}

export default function StatsCard({ title, value, subtitle, icon: Icon, className, delay = 0 }) {
  const animatedValue = useCountUp(value, 1200, delay + 400)

  return (
    <Card 
      className={cn(
        'glass-card border-border/50 hover:border-primary/30 transition-all duration-300 glow-hover overflow-hidden group dash-card-animate',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/70">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-white dash-value-pop" style={{ animationDelay: `${delay + 300}ms` }}>
              {animatedValue}
            </p>
            {subtitle && (
              <p className="text-xs text-white/55">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 dash-icon-spin" style={{ animationDelay: `${delay + 200}ms` }}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
