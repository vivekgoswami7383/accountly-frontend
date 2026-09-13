import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9.5, fontFamily: 'Helvetica', color: '#1A1D1F' },
  businessName: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  muted: { fontSize: 9, color: '#6F767E' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#E6E8EC', marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginBottom: 6 },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F6F7F9', borderRadius: 8, padding: 12, marginBottom: 16 },
  summaryLabel: { fontSize: 8.5, color: '#6F767E', marginBottom: 2 },
  summaryValue: { fontSize: 14, fontWeight: 700 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1A1D1F', paddingVertical: 6, paddingHorizontal: 6, borderRadius: 4 },
  tableHeaderCell: { color: '#FFFFFF', fontSize: 8.5, fontWeight: 700 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#F0F1F3' },
  tableCell: { fontSize: 8.5 },
  colDate: { width: '16%' },
  colDesc: { width: '38%' },
  colDebit: { width: '15%', textAlign: 'right' },
  colCredit: { width: '15%', textAlign: 'right' },
  colBalance: { width: '16%', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 20, left: 28, right: 28, fontSize: 8, color: '#9AA0A6', textAlign: 'center' }
});

export interface LedgerRow {
  date: string;
  label: string;
  note?: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface LedgerDocumentProps {
  businessName: string;
  businessAddress?: string;
  businessGst?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  currentBalance: number;
  balanceLabel: string;
  formatAmount: (value: number) => string;
  rows: LedgerRow[];
  labels: {
    statementTitle: string;
    generatedOn: string;
    currentBalance: string;
    transactions: string;
    date: string;
    description: string;
    debit: string;
    credit: string;
    balance: string;
    footer: string;
  };
}

const LedgerDocument = ({
  businessName,
  businessAddress,
  businessGst,
  customerName,
  customerPhone,
  customerAddress,
  currentBalance,
  balanceLabel,
  formatAmount,
  rows,
  labels
}: LedgerDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.row}>
        <View>
          <Text style={styles.businessName}>{businessName}</Text>
          {businessAddress ? <Text style={styles.muted}>{businessAddress}</Text> : null}
          {businessGst ? <Text style={styles.muted}>GSTIN: {businessGst}</Text> : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 12, fontWeight: 700 }}>{labels.statementTitle}</Text>
          <Text style={styles.muted}>
            {labels.generatedOn} {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View>
          <Text style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{customerName}</Text>
          {customerPhone ? <Text style={styles.muted}>{customerPhone}</Text> : null}
          {customerAddress ? <Text style={styles.muted}>{customerAddress}</Text> : null}
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>{labels.currentBalance}</Text>
          <Text style={styles.summaryValue}>{formatAmount(currentBalance)}</Text>
          <Text style={styles.muted}>{balanceLabel}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.summaryLabel}>{labels.transactions}</Text>
          <Text style={styles.summaryValue}>{rows.length}</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.colDate]}>{labels.date}</Text>
        <Text style={[styles.tableHeaderCell, styles.colDesc]}>{labels.description}</Text>
        <Text style={[styles.tableHeaderCell, styles.colDebit]}>{labels.debit}</Text>
        <Text style={[styles.tableHeaderCell, styles.colCredit]}>{labels.credit}</Text>
        <Text style={[styles.tableHeaderCell, styles.colBalance]}>{labels.balance}</Text>
      </View>

      {rows.map((row, i) => (
        <View style={styles.tableRow} key={i} wrap={false}>
          <Text style={[styles.tableCell, styles.colDate]}>{row.date}</Text>
          <View style={styles.colDesc}>
            <Text style={styles.tableCell}>{row.label}</Text>
            {row.note ? <Text style={[styles.tableCell, styles.muted]}>{row.note}</Text> : null}
          </View>
          <Text style={[styles.tableCell, styles.colDebit]}>{row.debit ? formatAmount(row.debit) : ''}</Text>
          <Text style={[styles.tableCell, styles.colCredit]}>{row.credit ? formatAmount(row.credit) : ''}</Text>
          <Text style={[styles.tableCell, styles.colBalance]}>{formatAmount(row.balance)}</Text>
        </View>
      ))}

      <Text style={styles.footer} fixed>
        {labels.footer}
      </Text>
    </Page>
  </Document>
);

export default LedgerDocument;
