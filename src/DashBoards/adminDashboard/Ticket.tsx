// TicketDocument.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#f9f9f9',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  companyName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3e64ff',
  },
  title: {
    fontSize: 20,
    marginTop: 5,
    marginBottom: 20,
    color: '#333',
  },
  ticketContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 20,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    color: '#000',
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginVertical: 12,
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 12,
    color: '#444',
  },
});

interface TicketDocumentProps {
  payment: {
    transactionId: string;
    bookingId: string;
    amount: number;
    paymentStatus: string;
    paymentMethod?: string;
    paymentDate: string;
  };
  customerName: string;
  eventName: string;
}

const TicketDocument: React.FC<TicketDocumentProps> = ({ payment, customerName, eventName }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>🎫 TicketStream Events</Text>
        <Text style={styles.title}>Event Ticket Confirmation</Text>
      </View>

      <View style={styles.ticketContainer}>
        <View style={styles.section}>
          <Text><Text style={styles.label}>Event:</Text> <Text style={styles.value}>{eventName}</Text></Text>
        </View>
        <View style={styles.section}>
          <Text><Text style={styles.label}>Name:</Text> <Text style={styles.value}>{customerName}</Text></Text>
        </View>
        <View style={styles.section}>
          <Text><Text style={styles.label}>Transaction ID:</Text> <Text style={styles.value}>{payment.transactionId}</Text></Text>
        </View>
        <View style={styles.section}>
          <Text><Text style={styles.label}>Booking ID:</Text> <Text style={styles.value}>{payment.bookingId}</Text></Text>
        </View>
        <View style={styles.section}>
          <Text><Text style={styles.label}>Amount:</Text> <Text style={styles.value}>${(Number(payment.amount) / 100).toFixed(2)}</Text></Text>
        </View>
        <View style={styles.section}>
          <Text><Text style={styles.label}>Status:</Text> <Text style={styles.value}>{payment.paymentStatus}</Text></Text>
        </View>
        <View style={styles.section}>
          <Text><Text style={styles.label}>Payment Method:</Text> <Text style={styles.value}>{payment.paymentMethod || 'N/A'}</Text></Text>
        </View>
        <View style={styles.section}>
          <Text><Text style={styles.label}>Date:</Text> <Text style={styles.value}>{new Date(payment.paymentDate).toLocaleString()}</Text></Text>
        </View>
      </View>

      <View style={styles.hr} />

      <Text style={styles.footer}>
        ✅ Thank you for choosing TicketStream Events. Enjoy your event!
      </Text>
    </Page>
  </Document>
);

export default TicketDocument;
