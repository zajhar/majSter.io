import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'

interface QuoteForPdf {
  number: number
  client: {
    firstName: string
    lastName: string
    siteAddress?: string | null
  }
  groups: {
    name: string
    services: {
      name: string
      quantity: number
      unit: string
      pricePerUnit: number
      total: number
    }[]
  }[]
  materials: {
    name: string
    quantity: number
    unit: string
    pricePerUnit: number
    total: number
  }[]
  notesBefore?: string | null
  notesAfter?: string | null
  disclaimer?: string | null
  showDisclaimer: boolean
  total: number
  createdAt: Date
}

export async function generateQuotePdf(quote: QuoteForPdf): Promise<string> {
  const date = new Date(quote.createdAt).toLocaleDateString('pl-PL')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, sans-serif; padding: 40px; color: #1f2937; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
        .header h1 { font-size: 28px; color: #2563eb; }
        .header .number { font-size: 18px; color: #6b7280; margin-top: 8px; }
        .client { margin-bottom: 24px; }
        .client-label { font-size: 12px; color: #6b7280; }
        .client-name { font-size: 18px; font-weight: 600; }
        .client-address { font-size: 14px; color: #6b7280; }
        .date { font-size: 14px; color: #6b7280; margin-top: 4px; }
        .notes { background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .notes-title { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
        .group { margin-bottom: 24px; }
        .group-name { font-size: 16px; font-weight: 600; background: #f3f4f6; padding: 12px; border-radius: 6px; }
        .service { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .service-name { flex: 1; }
        .service-qty { color: #6b7280; margin-right: 16px; }
        .service-total { font-weight: 600; }
        .materials-section { margin-top: 24px; }
        .total-section { margin-top: 32px; padding: 20px; background: #2563eb; color: white; border-radius: 8px; text-align: right; }
        .total-label { font-size: 14px; }
        .total-amount { font-size: 32px; font-weight: 700; }
        .disclaimer { margin-top: 32px; padding: 16px; background: #fef3c7; border-radius: 8px; font-size: 12px; color: #92400e; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>WYCENA</h1>
        <div class="number">#${quote.number}</div>
      </div>

      <div class="client">
        <div class="client-label">Klient</div>
        <div class="client-name">${quote.client.firstName} ${quote.client.lastName}</div>
        ${quote.client.siteAddress ? `<div class="client-address">${quote.client.siteAddress}</div>` : ''}
        <div class="date">Data: ${date}</div>
      </div>

      ${quote.notesBefore ? `
        <div class="notes">
          <div class="notes-title">NOTATKI</div>
          <div>${quote.notesBefore}</div>
        </div>
      ` : ''}

      ${quote.groups.map((group) => `
        <div class="group">
          <div class="group-name">${group.name}</div>
          ${group.services.map((s) => `
            <div class="service">
              <span class="service-name">${s.name}</span>
              <span class="service-qty">${s.quantity} ${s.unit} × ${s.pricePerUnit} zł</span>
              <span class="service-total">${s.total.toFixed(2)} zł</span>
            </div>
          `).join('')}
        </div>
      `).join('')}

      ${quote.materials.length > 0 ? `
        <div class="materials-section">
          <div class="group-name">Materiały</div>
          ${quote.materials.map((m) => `
            <div class="service">
              <span class="service-name">${m.name}</span>
              <span class="service-qty">${m.quantity} ${m.unit} × ${m.pricePerUnit} zł</span>
              <span class="service-total">${m.total.toFixed(2)} zł</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${quote.notesAfter ? `
        <div class="notes">
          <div class="notes-title">UWAGI</div>
          <div>${quote.notesAfter}</div>
        </div>
      ` : ''}

      <div class="total-section">
        <div class="total-label">SUMA</div>
        <div class="total-amount">${quote.total.toFixed(2)} zł</div>
      </div>

      ${quote.showDisclaimer && quote.disclaimer ? `
        <div class="disclaimer">
          <strong>WARUNKI:</strong> ${quote.disclaimer}
        </div>
      ` : ''}

      <div class="footer">
        Wygenerowano w aplikacji Majsterio
      </div>
    </body>
    </html>
  `

  const { uri } = await Print.printToFileAsync({ html })
  return uri
}

export async function shareQuotePdf(pdfUri: string, quoteNumber: number): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync()
  if (!isAvailable) {
    throw new Error('Udostępnianie nie jest dostępne na tym urządzeniu')
  }

  // Copy to a proper filename
  const filename = `wycena-${quoteNumber}.pdf`
  const newUri = `${FileSystem.cacheDirectory}${filename}`
  await FileSystem.copyAsync({ from: pdfUri, to: newUri })

  await Sharing.shareAsync(newUri, {
    mimeType: 'application/pdf',
    dialogTitle: `Wycena #${quoteNumber}`,
  })
}
