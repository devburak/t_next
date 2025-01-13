import { Typography } from '@mui/material';
function PublishDate({ date }) {
    const formattedDate = new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  
    return (
      <Typography variant="body2" align="right" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
        {formattedDate}
      </Typography>
    );
  }

  export default PublishDate;