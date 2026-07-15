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
import { Search, UserPlus, Eye, Users, Filter } from 'lucide-react'

export default function DriverList() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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

      // Fetch ratings for each driver
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
    return matchesSearch
  })

  // Group drivers by TODA
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
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 slide-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Drivers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {drivers.length} registered driver{drivers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/dashboard/drivers/new">
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <UserPlus className="h-4 w-4" />
            Add Driver
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 slide-up" style={{ animationDelay: '100ms' }}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-input/50 border-border/50"
          />
        </div>
      </div>

      {/* Driver Grid */}
      <div className="slide-up" style={{ animationDelay: '200ms' }}>
        {filteredDrivers.length === 0 ? (
          <Card className="glass-card border-border/30">
          <CardContent className="py-16 text-center">
            <Users className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              {search ? 'No drivers match your search' : 'No drivers registered yet'}
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              {search
                ? 'Try adjusting your search'
                : 'Add your first driver to get started'}
            </p>
            {!search && (
              <Link to="/dashboard/drivers/new" className="inline-block mt-4">
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add First Driver
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDrivers)
            .sort(([a], [b]) => {
              if (a === 'Unassigned / No TODA') return 1;
              if (b === 'Unassigned / No TODA') return -1;
              return a.localeCompare(b);
            })
            .map(([toda, todaDrivers]) => (
            <div key={toda} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-sm py-1 px-3">
                  {toda}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  {todaDrivers.length} driver{todaDrivers.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-col gap-3 stagger-children">
                {todaDrivers.map((driver) => (
                  <Link key={driver.id} to={`/dashboard/drivers/${driver.id}`}>
                    <Card className="glass-card border-border/30 hover:border-primary/30 transition-all duration-300 glow-hover cursor-pointer group">
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                          {/* Avatar / Photo */}
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-primary/10 shrink-0">
                            {driver.tricycle_photo_url ? (
                              <img
                                src={driver.tricycle_photo_url}
                                alt="Tricycle"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                                {driver.first_name[0]}{driver.last_name[0]}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {driver.first_name} {driver.middle_name ? `${driver.middle_name[0]}. ` : ''}{driver.last_name}
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Plate: {driver.plate_number}
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/20 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <div className="flex items-center gap-2">
                            <StarRating rating={Math.round(driver.avgRating)} size="sm" />
                            <span className="text-sm font-medium">
                              {driver.avgRating > 0 ? driver.avgRating.toFixed(1) : 'N/A'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground sm:mt-1">
                            {driver.totalRatings} rating{driver.totalRatings !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
