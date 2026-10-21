import { verifySignature } from '../../lib/webhookSignature';
import { invalidateServerCache } from '../../lib/campaignCache';
import { invalidateServerMainMenuCache } from '../../lib/mainMenuCache';
import { invalidateServerRightMenuCache } from '../../lib/rightMenuCache';
import { invalidateServerSettingsCache } from '../../lib/settingsCache';

export default async function handler(req, res) {
  // Sadece POST kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-cms-signature'];
  const event = req.headers['x-cms-event'];
  const payload = req.body;

  // İmza doğrulama
  if (!verifySignature(payload, signature)) {
    console.error('[Webhook] Invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  console.log(`[Webhook] Received event: ${event}`);

  try {
    // Event türüne göre cache invalidate et
    if (event && event.startsWith('campaign.')) {
      invalidateServerCache();
      console.log(`[Webhook] Campaign cache invalidated for event: ${event}`);
    }

    if (event === 'system.variable.update') {
      invalidateServerSettingsCache();
      console.log(`[Webhook] Settings cache invalidated for event: ${event}`);
    }

    if (event && event.startsWith('menu.')) {
      invalidateServerMainMenuCache();
      invalidateServerRightMenuCache();
      console.log(`[Webhook] Menu caches invalidated for event: ${event}`);
    }

    // Content events için de eklenebilir
    if (event && event.startsWith('content.')) {
      console.log(`[Webhook] Content event received: ${event}`);
      // İleride content cache eklenebilir
    }

    return res.status(200).json({ 
      success: true, 
      message: `Webhook processed: ${event}` 
    });
  } catch (error) {
    console.error('[Webhook] Processing error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
