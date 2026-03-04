import { Typography } from '@mui/material';
function PublishDate({ date }) {
    if (!date) {
      return null;
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    const formattedDate = parsedDate.toLocaleDateString('tr-TR', {
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
