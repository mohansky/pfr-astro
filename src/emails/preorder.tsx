import * as React from 'react';
import { 
  Html, 
  Head, 
  Body, 
  Container, 
  Section, 
  Text, 
  Heading,
  Hr
} from '@react-email/components';

// Define the props type for the email component
interface PreorderEmailProps {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  selectedProducts: Array<{
    name: string;
    quantity: number;
  }>;
}

// Define the email component
export default function SampleEmail(props: PreorderEmailProps) {
  const {
    fullName,
    email,
    phone,
    address,
    selectedProducts = []
  } = props;

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>New Preorder</Heading>
          
          <Section style={sectionStyle}>
            <Heading as="h2" style={subHeadingStyle}>Customer Information</Heading>
            <table style={tableStyle}>
              <tbody>
                <tr>
                  <td style={labelStyle}>Name:</td>
                  <td>{fullName}</td>
                </tr>
                <tr>
                  <td style={labelStyle}>Email:</td>
                  <td>{email}</td>
                </tr>
                <tr>
                  <td style={labelStyle}>Phone:</td>
                  <td>{phone}</td>
                </tr>
                <tr>
                  <td style={labelStyle}>Address:</td>
                  <td>{address}</td>
                </tr>
              </tbody>
            </table>
          </Section>
          
          <Hr style={hrStyle} />
          
          <Section style={sectionStyle}>
            <Heading as="h2" style={subHeadingStyle}>Products Ordered</Heading>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={headerCellStyle}>Product</th>
                  <th style={headerCellStyle}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((product, index) => (
                  <tr key={index} style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>
                    <td style={cellStyle}>{product.name}</td>
                    <td style={cellStyle}>{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
          
          <Hr style={hrStyle} />
          
          <Text style={footerStyle}>
            This is an automated email sent from your preorder form.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const bodyStyle = {
  margin: '0',
  padding: '0',
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
};

const containerStyle = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
};

const headingStyle = {
  fontSize: '24px',
  lineHeight: '28px',
  margin: '16px 0',
  color: '#333',
  textAlign: 'center' as const
};

const subHeadingStyle = {
  fontSize: '18px',
  lineHeight: '24px',
  margin: '16px 0',
  color: '#333'
};

const sectionStyle = {
  marginBottom: '24px'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse' as const
};

const tableHeaderStyle = {
  backgroundColor: '#f1f5f9'
};

const headerCellStyle = {
  padding: '10px',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#333',
  borderBottom: '2px solid #ddd'
};

const cellStyle = {
  padding: '10px',
  fontSize: '14px',
  color: '#333',
  borderBottom: '1px solid #ddd'
};

const evenRowStyle = {
  backgroundColor: '#ffffff'
};

const oddRowStyle = {
  backgroundColor: '#f9fafb'
};

const labelStyle = {
  fontSize: '14px',
  color: '#666',
  verticalAlign: 'top',
  width: '100px',
  fontWeight: 'bold'
};

const hrStyle = {
  borderColor: '#e2e8f0',
  margin: '20px 0'
};

const footerStyle = {
  fontSize: '12px',
  color: '#666',
  textAlign: 'center' as const,
  margin: '24px 0 0'
};