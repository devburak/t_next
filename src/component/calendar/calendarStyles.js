// Calendar UI token contract: existing surfaces/ink/accent, 4px spacing, 16px corners.
export const calendarUiSx = {
  '--calendar-surface': 'var(--site-elevated, #fff)',
  '--calendar-muted': 'var(--site-surface, #f7f9fc)',
  '--calendar-ink': 'var(--site-ink, #0f172a)',
  '--calendar-accent': 'var(--tmmob-red, #e10702)',
  '--calendar-border': 'var(--site-border, #d6dde7)',
  color: 'var(--calendar-ink)',
  '& p': { m: 0, p: 0, fontSize: 'inherit' },
  '& button, & a': { touchAction: 'manipulation' },
  '& button:focus-visible, & a:focus-visible': {
    outline: '3px solid var(--calendar-accent)',
    outlineOffset: 2,
  },
};
export const calendarButtonSx = {
  minHeight: 44,
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
};
