export const CAMPAIGN_PLACEMENTS = ['banner', 'left_menu', 'footer', 'popup'];
export function campaignPages(campaign) {
  if (Array.isArray(campaign?.targetPages) && campaign.targetPages.length)
    return campaign.targetPages;
  return [campaign?.displayOnHome && 'home', campaign?.displayOnDetail && 'detail'].filter(Boolean);
}
export function selectCampaigns(items, { pageType = 'all', placement } = {}) {
  if (placement && !CAMPAIGN_PLACEMENTS.includes(placement)) return [];
  return (Array.isArray(items) ? items : [])
    .filter((campaign) => {
      if (campaign?.isActive !== true) return false;
      const pages = campaignPages(campaign);
      return (
        (pages.includes('all') || pages.includes(pageType)) &&
        (!placement || (campaign.placement || 'banner') === placement)
      );
    })
    .sort((a, b) => (Number(a.priority) || 0) - (Number(b.priority) || 0));
}
export function canShowPopup(campaign, browser, now = Date.now()) {
  if (!browser || !campaign) return false;
  const frequency = campaign.popupFrequency || 'every_login',
    key = `campaign_popup_${campaign._id}`;
  try {
    if (frequency === 'once') return browser.localStorage.getItem(key) !== 'shown';
    if (frequency === 'daily') {
      const last = Number(browser.localStorage.getItem(key) || 0);
      return !last || now - last >= 86_400_000;
    }
    return browser.sessionStorage.getItem(key) !== 'shown';
  } catch {
    return true;
  }
}
export function markPopupAsShown(campaign, browser, now = Date.now()) {
  if (!browser || !campaign) return;
  const frequency = campaign.popupFrequency || 'every_login',
    key = `campaign_popup_${campaign._id}`;
  try {
    if (frequency === 'daily') browser.localStorage.setItem(key, String(now));
    else if (frequency === 'once') browser.localStorage.setItem(key, 'shown');
    else browser.sessionStorage.setItem(key, 'shown');
  } catch {
    /* The hook also remembers dismissal for this mounted placement. */
  }
}
