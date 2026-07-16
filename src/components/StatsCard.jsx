import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function StatsCard({ title, value, subtitle, icon: Icon, className, delay = 0 }) {
  return (
    <Card 
      className={cn(
        'glass-card border-border/50 hover:border-primary/30 transition-all duration-300 glow-hover overflow-hidden group',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/70">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-white/55">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
