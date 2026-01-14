import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { styles } from './styles.js'
import { DEFAULT_DISCLAIMER } from '@majsterio/shared'

interface Client {
  firstName: string
  lastName: string
  siteAddress?: string | null
}

interface Service {
  name: string
  quantity: string
  unit: string
  pricePerUnit: string
  total: string
}

interface Group {
  name: string
  wallsM2?: string | null
  ceilingM2?: string | null
  floorM2?: string | null
  services: Service[]
}

interface Material {
  name: string
  quantity: string
  unit: string
  pricePerUnit: string
  total: string
}

interface QuoteData {
  number: number
  total: string
  notesBefore?: string | null
  notesAfter?: string | null
  disclaimer?: string | null
  showDisclaimer: boolean
  createdAt: Date
  client: Client | null
  groups: Group[]
  materials: Material[]
}

interface Props {
  quote: QuoteData
  isPro?: boolean
}

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function QuotePdfTemplate({ quote, isPro = false }: Props) {
  const disclaimerText = quote.disclaimer ?? DEFAULT_DISCLAIMER

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Majsterio</Text>
          <Text style={styles.quoteNumber}>WYCENA #{quote.number}</Text>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>
            {quote.client
              ? `${quote.client.firstName} ${quote.client.lastName}`
              : '---'}
          </Text>
          {quote.client?.siteAddress ? (
            <Text style={styles.clientAddress}>{quote.client.siteAddress}</Text>
          ) : (
            <Text style={styles.clientAddress}>---</Text>
          )}
          <Text style={styles.date}>Data: {formatDate(quote.createdAt)}</Text>
        </View>

        {/* Notes Before */}
        {quote.notesBefore && (
          <View style={styles.section}>
            <Text style={styles.notes}>{quote.notesBefore}</Text>
          </View>
        )}

        {/* Groups with Services */}
        {quote.groups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <View style={styles.groupHeader}>
              <Text>
                {group.name}
                {group.floorM2 && (
                  <Text style={styles.groupM2}> ({formatCurrency(group.floorM2)} m²)</Text>
                )}
              </Text>
            </View>

            {/* Services Table */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colName, styles.headerText]}>Usługa</Text>
                <Text style={[styles.colQty, styles.headerText]}>Ilość</Text>
                <Text style={[styles.colUnit, styles.headerText]}>J.m.</Text>
                <Text style={[styles.colPrice, styles.headerText]}>Cena</Text>
                <Text style={[styles.colTotal, styles.headerText]}>Wartość</Text>
              </View>

              {group.services.map((service, serviceIndex) => (
                <View key={serviceIndex} style={styles.tableRow}>
                  <Text style={styles.colName}>{service.name}</Text>
                  <Text style={styles.colQty}>{formatCurrency(service.quantity)}</Text>
                  <Text style={styles.colUnit}>{service.unit}</Text>
                  <Text style={styles.colPrice}>{formatCurrency(service.pricePerUnit)} zł</Text>
                  <Text style={styles.colTotal}>{formatCurrency(service.total)} zł</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Materials */}
        {quote.materials.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MATERIAŁY</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colName, styles.headerText]}>Materiał</Text>
                <Text style={[styles.colQty, styles.headerText]}>Ilość</Text>
                <Text style={[styles.colUnit, styles.headerText]}>J.m.</Text>
                <Text style={[styles.colPrice, styles.headerText]}>Cena</Text>
                <Text style={[styles.colTotal, styles.headerText]}>Wartość</Text>
              </View>

              {quote.materials.map((material, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.colName}>{material.name}</Text>
                  <Text style={styles.colQty}>{formatCurrency(material.quantity)}</Text>
                  <Text style={styles.colUnit}>{material.unit}</Text>
                  <Text style={styles.colPrice}>{formatCurrency(material.pricePerUnit)} zł</Text>
                  <Text style={styles.colTotal}>{formatCurrency(material.total)} zł</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>SUMA:</Text>
          <Text style={styles.totalValue}>{formatCurrency(quote.total)} zł</Text>
        </View>

        {/* Notes After */}
        {quote.notesAfter && (
          <View style={styles.section}>
            <Text style={styles.notes}>{quote.notesAfter}</Text>
          </View>
        )}

        {/* Disclaimer */}
        {quote.showDisclaimer && (
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerTitle}>WARUNKI:</Text>
            <Text style={styles.disclaimerText}>{disclaimerText}</Text>
          </View>
        )}

        {/* Footer */}
        {!isPro && (
          <Text style={styles.footer}>
            Wygenerowano w Majsterio (darmowa wersja) • majsterio.pl
          </Text>
        )}
      </Page>
    </Document>
  )
}
