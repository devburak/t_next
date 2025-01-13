export default function CalendarSubscription() {
    // Mevcut yılı al
    const currentYear = new Date().getFullYear();
  
    // Dinamik başlangıç ve bitiş tarihleri
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;
  
    return (
      <div style={{ marginTop: '2rem' }}>

        <h3>Takvim Abonelik:</h3>
        <hr />
        <a href={`/api/events/ics?startDate=${startDate}&endDate=${endDate}`} target="_blank" style={{color: 'blue' , fontSize: '.8rem'}}>
          {currentYear} yılı etkinliklerini indir (ICS)
        </a>
      </div>
    );
  }
  