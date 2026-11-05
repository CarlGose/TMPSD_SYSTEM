export const getIDCardStyles = () => `
  @page {
    size: 8.5in 7in;
    margin: 0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    width: 8.5in;
    height: 7in;
    max-width: 8.5in;
    max-height: 7in;
    background: #FFFFFF;
    border: 3px solid #142911;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(15, 36, 14, 0.2);
    position: relative;
  }

  /* Background security tint */
  .id-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(30, 56, 26, 0.03) 0%, transparent 60%),
      radial-gradient(circle at 80% 80%, rgba(255, 191, 0, 0.03) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  /* Header */
  .card-header {
    background: linear-gradient(135deg, #0D1E0C 0%, #1A3517 50%, #2A4F26 100%);
    color: white;
    padding: 10px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #FFBF00;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .card-header img {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: white;
    padding: 2px;
    object-fit: contain;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    border: 2px solid #FFBF00;
    flex-shrink: 0;
  }
  .card-header-text h2 {
    font-size: 8px;
    font-weight: 700;
    color: rgba(255,255,255,0.85);
    letter-spacing: 1.2px;
    text-transform: uppercase;
    line-height: 1.1;
  }
  .card-header-text h1 {
    font-size: 16px;
    font-weight: 900;
    color: #FFD233;
    letter-spacing: 0.5px;
    line-height: 1.2;
    text-shadow: 0 1px 2px rgba(0,0,0,0.4);
  }
  .card-header-text p {
    font-size: 10px;
    color: #FFFFFF;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.3px;
  }
  .card-header-text .sub {
    font-size: 8px;
    color: rgba(255,210,51,0.9);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-top: 2px;
    font-weight: 700;
  }
  .header-right-badge {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 191, 0, 0.5);
    padding: 5px 12px;
    border-radius: 6px;
    text-align: right;
  }
  .header-right-badge .badge-label {
    font-size: 7.5px;
    color: #FFD233;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 0.8px;
  }
  .header-right-badge .badge-val {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: 0.5px;
  }

  /* Title bar */
  .card-title-bar {
    background: linear-gradient(90deg, #D49B00 0%, #FFBF00 50%, #D49B00 100%);
    color: #11240F;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 18px;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  /* Main Content Container */
  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  /* Left Column: Driver Info */
  .left-col {
    flex: 1.85;
    padding: 12px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    background: #FFFFFF;
  }

  /* Top Photo + Identity */
  .photo-info-row {
    display: flex;
    gap: 14px;
    align-items: stretch;
  }
  .photo-box {
    width: 135px;
    height: 148px;
    border: 2px solid #142911;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    background: #EEF4ED;
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    position: relative;
  }
  .photo-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .photo-box .initials {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44px;
    font-weight: 900;
    color: #142911;
    background: #DFEADF;
  }
  .photo-box .photo-tag {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(20, 41, 17, 0.88);
    color: #FFD233;
    font-size: 7.5px;
    font-weight: 800;
    text-align: center;
    padding: 3px 0;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .info-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }

  /* Driver Name Box */
  .driver-name-block {
    background: #F3F8F2;
    border: 1px solid #D1E2CF;
    border-left: 4px solid #1E3D19;
    border-radius: 6px;
    padding: 6px 12px;
  }
  .driver-name-block .label {
    font-size: 7.5px;
    font-weight: 800;
    color: #4C6A48;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    line-height: 1;
  }
  .driver-name {
    font-size: 16px;
    font-weight: 900;
    color: #0F220E;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    word-break: break-word;
    margin-top: 1px;
  }

  .driver-meta-grid {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 5px 10px;
    margin-top: 4px;
  }
  .meta-item {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .meta-item .label {
    font-size: 7.5px;
    text-transform: uppercase;
    color: #557252;
    font-weight: 800;
    letter-spacing: 0.4px;
    line-height: 1.1;
  }
  .meta-item .value {
    font-size: 10.5px;
    font-weight: 700;
    color: #172D14;
    line-height: 1.25;
    word-break: break-word;
  }
  .meta-item .value.font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    font-weight: 800;
    color: #0E2B0B;
  }

  /* TODA Affiliation banner */
  .toda-banner {
    background: linear-gradient(90deg, #EDF5EC 0%, #F5FAF4 100%);
    border: 1px solid #CFE2CD;
    border-left: 4px solid #2B5226;
    border-radius: 6px;
    padding: 6px 12px;
    display: flex;
    flex-direction: column;
    margin: 2px 0;
  }
  .toda-banner .label {
    font-size: 7.5px;
    font-weight: 800;
    color: #456B41;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    line-height: 1;
    margin-bottom: 2px;
  }
  .toda-banner .toda-val {
    font-size: 11.5px;
    font-weight: 800;
    color: #142B11;
    line-height: 1.2;
    text-transform: uppercase;
    word-break: break-word;
  }

  /* Section Title */
  .section-title {
    font-size: 8.5px;
    font-weight: 900;
    color: #1C3818;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 3px;
    margin-bottom: 3px;
  }
  .section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #D2E3D0;
  }

  /* Operator Box */
  .operator-box {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 5px 12px;
    background: #F9FBF8;
    border: 1px solid #D9E8D7;
    border-radius: 6px;
    padding: 6px 12px;
  }

  /* Tricycle Specifications Grid */
  .tricycle-box {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px 10px;
    background: #F4F8F3;
    border: 1px solid #D2E4D0;
    border-radius: 6px;
    padding: 6px 12px;
  }
  .tri-item {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .tri-label {
    font-size: 7px;
    font-weight: 800;
    color: #557252;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    line-height: 1;
    margin-bottom: 1px;
  }
  .tri-val {
    font-size: 10px;
    font-weight: 700;
    color: #142911;
    line-height: 1.2;
    word-break: break-word;
  }
  .tri-val.highlight {
    color: #0B3308;
    font-weight: 900;
    font-size: 11px;
  }
  .font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    letter-spacing: -0.3px;
  }

  /* Official Signature Block */
  .signature-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding-top: 6px;
    margin-top: 2px;
    border-top: 1px dashed #D5E4D2;
  }
  .sig-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .sig-line {
    width: 85%;
    height: 1px;
    background: #738C70;
    margin-top: 16px;
    margin-bottom: 2px;
  }
  .sig-title {
    font-size: 7.5px;
    font-weight: 800;
    color: #4B6847;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  /* Right Column: Portal & QR Code */
  .right-col {
    flex: 1;
    border-left: 2px dashed #C2D6BF;
    background: linear-gradient(180deg, #F8FAF7 0%, #EEF4EC 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 12px 14px;
    overflow: hidden;
  }

  .portal-header {
    text-align: center;
    background: #E5EFE3;
    border: 1px solid #C8DEC5;
    border-radius: 6px;
    padding: 5px 8px;
  }
  .portal-header .portal-title {
    font-size: 8.5px;
    font-weight: 900;
    color: #173813;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .qr-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6px 4px;
    text-align: center;
  }
  
  /* Viewfinder styled QR Box */
  .qr-box-wrapper {
    position: relative;
    padding: 8px;
    display: inline-block;
  }
  .qr-box-wrapper .corner-tl,
  .qr-box-wrapper .corner-tr,
  .qr-box-wrapper .corner-bl,
  .qr-box-wrapper .corner-br {
    position: absolute;
    width: 16px;
    height: 16px;
    border-color: #244C20;
    pointer-events: none;
  }
  .qr-box-wrapper .corner-tl { top: 0; left: 0; border-top: 3px solid; border-left: 3px solid; }
  .qr-box-wrapper .corner-tr { top: 0; right: 0; border-top: 3px solid; border-right: 3px solid; }
  .qr-box-wrapper .corner-bl { bottom: 0; left: 0; border-bottom: 3px solid; border-left: 3px solid; }
  .qr-box-wrapper .corner-br { bottom: 0; right: 0; border-bottom: 3px solid; border-right: 3px solid; }

  .qr-box {
    background: #FFFFFF;
    padding: 6px;
    border-radius: 8px;
    box-shadow: 0 4px 14px rgba(20, 41, 17, 0.12);
    border: 1px solid #D0E2CE;
    display: block;
  }
  .qr-box svg, .qr-box img {
    width: 155px !important;
    height: 155px !important;
    display: block;
  }

  .qr-rating-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    margin-top: 6px;
    color: #E6A200;
    font-size: 14px;
    letter-spacing: 1.5px;
  }

  .qr-text .scan-label {
    font-size: 14px;
    font-weight: 900;
    color: #142911;
    letter-spacing: 0.2px;
    line-height: 1.15;
    margin-top: 3px;
  }
  .qr-text .scan-desc {
    font-size: 9.5px;
    color: #4C6948;
    line-height: 1.3;
    margin-top: 2px;
  }

  /* Complaints & Feedback Card */
  .complaint-notice {
    background: #FFFDF5;
    border: 1px solid #FDE68A;
    border-left: 4px solid #D97706;
    border-radius: 6px;
    padding: 8px 12px;
  }
  .complaint-notice .notice-title {
    font-size: 8.5px;
    font-weight: 900;
    color: #92400E;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .complaint-notice .notice-text {
    font-size: 8.5px;
    color: #374151;
    line-height: 1.3;
  }
  .complaint-notice .notice-text strong {
    color: #142911;
    font-weight: 800;
  }

  /* Footer */
  .card-footer {
    background: #142911;
    color: rgba(255,255,255,0.85);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 18px;
    font-size: 9px;
    letter-spacing: 0.6px;
    flex-shrink: 0;
    border-top: 1px solid rgba(255,191,0,0.4);
    position: relative;
    z-index: 1;
  }
  .card-footer .footer-left {
    font-weight: 600;
  }
  .card-footer .footer-right {
    color: #FFD233;
    font-weight: 800;
    text-transform: uppercase;
  }

  .print-note {
    margin-top: 20px;
    font-size: 12.5px;
    color: #444;
    text-align: center;
    font-weight: 600;
    background: #f1f5f9;
    padding: 10px 20px;
    border-radius: 8px;
    border: 1px dashed #cbd5e1;
    max-width: 8.5in;
  }

  @media print {
    body { background: white; padding: 0; }
    .page-container { min-height: 100vh; padding: 0; justify-content: center; align-items: center; page-break-after: always; margin-bottom: 0; }
    .id-card { box-shadow: none; border: 2px solid #000; }
    .print-note { display: block !important; border: none; background: transparent; padding: 5px; margin-top: 10px; }
  }
`

