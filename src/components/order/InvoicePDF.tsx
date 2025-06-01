import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Order } from '../../types';

// Register a font that supports the Indian rupee symbol
Font.register({
    family: 'NotoSans',
    fonts: [
      { src: '/fonts/NotoSans-Regular.ttf', fontWeight: 'normal' },
      { src: '/fonts/NotoSans-Bold.ttf', fontWeight: 'bold' },
    ],
  });

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return '\u20B9' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

// Helper to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Modern, clean, professional invoice redesign
const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 32,
    fontFamily: 'NotoSans',
    fontSize: 10,
    color: '#222',
    backgroundColor: '#f7f9fa',
  },
  headerBar: {
    backgroundColor: '#f3f6fb',
    borderRadius: 12,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1a237e',
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
  },
  companyInfo: {
    flexDirection: 'column',
    gap: 2,
  },
  companyName: {
    color: '#1a237e',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'NotoSans',
    letterSpacing: 1,
    marginBottom: 2,
  },
  companyContact: {
    color: '#3b4252',
    fontSize: 10,
    marginBottom: 1,
  },
  invoiceInfo: {
    alignItems: 'flex-end',
    gap: 2,
  },
  invoiceTitle: {
    color: '#1a237e',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'NotoSans',
    marginBottom: 2,
  },
  orderInfo: {
    color: '#222',
    fontSize: 10,
    fontFamily: 'NotoSans',
    marginBottom: 1,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ef',
    marginVertical: 12,
  },
  infoSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e7ef',
    marginBottom: 0,
    boxShadow: '0 1px 4px #e3e3e3',
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
    fontFamily: 'NotoSans',
  },
  infoText: {
    fontSize: 10,
    color: '#222',
    marginBottom: 2,
    fontFamily: 'NotoSans',
  },
  paymentSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  paymentCard: {
    backgroundColor: '#f3f6fb',
    borderRadius: 10,
    padding: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e7ef',
    marginBottom: 0,
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
    fontFamily: 'NotoSans',
  },
  paymentText: {
    fontSize: 10,
    color: '#222',
    marginBottom: 2,
    fontFamily: 'NotoSans',
  },
  table: {
    marginTop: 8,
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 0,
    borderWidth: 1,
    borderColor: '#e0e7ef',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8f0fe',
    borderBottomWidth: 1,
    borderBottomColor: '#1a237e',
    paddingVertical: 8,
    fontWeight: 'bold',
    fontFamily: 'NotoSans',
    color: '#1a237e',
    fontSize: 11,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ef',
    paddingVertical: 7,
    backgroundColor: '#fff',
    alignItems: 'center',
    minHeight: 24,
  },
  tableRowAlt: {
    backgroundColor: '#f7f9fa',
    alignItems: 'center',
    minHeight: 24,
  },
  tableColNo: { width: '6%', flexShrink: 0, justifyContent: 'center', alignItems: 'center' },
  tableColDesc: { width: '44%', flexShrink: 1, paddingRight: 4, minHeight: 16, justifyContent: 'center', alignItems: 'flex-start' },
  tableColPrice: { width: '15%', justifyContent: 'center', alignItems: 'flex-end', flexShrink: 0 },
  tableColQty: { width: '10%', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  tableColTotal: { width: '25%', justifyContent: 'center', alignItems: 'flex-end', flexShrink: 0 },
  itemName: { fontWeight: 'bold', fontFamily: 'NotoSans', fontSize: 10 },
  summarySection: {
    marginTop: 10,
    alignItems: 'flex-end',
    backgroundColor: '#f3f6fb',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e7ef',
    marginBottom: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    fontSize: 11,
  },
  summaryLabel: {
    width: 100,
    color: '#1a237e',
    fontWeight: 'bold',
  },
  summaryValue: {
    width: 100,
    textAlign: 'right',
    color: '#222',
  },
  summaryDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1a237e',
    width: 200,
    marginVertical: 8,
  },
  thankYou: {
    marginTop: 18,
    textAlign: 'center',
    color: '#1a237e',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 18,
    color: '#888',
    fontSize: 9,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e7ef',
    paddingTop: 10,
  },
  termsTitle: {
    fontWeight: 'bold',
    fontFamily: 'NotoSans',
    marginBottom: 5,
    color: '#1a237e',
  },
  termsText: {
    fontSize: 9,
    color: '#444444',
    lineHeight: 1.5,
    fontFamily: 'NotoSans',
  },
});

