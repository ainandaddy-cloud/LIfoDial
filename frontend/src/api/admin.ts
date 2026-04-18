import { useEffect, useState } from 'react';
import fetchWithAuth from './client';

export function useClinics() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await fetchWithAuth('/admin/clinics');
      setClinics(data);
    } catch (e) {
      console.error('Failed to load clinics:', e);
      // fallback handled if needed elsewhere, or return empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { clinics, loading, reload: load };
}
