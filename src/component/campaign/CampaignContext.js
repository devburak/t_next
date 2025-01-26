// components/CampaignContext.js

import React, { createContext, useState, useEffect } from 'react';

export const CampaignContext = createContext();

export const CampaignProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/campaigns/active`);
        if (!response.ok) throw new Error('Failed to fetch campaigns');
        const data = await response.json();

        // Filter campaigns that are active and should be displayed on home or detail pages
        const filteredCampaigns = data.filter(
          (campaign) => campaign.isActive && (campaign.displayOnHome || campaign.displayOnDetail)
        );

        setCampaigns(filteredCampaigns);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <CampaignContext.Provider value={{ campaigns, loading, error }}>
      {children}
    </CampaignContext.Provider>
  );
};
