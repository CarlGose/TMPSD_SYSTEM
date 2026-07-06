import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StatsCard from '@/components/StatsCard'
import ReviewCard from '@/components/ReviewCard'
import { Users, Star, MessageSquare, TrendingUp, UserPlus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardHome() {
  const [stats, setStats] = useState({ drivers: 0, avgRating: 0, totalReviews: 0, totalRatings: 0 })
  const [recentReviews, setRecentReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch driver count
      const { count: driverCount } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })

      // Fetch all ratings for stats
      const { data: ratings } = await supabase
        .from('ratings')
        .select('*')
        .order('created_at', { ascending: false })

      const totalRatings = ratings?.length || 0
      const avgRating = totalRatings > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
        : 0
      const reviewCount = ratings?.filter(r => r.review)?.length || 0

      setStats({
        drivers: driverCount || 0,
        avgRating: avgRating,
        totalReviews: reviewCount,
        totalRatings: totalRatings,
      })

      // Get recent reviews (with review text)
      setRecentReviews(ratings?.filter(r => r.review)?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="slide-up">
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your tricycle driver rating system
          </p>
        </div>
        <Link to="/dashboard/drivers/new">
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <UserPlus className="h-4 w-4" />
            Add Driver
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard 
          title="Total Drivers" 
          value={stats.drivers} 
          subtitle="Registered drivers"
          icon={Users}
          delay={0}
        />
        <StatsCard 
          title="Average Rating" 
          value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'} 
          subtitle="Across all drivers"
          icon={Star}
          delay={50}
        />
        <StatsCard 
          title="Total Ratings" 
          value={stats.totalRatings} 
          subtitle="Passenger ratings"
          icon={TrendingUp}
          delay={100}
        />
        <StatsCard 
          title="Reviews" 
          value={stats.totalReviews} 
          subtitle="Written reviews"
          icon={MessageSquare}
          delay={150}
        />
      </div>

      {/* Recent Reviews */}
      <Card className="glass-card border-border/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Reviews</CardTitle>
          <Link to="/dashboard/drivers">
            <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/80">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No reviews yet</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Reviews will appear here when passengers rate drivers</p>
            </div>
          ) : (
            recentReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
