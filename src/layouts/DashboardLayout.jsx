import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  LogOut, 
  Menu, 
  X,
  Star,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'All Drivers', icon: Users, path: '/dashboard/drivers' },
  { label: 'Add Driver', icon: UserPlus, path: '/dashboard/drivers/new' },
]

export default function DashboardLayout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:sticky top-0 left-0 z-50 h-screen w-72 glass-card border-r border-border/30 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20 text-primary">
            <Star className="h-6 w-6 fill-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg gradient-text">TricycleRate</h1>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Admin Panel</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden ml-auto"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator className="bg-border/30" />

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto text-primary/60" />}
              </Link>
            )
          })}
        </nav>

        <Separator className="bg-border/30" />

        {/* User section */}
        <div className="p-4">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.email || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 glass-card border-b border-border/30 px-4 py-3 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold gradient-text">TricycleRate</span>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
