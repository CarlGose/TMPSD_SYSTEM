import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'
import { useCallback, useRef } from 'react'

export default function QRCodeDisplay({ value, driverName, driver, size = 200 }) {
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
            @page {
              size: 6in 5in landscape;
              margin: 0;
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', Arial, sans-serif;
              background: #fff;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .id-card {
              width: 6in;
              height: 5in;
              background: #fff;
              border: 2px solid #1E301B;
              border-radius: 8px;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              position: relative;
            }

            /* Header */
            .card-header {
              background: linear-gradient(135deg, #1E301B, #324F2D);
              color: white;
              padding: 10px 16px;
              display: flex;
              align-items: center;
              gap: 12px;
              flex-shrink: 0;
            }
            .card-header img {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: white;
              padding: 2px;
              object-fit: contain;
            }
            .card-header-text h1 {
              font-size: 18px;
              font-weight: 800;
              color: #FFBF00;
              letter-spacing: 0.5px;
            }
            .card-header-text p {
              font-size: 10px;
              color: rgba(255,255,255,0.9);
              line-height: 1.1;
            }
            .card-header-text .sub {
              font-size: 9px;
              color: rgba(255,191,0,0.8);
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 2px;
            }

            /* Title bar */
            .card-title-bar {
              background: #FFBF00;
              color: #1E301B;
              text-align: center;
              padding: 6px;
              font-size: 12px;
              font-weight: 800;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              flex-shrink: 0;
            }

            /* Main Content Container */
            .main-content {
              display: flex;
              flex: 1;
              overflow: hidden;
            }

            /* Left Column: Driver Info */
            .left-col {
              flex: 1.6;
              padding: 10px 14px;
              display: flex;
              flex-direction: column;
              border-right: 1px dashed #D1E0CC;
              overflow: hidden;
            }

            .photo-info-row {
              display: flex;
              gap: 12px;
              margin-bottom: 6px;
            }
            .photo-box {
              width: 120px;
              height: 120px;
              border: 2px solid #1E301B;
              border-radius: 6px;
              overflow: hidden;
              flex-shrink: 0;
              background: #f9f9f9;
            }
            .photo-box img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .photo-box .initials {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 36px;
              font-weight: 800;
              color: #1E301B;
              background: #E6EDE4;
            }
            .info-column {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              gap: 4px;
            }
            .driver-name {
              font-size: 16px;
              font-weight: 800;
              color: #1E301B;
              line-height: 1.1;
              margin-bottom: 4px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px 8px;
            }
            .info-grid-3 {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 6px 8px;
            }
            .info-item {
              display: flex;
              flex-direction: column;
            }
            .info-item .label {
              font-size: 8px;
              text-transform: uppercase;
              color: #888;
              font-weight: 700;
              line-height: 1.1;
            }
            .info-item .value {
              font-size: 11px;
              font-weight: 700;
              color: #1E301B;
              line-height: 1.2;
              word-break: break-word;
            }
            .info-full {
              grid-column: 1 / -1;
            }

            .section-title {
              font-size: 10px;
              font-weight: 800;
              color: #467235;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #E6EDE4;
              padding-bottom: 2px;
              margin-bottom: 6px;
              margin-top: 8px;
            }

            /* Right Column: QR & Complaint */
            .right-col {
              flex: 1;
              display: flex;
              flex-direction: column;
              background: #FAFCFA;
            }

            .qr-section {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 4px;
              text-align: center;
            }
            .qr-box svg {
              width: 150px !important;
              height: 150px !important;
            }
            .qr-text {
              margin-top: 8px;
            }
            .qr-text .scan-label {
              font-size: 16px;
              font-weight: 800;
              color: #1E301B;
            }
            .qr-text .scan-desc {
              font-size: 12px;
              color: #666;
              line-height: 1.3;
              margin-top: 4px;
            }

            .complaint-notice {
              background: linear-gradient(135deg, #FFF8E1, #FFFDE7);
              border-top: 1px solid #FFBF00;
              padding: 6px 10px;
              flex-shrink: 0;
            }
            .complaint-notice .notice-title {
              font-size: 10px;
              font-weight: 800;
              color: #1E301B;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .complaint-notice .notice-text {
              font-size: 9px;
              color: #444;
              line-height: 1.3;
            }
            .complaint-notice .notice-text strong {
              color: #1E301B;
            }

            /* Footer */
            .card-footer {
              background: #1E301B;
              color: rgba(255,255,255,0.7);
              text-align: center;
              padding: 6px;
              font-size: 9px;
              letter-spacing: 0.5px;
              flex-shrink: 0;
            }

            @media print {
              body { background: white; padding: 0; }
              .id-card { box-shadow: none; border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <!-- Header with TMPSD Logo -->
            <div class="card-header">
              <img src="/logos/TMPSD.png" alt="TMPSD" onerror="this.style.display='none'" />
              <div class="card-header-text">
                <h1>TMPSD</h1>
                <p>Traffic Management and Public Safety Division</p>
                <div class="sub">Palayan City • Capital of Nueva Ecija</div>
              </div>
            </div>

            <div class="card-title-bar">TRICYCLE DRIVER IDENTIFICATION</div>

            <!-- Main Content: Left & Right Columns -->
            <div class="main-content">
              <!-- Left Column -->
              <div class="left-col">
                <div class="photo-info-row">
                  <div class="photo-box">
                    ${profilePic
                      ? `<img src="${profilePic}" alt="Driver Photo" />`
                      : `<div class="initials">${(driver?.first_name?.[0] || '') + (driver?.last_name?.[0] || '')}</div>`
                    }
                  </div>
                  <div class="info-column">
                    <div class="info-item info-full">
                      <span class="label">Name</span>
                      <div class="driver-name">${driverName}</div>
                    </div>
                    <div class="info-item info-full">
                      <span class="label">Driver Address</span>
                      <span class="value">${driver?.address || 'N/A'}</span>
                    </div>
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="label">License No.</span>
                        <span class="value">${driver?.license || 'N/A'}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">Registered</span>
                        <span class="value">${driver?.created_at ? new Date(driver.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="info-item info-full" style="margin-bottom: 2px;">
                  <span class="label">TODA Affiliation</span>
                  <span class="value">${driver?.toda_affiliation || 'N/A'}</span>
                </div>

                <div class="section-title">Operator Details</div>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Name</span>
                    <span class="value">${operatorFullName}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Address</span>
                    <span class="value">${driver?.operator_address || 'N/A'}</span>
                  </div>
                </div>

                <div class="section-title">Tricycle Details</div>
                <div class="info-grid-3">
                  <div class="info-item"><span class="label">Plate No.</span><span class="value">${driver?.plate_number || 'N/A'}</span></div>
                  <div class="info-item"><span class="label">Body No.</span><span class="value">${driver?.body_no || 'N/A'}</span></div>
                  <div class="info-item"><span class="label">Sticker</span><span class="value">${driver?.body_sticker || 'N/A'}</span></div>
                  
                  <div class="info-item"><span class="label">Permit No.</span><span class="value">${driver?.permit_no || 'N/A'}</span></div>
                  <div class="info-item"><span class="label">Valid Until</span><span class="value">${driver?.valid_until ? new Date(driver.valid_until).toLocaleDateString() : 'N/A'}</span></div>
                  <div class="info-item"><span class="label">OR No.</span><span class="value">${driver?.or_no || 'N/A'}</span></div>
                  
                  <div class="info-item"><span class="label">Make</span><span class="value">${driver?.make || 'N/A'}</span></div>
                  <div class="info-item"><span class="label">Motor No.</span><span class="value">${driver?.motor_no || 'N/A'}</span></div>
                  <div class="info-item"><span class="label">Chassis No.</span><span class="value">${driver?.chassis_no || 'N/A'}</span></div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="right-col">
                <div class="qr-section">
                  <div class="qr-box">
                    ${svgData}
                  </div>
                  <div class="qr-text">
                    <div class="scan-label">Scan to Rate This Driver</div>
                    <div class="scan-desc">Use your phone camera to scan<br/>and submit feedback.</div>
                  </div>
                </div>

                <div class="complaint-notice">
                  <div class="notice-title">📋 Complaints & Feedback</div>
                  <div class="notice-text">
                    For <strong>complaints or concerns</strong>, scan the QR code above or visit the 
                    <strong>TMPSD Office, Palayan City Hall</strong>.
                    <br/>
                    <strong>Hotline:</strong> (044) 940-0029
                  </div>
                </div>
              </div>
            </div>

            <div class="card-footer">
              Tricycle Driver Rating System &copy; ${new Date().getFullYear()} &mdash; TMPSD Palayan City
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }, [driverName, driver, value, operatorFullName])

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
          Print ID Card
        </Button>
      </div>
    </div>
  )
}