interface InvoicePDFProps {
  order: Order;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ order }) => {
  const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  // Unify shipping fee logic with checkout page
  const FREE_SHIPPING_THRESHOLD = 1499;
  const SHIPPING_FEE = 99;
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = typeof order.payment_details?.shipping_fee === 'number' && !isNaN(order.payment_details.shipping_fee)
    ? order.payment_details.shipping_fee
    : (qualifiesForFreeShipping ? 0 : SHIPPING_FEE);
  const address = order.shipping_address;
  const userEmail = order.email || 'N/A';
  const userPhone = address?.phone || 'N/A';
  const paymentMethod = order.payment_details?.method === 'razorpay' ? 'Razorpay' : 'Cash on Delivery';
  const paymentStatus = order.payment_details?.status === 'paid' ? 'Paid' : (order.payment_details?.method === 'cod' ? 'Pay on Delivery' : 'Pending');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.logoBox}>
            <Image src="https://i.postimg.cc/sDjx6nv8/Logo-Phytronix.png" style={styles.logo} />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>PHYTRONIX</Text>
              <Text style={styles.companyContact}>Phone: +91-9876543210</Text>
              <Text style={styles.companyContact}>Email: support@phytronix.com</Text>
            </View>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.orderInfo}>Order ID: #{order.id.substring(0, 8)}</Text>
            <Text style={styles.orderInfo}>Order Date: {formatDate(order.created_at)}</Text>
          </View>
        </View>

        {/* Info Row: Customer & Shipping */}
        <View style={styles.infoSection}>
          {/* Customer Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Customer Information</Text>
            <Text style={styles.infoText}>Name: {address?.full_name || 'N/A'}</Text>
            <Text style={styles.infoText}>Email: {userEmail}</Text>
            <Text style={styles.infoText}>Phone: {userPhone}</Text>
          </View>
          {/* Shipping Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Shipping Address</Text>
            <Text style={styles.infoText}>{address?.full_name || 'N/A'}</Text>
            <Text style={styles.infoText}>{address?.street || ''}</Text>
            <Text style={styles.infoText}>{address ? `${address.city}, ${address.state} ${address.postal_code}` : ''}</Text>
            <Text style={styles.infoText}>{address?.country || ''}</Text>
            {address?.phone && <Text style={styles.infoText}>Phone: {address.phone}</Text>}
          </View>
        </View>

        {/* Payment Info (reduce margin below to remove empty space) */}
        <View style={styles.paymentSection}>
          <View style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>Payment Information</Text>
            <Text style={styles.paymentText}>Method: {paymentMethod}</Text>
            <Text style={styles.paymentText}>Status: {paymentStatus}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColNo, {textAlign: 'center'}]}>NO</Text>
            <Text style={[styles.tableColDesc, {textAlign: 'left'}]}>ITEM DESCRIPTION</Text>
            <Text style={[styles.tableColPrice, {textAlign: 'right'}]}>PRICE</Text>
            <Text style={[styles.tableColQty, {textAlign: 'center'}]}>QTY</Text>
            <Text style={[styles.tableColTotal, {textAlign: 'right'}]}>TOTAL</Text>
          </View>
          {order.items?.map((item, index) => (
            <View key={index} style={[styles.tableRow, ...(index % 2 !== 0 ? [styles.tableRowAlt] : [])]}>
              <View style={styles.tableColNo}><Text style={{textAlign: 'center'}}>{index + 1}</Text></View>
              <View style={styles.tableColDesc}>
                <Text style={{textAlign: 'left'}}>
                  {item.product && item.product.name
                    ? (item.product.name.length > 60
                        ? item.product.name.slice(0, 57) + '...'
                        : item.product.name)
                    : 'Product Name'}
                </Text>
              </View>
              <View style={styles.tableColPrice}><Text style={{textAlign: 'right'}} wrap={false}>{'\u20B9'}{item.price.toLocaleString('en-IN')}</Text></View>
              <View style={styles.tableColQty}><Text style={{textAlign: 'center'}} wrap={false}>{item.quantity}</Text></View>
              <View style={styles.tableColTotal}><Text style={{textAlign: 'right'}} wrap={false}>{'\u20B9'}{(item.price * item.quantity).toLocaleString('en-IN')}</Text></View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{'\u20B9'}{subtotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping Fee</Text>
            <Text style={styles.summaryValue}>{shippingFee === 0 ? 'Free' : '\u20B9' + shippingFee.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={[styles.summaryValue, { fontFamily: 'NotoSans', fontWeight: 'bold', color: '#1a237e' }]}>{'\u20B9'}{(subtotal + shippingFee).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Thank You Note */}
        <Text style={styles.thankYou}>Thank you for your business!</Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.termsTitle}>Terms and Conditions:</Text>
          <Text style={styles.termsText}>This invoice has been generated electronically and is valid without signature.</Text>
          <Text style={styles.termsText}>All purchases are subject to our standard terms and conditions of sale.</Text>
          <Text style={styles.termsText}>For returns and warranty information, please visit our website or contact customer support.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF; 