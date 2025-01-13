

export default async function handler(req, res) {
  try {
    const { startDate, endDate } = req.query;

    // Backend'deki API'ye istekte bulun
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/ics`;
    const response = await fetch(`${backendUrl}?startDate=${startDate}&endDate=${endDate}`, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error(`Backend API Hatası: ${response.statusText}`);
      }
  
      // ICS dosyasını al
      const icsData = await response.text();

    // ICS dosyasını frontend'e yönlendir
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename=events.ics');
    res.status(200).send(icsData);
  } catch (error) {
    console.error('ICS Proxy Error:', error.message);
    res.status(500).json({ message: 'ICS dosyası alınamadı', error: error.message });
  }
}
