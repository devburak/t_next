// components/CampaignContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getCampaigns, invalidateClientCache } from '../../lib/campaignCache';

export const CampaignContext = createContext();

export const CampaignProvider = ({ children, initialCampaigns = null }) => {
  const [campaigns, setCampaigns] = useState(initialCampaigns || []);
  const [loading, setLoading] = useState(!initialCampaigns);
  const [error, setError] = useState(null);

  const fetchCampaigns = useCallback(async (signal) => {
    try {
      setLoading(true);
      const data = await getCampaigns({ signal });

      if (signal?.aborted) {
        return;
      }

      setCampaigns(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      if (err?.name === 'AbortError' || signal?.aborted) {
        return;
      }
      console.error('Error fetching campaigns:', err);
      setError(err.message);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Server-side'dan gelen initial data yoksa client'ta fetch et
  useEffect(() => {
    const controller = new AbortController();

    if (!initialCampaigns) {
      fetchCampaigns(controller.signal);
    }

    return () => {
      controller.abort();
    };
  }, [initialCampaigns, fetchCampaigns]);

  // Cache'i invalidate edip yeniden fetch et (webhook sonrası kullanılabilir)
  const refreshCampaigns = useCallback(async () => {
    invalidateClientCache();
    await fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <CampaignContext.Provider value={{ campaigns, loading, error, refreshCampaigns }}>
      {children}
    </CampaignContext.Provider>
  );
};
