import { getServerMainMenu } from '../../../lib/mainMenuCache';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const menu = await getServerMainMenu();

    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');

    return res.status(200).json({
      success: true,
      slug: menu?.slug || null,
      updatedAt: menu?.updatedAt || null,
      items: Array.isArray(menu?.items) ? menu.items : [],
    });
  } catch (error) {
    console.error('[MainMenuAPI] Failed to load main menu:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load main menu',
    });
  }
}
