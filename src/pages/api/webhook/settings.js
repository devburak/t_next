import { refreshMenuCaches } from '../../../lib/refreshMenus';
import { verifySignature } from '../../../lib/webhookSignature';
import { invalidateServerSettingsCache } from '../../../lib/settingsCache';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
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
    // System variable event'i için cache invalidate et
    if (event === 'system.variable.update') {
      invalidateServerSettingsCache();
      console.log(`[Webhook] Settings cache invalidated for event: ${event}`);
    }

    if (typeof event === 'string' && event.startsWith('menu.')) {
      await refreshMenuCaches(res);
      console.log(`[Webhook] Menu caches invalidated for event: ${event}`);
    }

    return res.status(200).json({
      success: true,
      message: `Webhook processed: ${event}`
    });
  } catch {
    return res.status(500).json({ error: 'Webhook could not be processed' });
  }
}
