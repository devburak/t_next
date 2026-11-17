import { useCallback, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import { CampaignContext } from './CampaignContext';
import { selectCampaigns, canShowPopup, markPopupAsShown } from '../../lib/campaignPlacements.mjs';
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// Reads the page's campaign data. This hook never starts a request or a timer.
export default function useCampaigns({ pageType = 'all', placement } = {}) {
  const context = useContext(CampaignContext);
  if (!context) throw new Error('useCampaigns requires CampaignProvider');
  const [dismissed, setDismissed] = useState([]);
  const placementKey = `${pageType}:${placement || 'all'}`;
  const browserReady = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const campaigns = useMemo(
    () => selectCampaigns(context.campaigns, { pageType, placement }),
    [context.campaigns, pageType, placement]
  );
  const popupCampaign =
    browserReady && !dismissed.includes(placementKey)
      ? campaigns.find((item) => item.placement === 'popup' && canShowPopup(item, window)) || null
      : null;
  const dismissPopup = useCallback(() => {
    if (!popupCampaign) return;
    markPopupAsShown(popupCampaign, window);
    setDismissed((items) => [...items, placementKey]);
  }, [popupCampaign, placementKey]);
  return { ...context, campaigns, popupCampaign, dismissPopup };
}
