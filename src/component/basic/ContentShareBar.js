import FacebookIcon from '@mui/icons-material/Facebook';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintIcon from '@mui/icons-material/Print';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import XIcon from '@mui/icons-material/X';
import { alpha } from '@mui/material/styles';
import { Box, IconButton, Stack, SvgIcon, Tooltip } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

function BlueskyIcon(props) {
  return (
    <SvgIcon viewBox="0 0 16 16" {...props}>
      <path d="M3.468 1.948C5.303 3.325 7.276 6.118 8 7.616c.725-1.498 2.698-4.29 4.532-5.668C13.855.955 16 .186 16 2.632c0 .489-.28 4.105-.444 4.692-.572 2.04-2.653 2.561-4.504 2.246 3.236.551 4.06 2.375 2.281 4.2-3.376 3.464-4.852-.87-5.23-1.98-.07-.204-.103-.3-.103-.218 0-.081-.033.014-.102.218-.379 1.11-1.855 5.444-5.231 1.98-1.778-1.825-.955-3.65 2.28-4.2-1.85.315-3.932-.205-4.503-2.246C.28 6.737 0 3.12 0 2.632 0 .186 2.145.955 3.468 1.948" />
    </SvgIcon>
  );
}

const SHARE_CHANNELS = [
  {
    key: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    Icon: FacebookIcon,
    buildHref: (_, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: 'x',
    label: 'X',
    color: '#111827',
    Icon: XIcon,
    buildHref: (title, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    Icon: WhatsAppIcon,
    buildHref: (title, url) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`.trim())}`,
  },
  {
    key: 'bluesky',
    label: 'Bluesky',
    color: '#0285FF',
    Icon: BlueskyIcon,
    buildHref: (title, url) => `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${url}`.trim())}`,
  },
];

function copyText(value) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value);
  }

  if (typeof document === 'undefined') {
    return Promise.reject(new Error('Clipboard unavailable'));
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  return Promise.resolve();
}

export default function ContentShareBar({ title, url }) {
  const [copied, setCopied] = useState(false);
  const safeUrl = url || '';
  const shareTitle = title ? `${title} | TMMOB` : 'TMMOB';

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCopied(false);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [copied]);
  const shareActions = useMemo(
    () => [
      ...SHARE_CHANNELS.map(({ key, label, color, Icon, buildHref }) => ({
        key,
        label,
        color,
        Icon,
        href: buildHref(shareTitle, safeUrl),
        iconSize:
          key === 'facebook' ? 24 : key === 'whatsapp' ? 22 : key === 'bluesky' ? 20 : 19,
      })),
      {
        key: 'copy',
        label: copied ? 'Link kopyalandı' : 'Linki kopyala',
        color: '#475569',
        Icon: ContentCopyIcon,
        iconSize: 20,
        onClick: async () => {
          await copyText(safeUrl);
          setCopied(true);
        },
      },
      {
        key: 'print',
        label: 'Yazdır',
        color: '#7C2D12',
        Icon: PrintIcon,
        iconSize: 20,
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.print();
          }
        },
      },
    ],
    [copied, shareTitle, safeUrl]
  );

  if (!safeUrl) {
    return null;
  }

  return (
    <Box
      component="nav"
      aria-label="İçerik paylaşım bağlantıları"
      data-print-exclude="true"
      sx={{
        mt: 2,
        mb: 2.5,
        width: 'fit-content',
        maxWidth: '100%',
      }}
    >
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
        {shareActions.map(({ key, label, color, Icon, href, onClick, iconSize }) => (
          <Tooltip key={key} title={label} arrow>
            <IconButton
              component={href ? 'a' : 'button'}
              key={key}
              href={href}
              target={href ? '_blank' : undefined}
              rel={href ? 'noopener noreferrer' : undefined}
              onClick={onClick}
              aria-label={label}
              sx={{
                color,
                width: 42,
                height: 42,
                border: '1px solid',
                borderColor: alpha(color, 0.18),
                backgroundColor: alpha(color, 0.08),
                transition:
                  'transform 180ms ease, background-color 180ms ease, border-color 180ms ease',
                '&:hover': {
                  borderColor: alpha(color, 0.4),
                  backgroundColor: alpha(color, 0.14),
                  transform: 'translateY(-1px)',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: iconSize,
                },
              }}
            >
              <Icon />
            </IconButton>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
}
