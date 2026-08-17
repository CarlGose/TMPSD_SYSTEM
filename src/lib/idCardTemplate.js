export const getIDCardStyles = () => `
  @page {
    size: A4 landscape;
    margin: 0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', Arial, sans-serif;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    page-break-after: always;
    min-height: 100vh;
    padding: 20px;
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
    font-size: 15px;
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
  .qr-box {
    display: inline-block;
  }
  .qr-box svg, .qr-box img {
    width: 150px !important;
    height: 150px !important;
    display: block;
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

  .print-note {
    margin-top: 20px;
    font-size: 12px;
    color: #444;
    text-align: center;
    font-weight: 600;
    background: #f1f5f9;
    padding: 10px 20px;
    border-radius: 8px;
    border: 1px dashed #cbd5e1;
    max-width: 6in;
  }

  @media print {
    body { background: white; padding: 0; }
    .page-container { min-height: 100vh; padding: 0; justify-content: center; align-items: center; page-break-after: always; margin-bottom: 0; }
    .id-card { box-shadow: none; border: 1px solid #000; }
    .print-note { display: block !important; border: none; background: transparent; padding: 5px; margin-top: 10px; }
  }
`

export const generateIDCardHTML = (driver, driverName, operatorFullName, profilePic, qrContent) => {
  return `
    <div class="page-container">
      <div class="id-card">
        <!-- Header with TMPSD Logo -->
        <div class="card-header">
          <img src="/logos/TMPSD.png" alt="TMPSD" onerror="this.style.display='none'" />
          <div class="card-header-text">
            <h1>Motorized Tricycle Operator Permit</h1>
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
                ${qrContent}
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
      
      <!-- User requested print size and paper note -->
      <div class="print-note">
        🖨️ <strong>Print Settings:</strong> Use <strong>A4 Paper</strong> size. <strong>Orientation:</strong> Landscape. Set printer scale to 100% (Actual Size). Cut to <strong>6" × 5" inches</strong>. Do not fit to page.
      </div>
    </div>
  `
}
