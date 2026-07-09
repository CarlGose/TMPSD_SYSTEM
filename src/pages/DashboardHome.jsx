import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StatsCard from '@/components/StatsCard'
import { Users, UserCheck, Trophy, MapPin, UserPlus, Star, List, AlertTriangle, UserX, MessageSquare, TrendingUp, TrendingDown, BarChart3, Clock, ImageOff, ShieldCheck, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardHome() {
  const [stats, setStats] = useState({ 
    activeDrivers: 0, 
    activeRegistered: 0,
    expiredRegistrations: 0,
    lowPerforming: 0,
    feedbackThisWeek: 0,
    feedbackTrend: 0,
    totalRatingsAllTime: 0,
    totalTodas: 0,
    expiringSoon: 0,
    missingPhotos: 0,
    newlyAddedWeek: 0,
    systemAvgRating: 0
  })
  const [topDrivers, setTopDrivers] = useState([])
  const [top10Drivers, setTop10Drivers] = useState([])
  const [topTodas, setTopTodas] = useState([])
  const [mostActiveTodas, setMostActiveTodas] = useState([])
  const [lowPerformingDrivers, setLowPerformingDrivers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch driver stats from the view
      const { data: driversStats, error } = await supabase
        .from('driver_stats')
        .select('*')

      if (error) throw error

      // Fetch recent ratings for feedback volume
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentRatings } = await supabase
        .from('ratings')
        .select('created_at')
        .gte('created_at', fourteenDaysAgo.toISOString());

      let feedbackThisWeek = 0;
      let feedbackLastWeek = 0;

      recentRatings?.forEach(r => {
        const ratingDate = new Date(r.created_at);
        if (ratingDate >= sevenDaysAgo) {
          feedbackThisWeek++;
        } else {
          feedbackLastWeek++;
        }
      });

      let trend = 0;
      if (feedbackLastWeek > 0) {
        trend = ((feedbackThisWeek - feedbackLastWeek) / feedbackLastWeek) * 100;
      } else if (feedbackThisWeek > 0) {
        trend = 100;
      }

      const totalDrivers = driversStats?.length || 0;
      
      const currentDate = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      let activeRegistered = 0;
      let expiredRegistrations = 0;
      let lowPerforming = 0;
      
      let totalRatingsAllTime = 0;
      let expiringSoon = 0;
      let missingPhotos = 0;
      let newlyAddedWeek = 0;
      let sumOfAverages = 0;
      let driversWithRatings = 0;
      const uniqueTodas = new Set();

      driversStats?.forEach(d => {
        totalRatingsAllTime += Number(d.total_ratings || 0);

        if (d.total_ratings > 0) {
          sumOfAverages += Number(d.average_rating);
          driversWithRatings++;
        }

        if (d.toda_affiliation) {
          uniqueTodas.add(d.toda_affiliation);
        }

        if (d.total_ratings > 0 && Number(d.average_rating) < 3.0) {
          lowPerforming++;
        }

        if (d.valid_until) {
          const validUntil = new Date(d.valid_until);
          if (validUntil < currentDate) {
            expiredRegistrations++;
          } else {
            activeRegistered++;
            if (validUntil <= thirtyDaysFromNow) {
              expiringSoon++;
            }
          }
        }

        if (!d.profile_picture_url || !d.tricycle_photo_url) {
          missingPhotos++;
        }

        if (d.created_at) {
          const createdAt = new Date(d.created_at);
          if (createdAt >= sevenDaysAgo) {
            newlyAddedWeek++;
          }
        }
      });

      setStats({
        activeDrivers: totalDrivers,
        activeRegistered: activeRegistered,
        expiredRegistrations,
        lowPerforming,
        feedbackThisWeek,
        feedbackTrend: Math.round(trend),
        totalRatingsAllTime,
        totalTodas: uniqueTodas.size,
        expiringSoon,
        missingPhotos,
        newlyAddedWeek,
        systemAvgRating: driversWithRatings > 0 ? (sumOfAverages / driversWithRatings) : 0
      })

      // Calculate Top Drivers
      const sortedDrivers = [...(driversStats || [])]
        .filter(d => d.total_ratings > 0)
        .sort((a, b) => {
          if (b.average_rating !== a.average_rating) {
            return b.average_rating - a.average_rating;
          }
          return b.total_ratings - a.total_ratings;
        })
      
      setTopDrivers(sortedDrivers.slice(0, 5));
      setTop10Drivers(sortedDrivers.slice(0, 10));

      const lowPerfDrivers = [...(driversStats || [])]
        .filter(d => d.total_ratings > 0 && Number(d.average_rating) < 3.0)
        .sort((a, b) => Number(a.average_rating) - Number(b.average_rating));
      setLowPerformingDrivers(lowPerfDrivers);

      // Calculate Top TODA (by Rating) and Most Active TODA (by Volume)
      const todaStats = {};
      driversStats?.forEach(d => {
        if (d.toda_affiliation) {
          if (!todaStats[d.toda_affiliation]) {
            todaStats[d.toda_affiliation] = { count: 0, sumAvg: 0, totalVolume: 0 };
          }
          if (d.total_ratings > 0) {
            todaStats[d.toda_affiliation].sumAvg += Number(d.average_rating);
            todaStats[d.toda_affiliation].count += 1;
            todaStats[d.toda_affiliation].totalVolume += Number(d.total_ratings);
          }
        }
      });
      
      const sortedTodas = Object.entries(todaStats)
        .map(([toda, stats]) => ({
          toda,
          avgRating: stats.count > 0 ? stats.sumAvg / stats.count : 0
        }))
        .filter(t => t.avgRating > 0)
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 5);

      const sortedMostActive = Object.entries(todaStats)
        .map(([toda, stats]) => ({
          toda,
          volume: stats.totalVolume
        }))
        .filter(t => t.volume > 0)
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5);

      setTopTodas(sortedTodas);
      setMostActiveTodas(sortedMostActive);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
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

      {/* High-Level System Totals */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          High-Level System Totals
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-2 gap-4 stagger-children h-fit">
            <StatsCard 
              title="Total Ratings" 
              value={stats.totalRatingsAllTime} 
              subtitle="All-time feedback"
              icon={Star}
              delay={0}
            />
            <StatsCard 
              title="Average Rating" 
              value={stats.systemAvgRating > 0 ? stats.systemAvgRating.toFixed(1) : '—'} 
              subtitle="System-wide average"
              icon={Activity}
              delay={50}
            />
            <StatsCard 
              title="Active Registrations" 
              value={stats.activeRegistered} 
              subtitle="Currently valid"
              icon={ShieldCheck}
              delay={100}
            />
            <StatsCard 
              title="Total Drivers" 
              value={stats.activeDrivers} 
              subtitle="All registered drivers"
              icon={Users}
              delay={150}
            />
          </div>
          <div className="lg:col-span-1">
            <Card className="glass-card border-border/30 h-full">
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <MapPin className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg font-semibold">Top TODA by Ratings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topTodas.length === 0 ? (
                  <div className="text-center py-6">
                    <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No TODA ratings yet</p>
                  </div>
                ) : (
                  topTodas.map((toda, index) => (
                    <div key={toda.toda} className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-border/40">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{toda.toda}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                          {toda.avgRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Admin To-Do's */}
      <div>
        <h2 className="text-lg font-semibold mb-3 mt-6 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Admin To-Do's & Alerts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          <StatsCard 
            title="Total Registered Drivers" 
            value={stats.activeDrivers} 
            subtitle="All-time registrations"
            icon={Users}
            delay={100}
          />
          <StatsCard 
            title="Newly Added" 
            value={stats.newlyAddedWeek} 
            subtitle="In the last 7 days"
            icon={UserPlus}
            delay={150}
          />
          <StatsCard 
            title="Expiring Soon" 
            value={stats.expiringSoon} 
            subtitle="Next 30 days"
            icon={Clock}
            delay={200}
          />
          <StatsCard 
            title="Expired Registrations" 
            value={stats.expiredRegistrations} 
            subtitle="Needs renewal"
            icon={AlertTriangle}
            delay={250}
          />
          <StatsCard 
            title="Total TODAs" 
            value={stats.totalTodas} 
            subtitle="Registered groups"
            icon={MapPin}
            delay={300}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Volume */}
        <Card className="glass-card border-border/30 lg:col-span-1 flex flex-col justify-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback Volume (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.feedbackThisWeek}</div>
            <p className={`text-sm flex items-center gap-1 mt-2 font-medium ${stats.feedbackTrend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {stats.feedbackTrend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {stats.feedbackTrend > 0 ? '+' : ''}{stats.feedbackTrend}% from last week
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Comparing ratings submitted this week vs the previous 7 days.
            </p>
          </CardContent>
        </Card>

        {/* Most Active TODA */}
        <Card className="glass-card border-border/30 lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-lg font-semibold">Most Active TODA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mostActiveTodas.length === 0 ? (
              <div className="text-center py-6">
                <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No TODA activity yet</p>
              </div>
            ) : (
              mostActiveTodas.map((toda, index) => (
                <div key={toda.toda} className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{toda.toda}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-full">
                    <span className="font-bold text-secondary-foreground text-xs">
                      {toda.volume} ratings
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Drivers List */}
      <Card className="glass-card border-border/30">
        <CardHeader className="flex flex-row items-center gap-2">
          <List className="h-5 w-5 text-indigo-500" />
          <CardTitle className="text-lg font-semibold">Top 10 Drivers by Rating</CardTitle>
        </CardHeader>
        <CardContent>
          {top10Drivers.length === 0 ? (
            <div className="text-center py-12">
              <List className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No drivers with ratings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border/40">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-lg">Rank</th>
                    <th className="px-4 py-3 font-medium">Driver Name</th>
                    <th className="px-4 py-3 font-medium">Plate Number</th>
                    <th className="px-4 py-3 font-medium">TODA</th>
                    <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {top10Drivers.map((driver, index) => (
                    <tr key={driver.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-500' :
                          index === 1 ? 'bg-slate-300/20 text-slate-500 dark:text-slate-400' :
                          index === 2 ? 'bg-amber-600/20 text-amber-700 dark:text-amber-600' :
                          'bg-primary/10 text-primary'
                        }`}>
                          #{index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {driver.first_name} {driver.last_name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {driver.plate_number}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                          {driver.toda_affiliation || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {Number(driver.average_rating).toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({driver.total_ratings})
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Performing Drivers List */}
      <Card className="glass-card border-border/30 border-rose-500/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <TrendingDown className="h-5 w-5 text-rose-500" />
          <CardTitle className="text-lg font-semibold text-rose-500">Low Performing Drivers Alert</CardTitle>
        </CardHeader>
        <CardContent>
          {lowPerformingDrivers.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Great! No low performing drivers right now.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border/40">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-lg">Driver Name</th>
                    <th className="px-4 py-3 font-medium">Plate Number</th>
                    <th className="px-4 py-3 font-medium">TODA</th>
                    <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {lowPerformingDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-rose-500/5 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        {driver.first_name} {driver.last_name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {driver.plate_number}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                          {driver.toda_affiliation || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Star className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {Number(driver.average_rating).toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({driver.total_ratings})
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
