import { getServerRightMenu } from '../../../lib/rightMenuCache';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const menu = await getServerRightMenu();

    if (!menu) throw new Error('Menu unavailable');

    return res.status(200).json({
      success: true,
      slug: menu?.slug || null,
      updatedAt: menu?.updatedAt || null,
      items: Array.isArray(menu?.items) ? menu.items : [],
    });
  } catch (error) {
    console.error('[RightMenuAPI] Failed to load right menu:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load right menu',
    });
  }
}
