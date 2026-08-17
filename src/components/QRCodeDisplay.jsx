import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Download, Printer, ShieldAlert } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { getIDCardStyles, generateIDCardHTML } from '@/lib/idCardTemplate'
import { checkDriverSuspension, getManualSuspensions } from '@/pages/SuspendedDrivers'

export default function QRCodeDisplay({ value, driverName, driver, size = 200 }) {
  const qrRef = useRef(null)

  // Get suspension status for this driver
  const suspensionInfo = driver ? checkDriverSuspension(driver, 0, getManualSuspensions()) : { isSuspended: false, reasons: [], details: {} }
  const isSuspended = suspensionInfo.isSuspended
  const { isPermitExpired, isLicenseExpired, isManual } = suspensionInfo.details

  // Build stamp labels
  const stamps = []
  if (isManual) stamps.push('INACTIVE')
  if (isPermitExpired) stamps.push('NO PERMIT')
  if (isLicenseExpired) stamps.push('LICENSE EXPIRED')

  const handleDownload = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width + 60
      canvas.height = img.height + 100

      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw QR code centered
      ctx.drawImage(img, 30, 20)

      // If suspended, draw stamp overlays on the downloaded image
      if (isSuspended && stamps.length > 0) {
        ctx.save()
        ctx.translate(canvas.width / 2, img.height / 2 + 20)
        ctx.rotate(-Math.PI / 12) // slight tilt

        stamps.forEach((stamp, i) => {
          const yOffset = i * 32 - ((stamps.length - 1) * 16)
          ctx.font = 'bold 18px Inter, sans-serif'
          const textWidth = ctx.measureText(stamp).width
          const padX = 14
          const padY = 6

          // Red stamp background
          ctx.fillStyle = 'rgba(220, 38, 38, 0.15)'
          ctx.strokeStyle = 'rgba(220, 38, 38, 0.85)'
          ctx.lineWidth = 2.5
          ctx.beginPath()
          ctx.roundRect(-textWidth / 2 - padX, yOffset - 14 - padY, textWidth + padX * 2, 28 + padY * 2, 6)
          ctx.fill()
          ctx.stroke()

          // Red stamp text
          ctx.fillStyle = 'rgba(220, 38, 38, 0.9)'
          ctx.textAlign = 'center'
          ctx.fillText(stamp, 0, yOffset + 6)
        })
        ctx.restore()
      }

      // Add driver name below
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(driverName, canvas.width / 2, img.height + 50)

      // Add "Scan to Rate" text
      ctx.font = '11px Inter, sans-serif'
      ctx.fillStyle = '#666666'
      ctx.fillText(isSuspended ? 'Rating Suspended' : 'Scan to Rate Driver', canvas.width / 2, img.height + 70)

      const link = document.createElement('a')
      link.download = `qr-${driverName.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }, [driverName, isSuspended, stamps])

  const operatorFullName = driver
    ? [driver.operator_first_name, driver.operator_middle_name, driver.operator_last_name].filter(Boolean).join(' ') || 'N/A'
    : 'N/A'

  const handlePrint = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const profilePic = driver?.profile_picture_url || ''
    const printWindow = window.open('', '_blank')
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Driver ID Card - ${driverName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            ${getIDCardStyles()}
          </style>
        </head>
        <body>
          ${generateIDCardHTML(driver, driverName, operatorFullName, profilePic, svgData)}
        </body>
      </html>
    `)

    setTimeout(() => printWindow.print(), 500)
  }, [driverName, driver, value, operatorFullName])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code with Stamp Overlay */}
      <div className="relative">
        <div
          ref={qrRef}
          className={`p-5 bg-white rounded-2xl shadow-lg transition-all duration-300 ${isSuspended ? 'opacity-40 grayscale' : ''}`}
        >
          <QRCode
            value={value}
            size={size}
            level="H"
            bgColor="#ffffff"
            fgColor="#1a1a2e"
          />
        </div>

        {/* Stamp Overlays */}
        {isSuspended && stamps.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ transform: 'rotate(-12deg)' }}>
            {stamps.map((stamp, i) => (
              <div
                key={i}
                className="border-[3px] border-red-600 rounded-lg px-3 py-1.5 mb-1.5 bg-red-600/10 backdrop-blur-[2px] shadow-lg"
              >
                <span className="text-red-600 font-black text-sm tracking-[0.2em] uppercase whitespace-nowrap drop-shadow-sm">
                  {stamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Text */}
      {isSuspended ? (
        <div className="flex items-center gap-1.5 text-xs text-red-500 font-bold">
          <ShieldAlert className="w-3.5 h-3.5" />
          Rating submissions locked
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center">
          Scan this QR code to rate the driver
        </p>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          Print ID Card
        </Button>
      </div>
    </div>
  )
}
