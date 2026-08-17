import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StatsCard from '@/components/StatsCard'
import { Users, UserCheck, Trophy, MapPin, UserPlus, Star, List, AlertTriangle, UserX, MessageSquare, TrendingUp, TrendingDown, BarChart3, Clock, ImageOff, ShieldCheck, Activity, CheckCircle2, XCircle, FileCheck, ShieldAlert } from 'lucide-react'
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
    validLicenses: 0,
    invalidLicenses: 0,
    expiringLicenses: 0
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
      // Fetch drivers and their ratings directly to avoid view dependency issues
      const { data: rawDrivers, error } = await supabase
        .from('drivers')
        .select(`
          *,
          ratings ( rating )
        `)

      if (error) throw error

      // Calculate stats locally
      const driversStats = rawDrivers?.map(d => {
        const total_ratings = d.ratings ? d.ratings.length : 0;
        let average_rating = 0;
        if (total_ratings > 0) {
          const sum = d.ratings.reduce((acc, curr) => acc + curr.rating, 0);
          average_rating = sum / total_ratings;
        }
        return {
          ...d,
          total_ratings,
          average_rating
        }
      }) || [];

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
      let validLicenses = 0;
      let invalidLicenses = 0;
      let expiringLicenses = 0;
      const uniqueTodas = new Set();

      driversStats?.forEach(d => {
        totalRatingsAllTime += Number(d.total_ratings || 0);

        if (d.toda_affiliation) {
          uniqueTodas.add(d.toda_affiliation);
        }

        if (d.total_ratings > 0 && Number(d.average_rating) < 3.0) {
          lowPerforming++;
        }

        // License Validity Analytics
        if (d.license_validity) {
          const licDate = new Date(d.license_validity);
          if (licDate < currentDate) {
            invalidLicenses++;
          } else {
            validLicenses++;
            if (licDate <= thirtyDaysFromNow) {
              expiringLicenses++;
            }
          }
        } else {
          invalidLicenses++;
        }

        // Permit Validity Analytics
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
        validLicenses,
        invalidLicenses,
        expiringLicenses
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 dash-section-header">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your tricycle driver rating system
          </p>
        </div>
        <Link to="/dashboard/drivers/new">
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 dash-card-animate" style={{ animationDelay: '200ms' }}>
            <UserPlus className="h-4 w-4" />
            Add Driver
          </Button>
        </Link>
      </div>

      {/* System Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 dash-section-header" style={{ animationDelay: '100ms' }}>
          <Activity className="h-5 w-5 text-primary" />
          System Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Registered Drivers" 
            value={stats.activeDrivers} 
            subtitle="All registered drivers"
            icon={Users}
            delay={0}
          />
          <StatsCard 
            title="Valid Driver Licenses" 
            value={stats.validLicenses} 
            subtitle="Active & compliant"
            icon={CheckCircle2}
            delay={50}
          />
          <StatsCard 
            title="Not Valid Licenses" 
            value={stats.invalidLicenses} 
            subtitle="Expired or unverified"
            icon={XCircle}
            delay={100}
          />
          <StatsCard 
            title="Active Permits" 
            value={stats.activeRegistered} 
            subtitle="Valid tricycle permits"
            icon={ShieldCheck}
            delay={150}
          />
        </div>
      </div>

      {/* System Alerts */}
      <div>
        <h2 className="text-lg font-semibold mb-3 mt-6 flex items-center gap-2 dash-section-header" style={{ animationDelay: '300ms' }}>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          System Alerts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Ratings" 
            value={stats.totalRatingsAllTime} 
            subtitle="All-time feedback"
            icon={Star}
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
        </div>
      </div>



      {/* Top 10 Drivers List */}
      <Card className="glass-card border-border/30 dash-card-animate" style={{ animationDelay: '500ms' }}>
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
            <div className="flex flex-col gap-3 mt-4">
              {top10Drivers.map((driver, index) => (
                <div 
                  key={driver.id} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-background/40 border border-border/30 hover:bg-background/60 hover:border-primary/30 transition-all duration-300 group dash-row-animate shadow-sm hover:shadow-md" 
                  style={{ animationDelay: `${(index * 60) + 600}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-inner ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-[0_0_15px_rgba(234,179,8,0.4)]' :
                      index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-[0_0_15px_rgba(148,163,184,0.4)]' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]' :
                      'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground text-base group-hover:text-primary transition-colors">
                        {driver.first_name} {driver.last_name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs font-medium text-foreground/70">
                        <span className="flex items-center gap-1">
                          Plate: <span className="text-foreground/90 font-bold">{driver.plate_number || 'N/A'}</span>
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                          {driver.toda_affiliation || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 px-3 py-1.5 rounded-xl bg-background/50 border border-border/20 shadow-inner">
                    <div className="flex items-center justify-end gap-1.5">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-lg font-bold text-amber-500">
                        {Number(driver.average_rating).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                      {driver.total_ratings} Review{driver.total_ratings !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Performing Drivers List */}
      <Card className="glass-card border-border/30 border-rose-500/20 dash-card-animate" style={{ animationDelay: '700ms' }}>
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
            <div className="flex flex-col gap-3 mt-4">
              {lowPerformingDrivers.map((driver, index) => (
                <div 
                  key={driver.id} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all duration-300 group dash-row-animate shadow-sm"
                  style={{ animationDelay: `${(index * 60) + 800}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/30">
                      <TrendingDown className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground text-base group-hover:text-rose-500 transition-colors">
                        {driver.first_name} {driver.last_name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs font-medium text-foreground/70">
                        <span className="flex items-center gap-1">
                          Plate: <span className="text-foreground/90 font-bold">{driver.plate_number || 'N/A'}</span>
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider">
                          {driver.toda_affiliation || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 px-3 py-1.5 rounded-xl bg-background/50 border border-border/20 shadow-inner">
                    <div className="flex items-center justify-end gap-1.5">
                      <Star className="h-4 w-4 text-rose-500 fill-rose-500 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-lg font-bold text-rose-500">
                        {Number(driver.average_rating).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                      {driver.total_ratings} Review{driver.total_ratings !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
