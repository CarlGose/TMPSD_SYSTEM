import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  ShieldAlert, 
  ShieldX,
  FileX,
  IdCard,
  UserX,
  Ban, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Eye, 
  Search,
  FileCheck,
  RotateCcw,
  Sparkles,
  X,
  Lock,
  Unlock
} from 'lucide-react'

// LocalStorage Helper for Manual Administrative Holds
export function getManualSuspensions() {
  try {
    const raw = localStorage.getItem('manual_suspended_driver_ids')
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export function toggleManualSuspensionInStorage(driverId, nextState) {
  try {
    const current = getManualSuspensions()
    let updated
    if (nextState) {
      updated = Array.from(new Set([...current, driverId]))
    } else {
      updated = current.filter(id => id !== driverId)
    }
    localStorage.setItem('manual_suspended_driver_ids', JSON.stringify(updated))
    return updated
  } catch (e) {
    console.error('Error updating manual suspension storage:', e)
    return []
  }
}

export function checkDriverSuspension(driver, graceDays = 0, manualIds = getManualSuspensions()) {
  if (!driver) return { isSuspended: false, reasons: [], details: {} }

  const reasons = []
  const isManual = Boolean(driver.is_suspended || manualIds.includes(driver.id))

  const details = {
    isManual,
    isPermitExpired: false,
    isLicenseExpired: false,
    permitDate: null,
    licenseDate: null
  }

  if (isManual) {
    reasons.push({ type: 'manual', label: 'Manual Administrative Hold' })
  }

  const now = new Date()
  const cutoff = new Date(now.getTime() - graceDays * 24 * 60 * 60 * 1000)

  if (driver.valid_until) {
    const permitDate = new Date(driver.valid_until)
    details.permitDate = permitDate
    if (permitDate < cutoff) {
      reasons.push({ type: 'permit', label: `Permit Expired (${permitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})` })
      details.isPermitExpired = true
    }
  } else {
    reasons.push({ type: 'permit', label: 'Missing Permit Expiration' })
    details.isPermitExpired = true
  }

  if (driver.license_validity) {
    const licDate = new Date(driver.license_validity)
    details.licenseDate = licDate
    if (licDate < cutoff) {
      reasons.push({ type: 'license', label: `License Expired (${licDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})` })
      details.isLicenseExpired = true
    }
  } else {
    reasons.push({ type: 'license', label: 'Missing License Validity' })
    details.isLicenseExpired = true
  }

  return {
    isSuspended: reasons.length > 0,
    reasons,
    details
  }
}

export default function SuspendedDrivers() {
  const [drivers, setDrivers] = useState([])
  const [manualSuspendedIds, setManualSuspendedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [renewDialogOpen, setRenewDialogOpen] = useState(false)
  const [renewType, setRenewType] = useState('permit') // 'permit' | 'license'
  const [newDate, setNewDate] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    setManualSuspendedIds(getManualSuspensions())
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('first_name', { ascending: true })

      if (error) throw error
      setDrivers(data || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
      toast.error('Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }

  const graceDaysNum = 0

  // Filter suspended drivers based on manual hold status, expired dates, and search query
  const suspendedDrivers = drivers.map(d => ({
    ...d,
    suspensionInfo: checkDriverSuspension(d, graceDaysNum, manualSuspendedIds)
  })).filter(d => {
    if (!d.suspensionInfo.isSuspended) return false
    const matchSearch = `${d.first_name} ${d.last_name} ${d.plate_number} ${d.toda_affiliation}`
      .toLowerCase()
      .includes(search.toLowerCase())
    return matchSearch
  })

  const totalSuspended = suspendedDrivers.length
  const expiredPermits = suspendedDrivers.filter(d => d.suspensionInfo.details.isPermitExpired).length
  const expiredLicenses = suspendedDrivers.filter(d => d.suspensionInfo.details.isLicenseExpired).length

  const handleOpenRenew = (driver, type) => {
    setSelectedDriver(driver)
    setRenewType(type)
    // Default to 1 year from now
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    setNewDate(nextYear.toISOString().split('T')[0])
    setRenewDialogOpen(true)
  }

  const handleSaveRenewal = async () => {
    if (!selectedDriver || !newDate) {
      toast.error('Please select a valid date')
      return
    }

    setUpdating(true)
    try {
      const updateData = renewType === 'permit' 
        ? { valid_until: newDate }
        : { license_validity: newDate }

      const { error } = await supabase
        .from('drivers')
        .update(updateData)
        .eq('id', selectedDriver.id)

      if (error) throw error

      toast.success(`${renewType === 'permit' ? 'Franchise Permit' : 'Driver License'} successfully renewed!`)
      setRenewDialogOpen(false)
      fetchDrivers()
    } catch (error) {
      console.error('Error renewing:', error)
      toast.error('Failed to update renewal date')
    } finally {
      setUpdating(false)
    }
  }

  const handleToggleManualSuspension = async (driver) => {
    const isCurrentlyManual = Boolean(driver.is_suspended || manualSuspendedIds.includes(driver.id))
    const nextState = !isCurrentlyManual

    // 1. Instant update in localStorage and local state
    const updatedStorage = toggleManualSuspensionInStorage(driver.id, nextState)
    setManualSuspendedIds(updatedStorage)

    if (nextState) {
      toast.warning(`Manual hold placed on ${driver.first_name} ${driver.last_name}`)
    } else {
      toast.success(`Manual hold removed for ${driver.first_name} ${driver.last_name}`)
    }

    // 2. Best-effort Supabase sync (quietly handle if column is missing)
    try {
      await supabase
        .from('drivers')
        .update({ is_suspended: nextState })
        .eq('id', driver.id)
    } catch (e) {
      // Ignore database column limitation
    }

    fetchDrivers()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl relative overflow-hidden border-rose-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.25)] shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                Suspended & Inactive Drivers
              </h1>
              <p className="text-xs font-semibold text-rose-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Automatic Enforcement & Manual Administrative Hold System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inactive */}
        <Card className="glass-card border-rose-500/40 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent hover:border-rose-500/60 transition-all duration-300 group">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-rose-400 uppercase tracking-widest">Total Inactive Flagged</p>
              <p className="text-4xl font-black text-rose-500 tracking-tight group-hover:scale-105 transition-transform duration-300">{totalSuspended}</p>
              <p className="text-xs font-semibold text-muted-foreground">Public QR feedback locked</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 shadow-md shrink-0 group-hover:rotate-6 transition-transform duration-300">
              <ShieldX className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        {/* Expired Permits */}
        <Card className="glass-card border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent hover:border-amber-500/60 transition-all duration-300 group">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">Expired Permits</p>
              <p className="text-4xl font-black text-amber-500 tracking-tight group-hover:scale-105 transition-transform duration-300">{expiredPermits}</p>
              <p className="text-xs font-semibold text-muted-foreground">Franchise permit renewal needed</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-md shrink-0 group-hover:rotate-6 transition-transform duration-300">
              <FileX className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        {/* Expired Licenses */}
        <Card className="glass-card border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent hover:border-purple-500/60 transition-all duration-300 group">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-purple-400 uppercase tracking-widest">Expired Licenses</p>
              <p className="text-4xl font-black text-purple-500 tracking-tight group-hover:scale-105 transition-transform duration-300">{expiredLicenses}</p>
              <p className="text-xs font-semibold text-muted-foreground">LTO driver license expired</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40 shadow-md shrink-0 group-hover:rotate-6 transition-transform duration-300">
              <IdCard className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/80 pointer-events-none" />
        <Input
          placeholder="Search suspended driver by name, plate number, or TODA..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 pr-10 h-14 rounded-2xl bg-background/60 border-border/60 text-base shadow-lg focus-visible:ring-rose-500/50 backdrop-blur-xl font-medium"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full bg-muted/40"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Flagged Drivers List Queue */}
      <Card className="glass-card border-border/40 shadow-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <CardTitle className="text-lg font-bold">Suspended & Inactive Driver Queue ({suspendedDrivers.length})</CardTitle>
          </div>
          <Badge variant="outline" className="font-extrabold text-xs uppercase px-3 py-1 bg-rose-500/10 text-rose-400 border-rose-500/30">
            Automated Enforcement Queue
          </Badge>
        </CardHeader>
        <CardContent className="p-6">
          {suspendedDrivers.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground">No Suspended Drivers Flagged</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto font-medium">
                {search ? 'No inactive drivers match your search query.' : 'All registered drivers currently have valid, active documentation.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {suspendedDrivers.map((driver) => {
                const isManualHold = Boolean(driver.is_suspended || manualSuspendedIds.includes(driver.id))

                return (
                  <div 
                    key={driver.id} 
                    className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 hover:border-rose-500/50 transition-all duration-300 gap-5 shadow-sm hover:shadow-md"
                  >
                    {/* Left: Driver profile */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-background shrink-0 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 font-extrabold text-xl shadow-md relative">
                        {driver.profile_picture_url ? (
                          <img src={driver.profile_picture_url} alt={driver.first_name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{driver.first_name[0]}{driver.last_name[0]}</span>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md">
                          <Ban className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-extrabold text-foreground text-base sm:text-lg truncate">
                            {driver.first_name} {driver.middle_name ? driver.middle_name + ' ' : ''}{driver.last_name}
                          </h4>
                          <Badge variant="destructive" className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5">
                            SUSPENDED / INACTIVE
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-semibold">
                          <span>Plate: <strong className="text-foreground">{driver.plate_number || 'N/A'}</strong></span>
                          <span>•</span>
                          <span>Body No: <strong className="text-foreground">{driver.body_no || driver.body_number || 'N/A'}</strong></span>
                          <span>•</span>
                          <span>TODA: <strong className="text-primary font-bold">{driver.toda_affiliation || 'N/A'}</strong></span>
                        </div>

                        {/* Specific Badges per Reason */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {driver.suspensionInfo.reasons.map((reason, idx) => {
                            let icon = AlertTriangle
                            let badgeStyle = "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            if (reason.type === 'permit') {
                              icon = FileX
                              badgeStyle = "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            } else if (reason.type === 'license') {
                              icon = IdCard
                              badgeStyle = "bg-purple-500/15 text-purple-300 border-purple-500/30"
                            } else if (reason.type === 'manual') {
                              icon = Ban
                              badgeStyle = "bg-rose-500/20 text-rose-200 border-rose-500/40"
                            }

                            const IconComponent = icon
                            return (
                              <span key={idx} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold shadow-sm ${badgeStyle}`}>
                                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                                {reason.label}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-border/20">
                      {/* Renew Permit Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 text-xs font-extrabold border-amber-500/50 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-all shadow-sm"
                        onClick={() => handleOpenRenew(driver, 'permit')}
                      >
                        <FileCheck className="w-4 h-4 text-amber-400" />
                        Renew Permit
                      </Button>

                      {/* Update License Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 text-xs font-extrabold border-purple-500/50 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 transition-all shadow-sm"
                        onClick={() => handleOpenRenew(driver, 'license')}
                      >
                        <IdCard className="w-4 h-4 text-purple-400" />
                        Update License
                      </Button>

                      {/* Manual Hold Toggle */}
                      <Button
                        size="sm"
                        variant="outline"
                        title={isManualHold ? 'Clear Administrative Hold' : 'Apply Administrative Hold'}
                        className={`gap-1.5 text-xs font-bold transition-all ${
                          isManualHold 
                            ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20' 
                            : 'border-rose-500/40 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20'
                        }`}
                        onClick={() => handleToggleManualSuspension(driver)}
                      >
                        {isManualHold ? (
                          <>
                            <Unlock className="w-4 h-4 text-emerald-400" />
                            Clear Hold
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-rose-400" />
                            Manual Hold
                          </>
                        )}
                      </Button>

                      {/* View Driver Profile */}
                      <Link to={`/dashboard/drivers/${driver.id}`}>
                        <Button size="sm" variant="secondary" className="gap-1.5 text-xs font-bold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Renewal Dialog Modal */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent className="sm:max-w-md glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              {renewType === 'permit' ? (
                <FileCheck className="w-6 h-6 text-amber-400" />
              ) : (
                <IdCard className="w-6 h-6 text-purple-400" />
              )}
              Renew {renewType === 'permit' ? 'Franchise Permit' : 'Driver License'}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium pt-1">
              Set new validity date for <strong>{selectedDriver?.first_name} {selectedDriver?.last_name}</strong> to update compliance records.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Select Expiration Date
              </label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="font-bold text-base h-12 rounded-xl bg-background border-border/60"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRenewDialogOpen(false)} className="font-bold">
              Cancel
            </Button>
            <Button onClick={handleSaveRenewal} disabled={updating} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6">
              {updating ? 'Updating Date...' : 'Save & Confirm Renewal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
