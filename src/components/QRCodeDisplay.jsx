import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'
import { useCallback, useRef } from 'react'

export default function QRCodeDisplay({ value, driverName, size = 200 }) {
  const qrRef = useRef(null)

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

      // Add driver name below
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(driverName, canvas.width / 2, img.height + 50)

      // Add "Scan to Rate" text
      ctx.font = '11px Inter, sans-serif'
      ctx.fillStyle = '#666666'
      ctx.fillText('Scan to Rate Driver', canvas.width / 2, img.height + 70)

      const link = document.createElement('a')
      link.download = `qr-${driverName.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }, [driverName])

  const handlePrint = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${driverName}</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh;
              font-family: 'Inter', Arial, sans-serif;
              margin: 0;
            }
            .name { font-size: 18px; font-weight: bold; margin-top: 16px; }
            .subtitle { font-size: 13px; color: #666; margin-top: 4px; }
          </style>
        </head>
        <body>
          ${svgData}
          <p class="name">${driverName}</p>
          <p class="subtitle">Scan to Rate Driver</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }, [driverName])

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={qrRef}
        className="p-5 bg-white rounded-2xl shadow-lg"
      >
        <QRCode
          value={value}
          size={size}
          level="H"
          bgColor="#ffffff"
          fgColor="#1a1a2e"
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Scan this QR code to rate the driver
      </p>
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
          Print
        </Button>
      </div>
    </div>
  )
}
