import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Docs() {
  return (
    <div className="landing-page" style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0A0A0A',
      color: '#FFFFFF',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>Documentation</h1>
        <p style={{ fontSize: '16px', color: '#A1A1A1', marginBottom: '48px' }}>
          Lifodial API and integration docs — coming soon
        </p>
        
        <div style={{
          backgroundColor: '#111111',
          border: '1px solid #2E2E2E',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px'
        }}>
          Documentation is being prepared. Contact hello@lifodial.com for technical details.
        </div>
        
        <Link to="/" style={{ 
          color: '#3ECF8E', 
          textDecoration: 'none', 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>
    </div>
  );
}
