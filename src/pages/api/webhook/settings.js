import { verifySignature } from '../../../lib/webhookSignature';
import { invalidateServerMainMenuCache } from '../../../lib/mainMenuCache';
import { invalidateServerRightMenuCache } from '../../../lib/rightMenuCache';
import { invalidateServerSettingsCache } from '../../../lib/settingsCache';

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

  // System variable event'i için cache invalidate et
  if (event === 'system.variable.update') {
    invalidateServerSettingsCache();
    console.log(`[Webhook] Settings cache invalidated for event: ${event}`);
  }

  if (event && event.startsWith('menu.')) {
    invalidateServerMainMenuCache();
    invalidateServerRightMenuCache();
    console.log(`[Webhook] Menu caches invalidated for event: ${event}`);
  }

  return res.status(200).json({ 
    success: true, 
    message: `Webhook processed: ${event}` 
  });
}
