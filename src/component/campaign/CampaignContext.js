import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { getCampaigns, invalidateClientCache, seedClientCampaigns } from '../../lib/campaignCache';

export const CampaignContext = createContext();

export const CampaignProvider = ({ children, initialCampaigns = null }) => {
  const [snapshot, setSnapshot] = useState(() => ({
    source: initialCampaigns,
    data: initialCampaigns || [],
  }));
  const [loading, setLoading] = useState(!Array.isArray(initialCampaigns));
  const requestId = useRef(0);
  const campaigns = snapshot.source === initialCampaigns ? snapshot.data : initialCampaigns || [];
  const invalidatePendingRequests = useCallback(() => {
    requestId.current++;
  }, []);

  const fetchCampaigns = useCallback(
    async (signal, force = false) => {
      const id = ++requestId.current;
      const data = await getCampaigns({ signal, force });
      if (signal?.aborted || id !== requestId.current) return;
      setSnapshot({ source: initialCampaigns, data: Array.isArray(data) ? data : [] });
      setLoading(false);
    },
    [initialCampaigns]
  );

  useEffect(() => {
    const controller = new AbortController();
    if (Array.isArray(initialCampaigns)) seedClientCampaigns(initialCampaigns);
    else fetchCampaigns(controller.signal);

    // SSR page props are authoritative: no polling or focus-based requests.
    return () => {
      controller.abort();
      invalidatePendingRequests();
    };
  }, [initialCampaigns, fetchCampaigns, invalidatePendingRequests]);

  const refreshCampaigns = useCallback(async () => {
    invalidateClientCache();
    await fetchCampaigns(undefined, true);
  }, [fetchCampaigns]);

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        loading: loading && !Array.isArray(initialCampaigns),
        error: null,
        refreshCampaigns,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};
