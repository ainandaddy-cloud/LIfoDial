/**
 * AgentRouteGuard.tsx
 * Blocks clinic admins from accessing /agents directly.
 * Agent setup pending — will be enabled later.
 * To enable: remove this guard from App.tsx and set CLINIC_AGENT_NAV_ENABLED = true in Layout.tsx
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AgentRouteGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Show a toast-style alert and redirect to dashboard
    const toast = document.createElement('div');
    toast.textContent = '🔒 Agent module coming soon';
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: #1A1A1A; border: 1px solid #f59e0b40; color: #f59e0b;
      padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4); animation: slideInRight 0.2s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null;
}
