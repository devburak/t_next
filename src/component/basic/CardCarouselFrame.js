import { Box } from '@mui/material';

export const CARD_CAPTION_HEIGHT = 96;
export const CAROUSEL_CONTROLS_HEIGHT = 40;
export const CAROUSEL_ITEM_HEIGHT = `calc(100% - ${CAROUSEL_CONTROLS_HEIGHT}px)`;

export const cardGroupSx = (columns) => ({
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: `repeat(${columns}, minmax(0, 1fr))` },
  gap: 4,
  justifyItems: 'center',
  alignItems: 'stretch',
});

// The in-flow pseudo element reserves the media's 4:3 space even before images,
// data or the deferred carousel arrive. No image load/resize measurement is needed.
export default function CardCarouselFrame({ columns = 1, controls = true, children }) {
  const controlsHeight = controls ? CAROUSEL_CONTROLS_HEIGHT : 0;
  return (
    <Box
      data-card-carousel-frame
      sx={{
        position: 'relative',
        width: '100%',
        p: 1,
        pb: `${8 + CARD_CAPTION_HEIGHT + controlsHeight}px`,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          display: 'block',
          width: {
            xs: 'min(100%, 345px)',
            sm: `min(calc((100% - ${(columns - 1) * 32}px) / ${columns}), 345px)`,
          },
          aspectRatio: '4 / 3',
          maxHeight: 260,
        },
      }}
    >
      <Box sx={{ position: 'absolute', inset: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
