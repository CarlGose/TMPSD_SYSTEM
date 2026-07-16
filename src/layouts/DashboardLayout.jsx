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
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()

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
        'fixed lg:sticky top-0 left-0 z-50 h-screen glass-card border-r border-border/30 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0',
        isCollapsed ? 'lg:w-20' : 'lg:w-72'
      )}>
        {/* Logo */}
        <div className={cn("p-4 flex items-center gap-3 transition-all", isCollapsed ? "justify-center px-2" : "")}>
          <img
            src="/tmpsd-logo.png"
            alt="TMPSD Logo"
            className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-primary/40 shadow-lg"
          />
          {!isCollapsed && (
            <div className="animate-in fade-in zoom-in duration-300 min-w-0">
              <h1 className="font-bold text-sm gradient-text whitespace-nowrap leading-tight">TMPSD</h1>
              <p className="text-[10px] text-muted-foreground tracking-wide whitespace-nowrap leading-tight">Palayan City, Nueva Ecija</p>
              <p className="text-[9px] text-primary/70 tracking-wider uppercase whitespace-nowrap leading-tight">Admin Panel</p>
            </div>
          )}
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
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isCollapsed ? 'justify-center px-2' : 'px-4',
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )} />
                {!isCollapsed && <span className="animate-in fade-in duration-300 whitespace-nowrap">{item.label}</span>}
                {isActive && !isCollapsed && <ChevronRight className="h-4 w-4 ml-auto text-primary/60 shrink-0" />}
              </Link>
            )
          })}
        </nav>

        <Separator className="bg-border/30" />

        {/* User section & Collapse Toggle */}
        <div className="p-4 flex flex-col gap-2">
          <div className={cn("flex items-center gap-3 py-2 transition-all", isCollapsed ? "justify-center px-0" : "px-3")}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                <p className="text-xs font-medium text-foreground truncate">{user?.email || 'Admin'}</p>
                <p className="text-[10px] text-muted-foreground">Administrator</p>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            title={isCollapsed ? "Sign Out" : undefined}
            className={cn("w-full gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10", isCollapsed ? "justify-center px-2" : "justify-start")}
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="animate-in fade-in duration-300 whitespace-nowrap">Sign Out</span>}
          </Button>

          <Button
            variant="ghost"
            title={isCollapsed ? "Toggle Theme" : undefined}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn("w-full gap-3 text-muted-foreground hover:text-foreground", isCollapsed ? "justify-center px-2" : "justify-start")}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {!isCollapsed && <span className="animate-in fade-in duration-300 whitespace-nowrap">Toggle Theme</span>}
          </Button>

          {/* Desktop Only Collapse Toggle */}
          <Button
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full mt-2 gap-3 text-muted-foreground hover:text-foreground"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
            {!isCollapsed && <span className="animate-in fade-in duration-300 whitespace-nowrap">Collapse</span>}
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
            <img src="/tmpsd-logo.png" alt="TMPSD" className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/40" />
            <div className="leading-tight">
              <span className="font-bold gradient-text text-sm">TMPSD</span>
              <p className="text-[9px] text-muted-foreground">Palayan City</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto transition-all duration-300">
          {children}
        </div>
      </main>
    </div>
  )
}
