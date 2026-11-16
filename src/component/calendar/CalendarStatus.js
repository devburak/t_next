import { Alert, Box, Button, Skeleton } from '@mui/material';
export default function CalendarStatus({ loading, error, onRetry, compact = false }) {
  if (loading && compact)
    return <Skeleton role="status" aria-label="Etkinlikler yükleniyor" height={24} />;
  if (loading)
    return (
      <Box role="status" aria-label="Etkinlikler yükleniyor" sx={{ p: 2 }}>
        <Skeleton height={32} />
        <Skeleton height={72} />
        <Skeleton height={72} />
      </Box>
    );
  if (error)
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={onRetry} sx={{ minHeight: 44 }}>
            Tekrar dene
          </Button>
        }
        sx={{ m: 1, alignItems: 'center' }}
      >
        {typeof navigator !== 'undefined' && navigator.onLine === false
          ? 'Bağlantı yok. İnternet bağlantınızı kontrol edin.'
          : error}
      </Alert>
    );
  return null;
}