export const generateIDCardHTML = (driver, driverName, operatorFullName, profilePic, qrContent) => {
  const formattedDriverName = (driverName || '').toUpperCase()
  const formattedOperatorName = (operatorFullName || 'N/A').toUpperCase()
  const todaAffiliation = (driver?.toda_affiliation || 'N/A').toUpperCase()
  const permitNo = driver?.permit_no || 'N/A'
  const validUntil = driver?.valid_until ? new Date(driver.valid_until).toLocaleDateString() : 'N/A'
  const registeredDate = driver?.created_at ? new Date(driver.created_at).toLocaleDateString() : 'N/A'
  const currentYear = new Date().getFullYear()

  return `
    <div class="page-container">
      <div class="id-card">
        <!-- Header with TMPSD Logo -->
        <div class="card-header">
          <div class="header-left">
            <img src="/logos/TMPSD.png" alt="TMPSD" onerror="this.src='https://placehold.co/52x52/142911/FFBF00?text=TMPSD'" />
            <div class="card-header-text">
              <h2>Republic of the Philippines • City Government of Palayan</h2>
              <h1>Motorized Tricycle Operator's Permit</h1>
              <p>Traffic Management and Public Safety Division (TMPSD)</p>
              <div class="sub">Capital of Nueva Ecija • Official Transport Identification</div>
            </div>
          </div>
          <div class="header-right-badge">
            <div class="badge-label">Permit No.</div>
            <div class="badge-val">${permitNo}</div>
          </div>
        </div>

        <div class="card-title-bar">
          <span>Official Tricycle Driver Identification</span>
          <span style="font-size: 9px; letter-spacing: 1px;">MTOP Series ${currentYear}</span>
        </div>

        <!-- Main Content: Left & Right Columns -->
        <div class="main-content">
          <!-- Left Column -->
          <div class="left-col">
            <!-- Driver Top Row (Photo + Core Info) -->
            <div class="photo-info-row">
              <div class="photo-box">
                ${profilePic
                  ? `<img src="${profilePic}" alt="Driver Photo" />`
                  : `<div class="initials">${((driver?.first_name?.[0] || '') + (driver?.last_name?.[0] || '')).toUpperCase()}</div>`
                }
                <div class="photo-tag">Authorized Driver</div>
              </div>
              <div class="info-column">
                <div class="driver-name-block">
                  <span class="label">Driver Full Name</span>
                  <div class="driver-name">${formattedDriverName}</div>
                </div>
                
                <div class="driver-meta-grid">
                  <div class="meta-item">
                    <span class="label">Driver Home Address</span>
                    <span class="value">${driver?.address || 'N/A'}</span>
                  </div>
                  <div class="meta-item">
                    <span class="label">Driver License No.</span>
                    <span class="value font-mono">${driver?.license || 'N/A'}</span>
                  </div>
                  <div class="meta-item">
                    <span class="label">Date Registered</span>
                    <span class="value">${registeredDate}</span>
                  </div>
                  <div class="meta-item">
                    <span class="label">Validity Status</span>
                    <span class="value" style="color: #0E5E10; font-weight: 800;">● ACTIVE / LICENSED</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TODA Affiliation Banner -->
            <div class="toda-banner">
              <span class="label">Accredited TODA Affiliation</span>
              <div class="toda-val">${todaAffiliation}</div>
            </div>

            <!-- Operator Details Section -->
            <div>
              <div class="section-title">Franchise & Operator Details</div>
              <div class="operator-box">
                <div class="meta-item">
                  <span class="label">Registered Operator</span>
                  <span class="value" style="text-transform: uppercase;">${formattedOperatorName}</span>
                </div>
                <div class="meta-item">
                  <span class="label">Operator Address</span>
                  <span class="value">${driver?.operator_address || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Tricycle Details Section -->
            <div>
              <div class="section-title">Registered Tricycle Specifications</div>
              <div class="tricycle-box">
                <div class="tri-item">
                  <span class="tri-label">Plate Number</span>
                  <span class="tri-val highlight">${driver?.plate_number || 'N/A'}</span>
                </div>
                <div class="tri-item">
                  <span class="tri-label">Body Number</span>
                  <span class="tri-val highlight">${driver?.body_no || 'N/A'}</span>
                </div>
                <div class="tri-item">
                  <span class="tri-label">Body Sticker</span>
                  <span class="tri-val">${driver?.body_sticker || 'N/A'}</span>
                </div>
                
                <div class="tri-item">
                  <span class="tri-label">Permit Number</span>
                  <span class="tri-val font-mono">${permitNo}</span>
                </div>
                <div class="tri-item">
                  <span class="tri-label">Valid Until</span>
                  <span class="tri-val">${validUntil}</span>
                </div>
                <div class="tri-item">
                  <span class="tri-label">Official Receipt (OR)</span>
                  <span class="tri-val font-mono">${driver?.or_no || 'N/A'}</span>
                </div>
                
                <div class="tri-item">
                  <span class="tri-label">Unit Make / Model</span>
                  <span class="tri-val">${driver?.make || 'N/A'}</span>
                </div>
                <div class="tri-item">
                  <span class="tri-label">Motor Number</span>
                  <span class="tri-val font-mono">${driver?.motor_no || 'N/A'}</span>
                </div>
                <div class="tri-item">
                  <span class="tri-label">Chassis Number</span>
                  <span class="tri-val font-mono">${driver?.chassis_no || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Official Signatures Row -->
            <div class="signature-row">
              <div class="sig-block">
                <div class="sig-line"></div>
                <span class="sig-title">Driver's Signature</span>
              </div>
              <div class="sig-block">
                <div class="sig-line"></div>
                <span class="sig-title">TMPSD Officer / Approved</span>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="right-col">
            <div class="portal-header">
              <div class="portal-title">Passenger Verification & Rating</div>
            </div>

            <div class="qr-section">
              <div class="qr-box-wrapper">
                <div class="corner-tl"></div>
                <div class="corner-tr"></div>
                <div class="corner-bl"></div>
                <div class="corner-br"></div>
                <div class="qr-box">
                  ${qrContent}
                </div>
              </div>

              <div class="qr-rating-badge">
                ★ ★ ★ ★ ★
              </div>

              <div class="qr-text">
                <div class="scan-label">Scan to Rate This Driver</div>
                <div class="scan-desc">Point your smartphone camera to rate courteous service and help improve Palayan City transport.</div>
              </div>
            </div>

            <div class="complaint-notice">
              <div class="notice-title">📋 Passenger Rights & Assistance</div>
              <div class="notice-text">
                For complaints, overcharging, or lost items, scan the QR code above or visit the 
                <strong>TMPSD Office, Palayan City Hall</strong>.<br/>
                <strong>Hotline:</strong> (044) 940-0029
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="footer-left">Tricycle Driver Rating System &copy; ${currentYear} &mdash; TMPSD Palayan City</div>
          <div class="footer-right">Valid Transport Credential</div>
        </div>
      </div>
      
      <!-- User requested print size and paper note -->
      <div class="print-note">
        🖨️ <strong>Print Settings:</strong> Paper size: <strong>Legal (8.5" × 14")</strong> or <strong>Half-Legal (8.5" × 7")</strong>. Orientation: <strong>Landscape</strong> (or Portrait on full Legal paper). Set printer scale to <strong>100% (Actual Size)</strong>. Card size is exactly <strong>8.5" × 7" inches (Half Legal)</strong>.
      </div>
    </div>
  `
}
