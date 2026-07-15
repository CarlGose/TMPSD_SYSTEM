import { useState, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown, Search, MapPin } from 'lucide-react'
import { TODA_LIST } from '@/lib/constants'

export default function TodaCombobox({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredTodas = TODA_LIST.filter(toda => 
    toda.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between h-10 px-3 py-2 text-sm bg-input/50 border border-border/50 rounded-md ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={`truncate ${!value && 'text-muted-foreground'}`}>
          {value || 'Select TODA Affiliation...'}
        </span>
        <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
      </button>

      {/* Dropdown Content */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Search Input inside Dropdown */}
          <div className="flex items-center px-3 border-b border-border/50 sticky top-0 bg-background/50 backdrop-blur-sm z-10">
            <Search className="w-4 h-4 mr-2 opacity-50 shrink-0" />
            <input
              className="flex w-full py-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder="Search TODA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* List of Options */}
          <div className="max-h-60 overflow-y-auto p-1 py-2 custom-scrollbar">
            {filteredTodas.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No TODA found.
              </p>
            ) : (
              filteredTodas.map((toda) => (
                <button
                  key={toda}
                  type="button"
                  onClick={() => {
                    onChange(toda)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={`relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 px-3 text-sm outline-none transition-colors hover:bg-primary/10 hover:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${value === toda ? 'bg-primary/15 text-primary font-medium' : 'text-foreground/80'}`}
                >
                  <MapPin className={`w-4 h-4 mr-3 shrink-0 ${value === toda ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="truncate text-left flex-1">{toda}</span>
                  {value === toda && (
                    <Check className="w-4 h-4 ml-auto text-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
