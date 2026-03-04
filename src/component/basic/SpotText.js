import { Typography } from '@mui/material';

const SPOT_TEXT_SX = {
  fontWeight: 'bold',
  marginBottom: '20px',
  fontSize: {
    xs: '1.1rem',
    md: '1.04rem',
  },
  lineHeight: {
    xs: 1.2,
    md: 1.2,
  },
};

function SpotText({ text }) {
    if (!text) return null;
  
    return (
      <Typography variant="h6" component="p" sx={SPOT_TEXT_SX}>
        {text}
      </Typography>
    );
  }

export default SpotText;
