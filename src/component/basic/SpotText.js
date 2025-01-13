import { Typography } from '@mui/material';
function SpotText({ text }) {
    if (!text) return null;
  
    return (
      <Typography variant="h6" component="p" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
        {text}
      </Typography>
    );
  }

export default SpotText;