import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import StarRating from '@/components/StarRating'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  UserPlus, 
  Eye, 
  Users, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  IdCard,
  MapPin
} from 'lucide-react'

const getDriverStatus = (driver) => {
  if (!driver.valid_until) {
    return { label: 'Incomplete', Icon: Clock, colorClass: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30' }
  }
  
  const validUntil = new Date(driver.valid_until)
  const now = new Date()
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  if (validUntil < now) {
    return { label: 'Expired', Icon: XCircle, colorClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]' }
  }
  if (validUntil <= thirtyDays) {
    return { label: 'Expiring', Icon: AlertCircle, colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' }
  }
  return { label: 'Active', Icon: CheckCircle2, colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' }
}

export default function DriverList() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedTodas, setExpandedTodas] = useState({})

  const toggleToda = (toda) => {
    setExpandedTodas(prev => ({
      ...prev,
      [toda]: !prev[toda]
    }))
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const { data: driversData, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const driversWithRatings = await Promise.all(
        (driversData || []).map(async (driver) => {
          const { data: ratings } = await supabase
            .from('ratings')
            .select('rating')
            .eq('driver_id', driver.id)

          const totalRatings = ratings?.length || 0
          const avgRating = totalRatings > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
            : 0

          return { ...driver, avgRating, totalRatings }
        })
      )

      setDrivers(driversWithRatings)
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      `${driver.first_name} ${driver.last_name} ${driver.plate_number}`
        .toLowerCase()
        .includes(search.toLowerCase())
    
    if (!matchesSearch) return false

    if (statusFilter === 'all') return true

    const currentDate = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    if (!driver.valid_until) {
       return statusFilter === 'active' 
    }

    const validUntil = new Date(driver.valid_until)

    if (statusFilter === 'expired') {
      return validUntil < currentDate
    }

    if (statusFilter === 'expiring_soon') {
      return validUntil >= currentDate && validUntil <= thirtyDaysFromNow
    }

    if (statusFilter === 'active') {
      return validUntil >= currentDate
    }

    return true
  })

  const groupedDrivers = filteredDrivers.reduce((acc, driver) => {
    const toda = driver.toda_affiliation || 'Unassigned / No TODA'
    if (!acc[toda]) {
      acc[toda] = []
    }
    acc[toda].push(driver)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 rounded-3xl" />
        <div className="flex gap-3">
          <Skeleton className="h-14 flex-1 rounded-2xl" />
          <Skeleton className="h-14 w-40 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Header - Using glass-card from your index.css */}
      <div className="glass-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 slide-up p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">
            Drivers Directory
          </h1>
          <p className="text-foreground/80 font-medium mt-2 flex items-center gap-2 text-sm sm:text-base">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">{drivers.length}</span> registered driver{drivers.length !== 1 ? 's' : ''} active in the system
          </p>
        </div>
        
        <Link to="/dashboard/drivers/new" className="relative z-10 w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_rgba(255,191,0,0.4)] rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,191,0,0.6)]">
            <UserPlus className="h-5 w-5" />
            Register New Driver
          </Button>
        </Link>
      </div>

      {/* Modern Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 slide-up" style={{ animationDelay: '100ms' }}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by driver name or plate number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 rounded-2xl bg-background/50 border-border/50 text-base shadow-sm focus-visible:ring-primary/50 transition-all placeholder:text-muted-foreground/60 backdrop-blur-md"
          />
        </div>
        <div className="w-full sm:w-[260px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-14 rounded-2xl bg-background/50 border-border/50 font-medium shadow-sm transition-all focus:ring-primary/50 backdrop-blur-md">
              <Filter className="w-5 h-5 mr-2 text-primary" />
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl font-medium shadow-xl">
              <SelectItem value="all">All Registrations</SelectItem>
              <SelectItem value="active">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 glow"></div> Active</span>
              </SelectItem>
              <SelectItem value="expiring_soon">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 glow"></div> Expiring Soon</span>
              </SelectItem>
              <SelectItem value="expired">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500 glow"></div> Expired</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Driver List with TODA Grouping */}
      <div className="slide-up" style={{ animationDelay: '200ms' }}>
        {filteredDrivers.length === 0 ? (
          <Card className="glass-card rounded-3xl overflow-hidden relative">
            <CardContent className="py-24 text-center relative z-10">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,191,0,0.2)]">
                <IdCard className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold gradient-text mb-2">
                {search ? 'No Matches Found' : 'No Drivers Yet'}
              </h3>
              <p className="text-foreground/70 font-medium max-w-md mx-auto">
                {search
                  ? 'We couldn\'t find any drivers matching your search or filter criteria.'
                  : 'Your registry is empty. Add your first tricycle driver and operator to get started.'}
              </p>
              {!search && (
                <Link to="/dashboard/drivers/new" className="inline-block mt-8">
                  <Button size="lg" className="gap-2 rounded-xl shadow-[0_0_20px_rgba(255,191,0,0.3)] bg-primary text-primary-foreground hover:bg-primary/90">
                    <UserPlus className="h-5 w-5" />
                    Add First Driver
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedDrivers)
              .sort(([a], [b]) => {
                if (a === 'Unassigned / No TODA') return 1;
                if (b === 'Unassigned / No TODA') return -1;
                return a.localeCompare(b);
              })
              .map(([toda, todaDrivers]) => {
                const isExpanded = expandedTodas[toda] || search.trim() !== '';
                return (
              <div key={toda} className="space-y-4">
                {/* Premium TODA Header (Clickable for Accordion) */}
                <div 
                  onClick={() => toggleToda(toda)}
                  className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-card/80 to-transparent backdrop-blur-md rounded-2xl border-l-4 border-l-primary border-t border-t-border/20 border-b border-b-border/20 shadow-sm cursor-pointer hover:bg-background/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-extrabold text-foreground tracking-tight">{toda}</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(255,191,0,0.3)]">
                      {todaDrivers.length} {todaDrivers.length === 1 ? 'Driver' : 'Drivers'}
                    </Badge>
                    <div className="text-primary/70 transition-transform duration-300">
                      <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-primary' : ''}`} />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 fade-in duration-300 pl-2 sm:pl-6 border-l-2 border-border/10 ml-3">
                  {todaDrivers.map((driver) => (
                    <Link key={driver.id} to={`/dashboard/drivers/${driver.id}`} className="block">
                      <Card className="glass-card glow-hover rounded-2xl cursor-pointer group transition-all duration-500 ease-in-out">
                        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                          <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0 w-full">
                            
                            {/* Premium 2x2 ID Photo */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-background/50 shrink-0 border-2 border-primary/20 shadow-inner group-hover:border-primary/80 group-hover:shadow-[0_0_15px_rgba(255,191,0,0.4)] transition-all duration-500 ease-in-out flex items-center justify-center relative">
                              {driver.profile_picture_url ? (
                                <img
                                  src={driver.profile_picture_url}
                                  alt={`${driver.first_name} ${driver.last_name}`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary font-bold text-3xl tracking-tighter">
                                  {driver.first_name[0]}{driver.last_name[0]}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="flex items-center flex-wrap gap-2 mb-1">
                                <h3 className="text-lg sm:text-xl font-extrabold text-foreground group-hover:text-primary transition-colors duration-500 ease-in-out truncate max-w-[200px] sm:max-w-xs drop-shadow-sm">
                                  {driver.first_name} {driver.middle_name ? `${driver.middle_name[0]}. ` : ''}{driver.last_name}
                                </h3>
                                {(() => {
                                  const status = getDriverStatus(driver)
                                  const StatusIcon = status.Icon
                                  return (
                                    <Badge variant="outline" className={`gap-1.5 px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase rounded-md ${status.colorClass}`}>
                                      <StatusIcon className="w-3.5 h-3.5" />
                                      {status.label}
                                    </Badge>
                                  )
                                })()}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 text-sm text-foreground mt-0.5 font-semibold">
                                <span className="flex items-center gap-1.5 bg-background/40 px-2 py-1 rounded-md border border-border/30 backdrop-blur-sm shadow-inner text-xs sm:text-sm">
                                  Plate: <span className="text-primary font-bold">{driver.plate_number || 'N/A'}</span>
                                </span>
                                {driver.permit_no && (
                                  <span className="flex items-center gap-1.5 bg-background/40 px-2 py-1 rounded-md border border-border/30 backdrop-blur-sm shadow-inner text-xs sm:text-sm">
                                    Permit No: <span className="text-primary font-bold">{driver.permit_no}</span>
                                  </span>
                                )}
                              </div>
                              
                              {driver.valid_until && (
                                <p className="text-xs mt-2 text-foreground/70 flex items-center gap-1.5 font-medium">
                                  <Clock className="w-4 h-4 text-primary/70" />
                                  Valid until: <span className="text-foreground/90 font-bold">{new Date(driver.valid_until).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Rating & Action Arrow */}
                          <div className="w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/10 flex sm:flex-row items-center justify-between sm:justify-end gap-4">
                            <div className="flex flex-col items-start sm:items-end gap-0.5 px-3 py-2 rounded-lg bg-background/40 border border-border/20 group-hover:bg-background/60 group-hover:border-primary/40 transition-all duration-500 ease-in-out shadow-inner backdrop-blur-sm">
                              <div className="flex items-center gap-1.5">
                                <StarRating rating={Math.round(driver.avgRating)} size="sm" />
                                <span className="text-base font-extrabold text-foreground">
                                  {driver.avgRating > 0 ? driver.avgRating.toFixed(1) : 'N/A'}
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-widest mt-0.5">
                                {driver.totalRatings} Review{driver.totalRatings !== 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            <div className="w-10 h-10 rounded-full bg-background/50 border border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_15px_rgba(255,191,0,0.5)] transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] transform group-hover:scale-110 group-hover:translate-x-1 shrink-0 hidden sm:flex">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                )}
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}
