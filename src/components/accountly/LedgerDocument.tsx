import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

const COLORS = {
  red: '#E23744',
  redDeep: '#C4303B',
  green: '#1FA971',
  greenDeep: '#178A5C',
  ink: '#1A1D1F',
  grey: '#6F767E',
  greyLight: '#9AA0A6',
  line: '#EFF1F3',
  bg: '#F7F8FA',
  white: '#FFFFFF'
};

const styles = StyleSheet.create({
  page: { paddingTop: 0, paddingBottom: 48, paddingHorizontal: 32, fontSize: 9.5, fontFamily: 'Helvetica', color: COLORS.ink },
  accentBar: { height: 6, backgroundColor: COLORS.red, marginBottom: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  businessName: { fontSize: 19, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  muted: { fontSize: 9, color: COLORS.grey, lineHeight: 1.5 },
  statementTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: COLORS.red, letterSpacing: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: COLORS.line, marginTop: 18, marginBottom: 18 },
  eyebrow: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: COLORS.greyLight, letterSpacing: 1, marginBottom: 5 },
  customerName: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 24,
    overflow: 'hidden'
  },
  summaryHalf: { flex: 1, paddingVertical: 16, paddingHorizontal: 18 },
  summaryDivider: { width: 1, backgroundColor: COLORS.line },
  summaryLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: COLORS.greyLight, letterSpacing: 0.5, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.ink, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6 },
  tableHeaderCell: { color: COLORS.white, fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  tableRowAlt: { backgroundColor: COLORS.bg },
  tableCell: { fontSize: 9 },
  tableCellNote: { fontSize: 8, color: COLORS.grey, marginTop: 1.5 },
  colDate: { width: '15%' },
  colDesc: { width: '37%' },
  colDebit: { width: '15%', textAlign: 'right' },
  colCredit: { width: '15%', textAlign: 'right' },
  colBalance: { width: '18%', textAlign: 'right' },
  amountDebit: { color: COLORS.redDeep, fontFamily: 'Helvetica-Bold' },
  amountCredit: { color: COLORS.greenDeep, fontFamily: 'Helvetica-Bold' },
  amountBalance: { fontFamily: 'Helvetica-Bold' },
  footer: { position: 'absolute', bottom: 22, left: 32, right: 32, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.line, paddingTop: 10 },
  footerText: { fontSize: 8, color: COLORS.greyLight }
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
  balanceTone: 'get' | 'give';
  formatAmount: (value: number) => string;
  rows: LedgerRow[];
  labels: {
    statementTitle: string;
    generatedOn: string;
    billTo: string;
    currentBalance: string;
    transactions: string;
    date: string;
    description: string;
    debit: string;
    credit: string;
    balance: string;
    footer: string;
    page: string;
    of: string;
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
  balanceTone,
  formatAmount,
  rows,
  labels
}: LedgerDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.accentBar} fixed />

      <View style={styles.header}>
        <View>
          <Text style={styles.businessName}>{businessName}</Text>
          {businessAddress ? <Text style={styles.muted}>{businessAddress}</Text> : null}
          {businessGst ? <Text style={styles.muted}>GSTIN: {businessGst}</Text> : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.statementTitle}>{labels.statementTitle.toUpperCase()}</Text>
          <Text style={[styles.muted, { marginTop: 4 }]}>
            {labels.generatedOn} {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View>
        <Text style={styles.eyebrow}>{labels.billTo.toUpperCase()}</Text>
        <Text style={styles.customerName}>{customerName}</Text>
        {customerPhone ? <Text style={styles.muted}>{customerPhone}</Text> : null}
        {customerAddress ? <Text style={styles.muted}>{customerAddress}</Text> : null}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHalf}>
          <Text style={styles.summaryLabel}>{labels.currentBalance.toUpperCase()}</Text>
          <Text style={[styles.summaryValue, { color: balanceTone === 'get' ? COLORS.greenDeep : COLORS.redDeep }]}>
            {formatAmount(currentBalance)}
          </Text>
          <Text style={styles.muted}>{balanceLabel}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={[styles.summaryHalf, { alignItems: 'flex-end' }]}>
          <Text style={styles.summaryLabel}>{labels.transactions.toUpperCase()}</Text>
          <Text style={styles.summaryValue}>{rows.length}</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.colDate]}>{labels.date.toUpperCase()}</Text>
        <Text style={[styles.tableHeaderCell, styles.colDesc]}>{labels.description.toUpperCase()}</Text>
        <Text style={[styles.tableHeaderCell, styles.colDebit]}>{labels.debit.toUpperCase()}</Text>
        <Text style={[styles.tableHeaderCell, styles.colCredit]}>{labels.credit.toUpperCase()}</Text>
        <Text style={[styles.tableHeaderCell, styles.colBalance]}>{labels.balance.toUpperCase()}</Text>
      </View>

      {rows.map((row, i) => (
        <View style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]} key={i} wrap={false}>
          <Text style={[styles.tableCell, styles.colDate]}>{row.date}</Text>
          <View style={styles.colDesc}>
            <Text style={styles.tableCell}>{row.label}</Text>
            {row.note ? <Text style={styles.tableCellNote}>{row.note}</Text> : null}
          </View>
          <Text style={[styles.tableCell, styles.colDebit, row.debit ? styles.amountDebit : {}]}>
            {row.debit ? formatAmount(row.debit) : '—'}
          </Text>
          <Text style={[styles.tableCell, styles.colCredit, row.credit ? styles.amountCredit : {}]}>
            {row.credit ? formatAmount(row.credit) : '—'}
          </Text>
          <Text style={[styles.tableCell, styles.colBalance, styles.amountBalance]}>{formatAmount(row.balance)}</Text>
        </View>
      ))}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{labels.footer}</Text>
        <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${labels.page} ${pageNumber} ${labels.of} ${totalPages}`} />
      </View>
    </Page>
  </Document>
);

export default LedgerDocument;
