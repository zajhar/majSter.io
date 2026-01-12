import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  quoteNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  clientInfo: {
    marginBottom: 20,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientAddress: {
    fontSize: 11,
    color: '#6b7280',
  },
  date: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    padding: 8,
    marginBottom: 10,
  },
  notes: {
    fontSize: 10,
    color: '#374151',
    padding: 10,
    backgroundColor: '#fefce8',
    marginBottom: 15,
  },
  groupHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#dbeafe',
    padding: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  groupM2: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 8,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  colName: {
    flex: 3,
  },
  colQty: {
    flex: 1,
    textAlign: 'right',
  },
  colUnit: {
    flex: 1,
    textAlign: 'center',
  },
  colPrice: {
    flex: 1,
    textAlign: 'right',
  },
  colTotal: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 20,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  disclaimer: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  disclaimerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
})
