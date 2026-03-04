import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Box, Chip, Stack } from '@mui/material';
import Link from 'next/link';
import { DEFAULT_OG_IMAGE } from '../../lib/seo';
import AspectRatioMedia from '../basic/AspectRatioMedia';

const TITLE_CLAMP_SX = {
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
    overflow: 'hidden',
    minHeight: '4.5em',
    maxHeight: '4.5em'
};

function formattedDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

export default function PublicationCard({ publication, hideCategories = false }) {
    const publicationHref = `/yayin/${publication.slug || publication._id}`;
    const coverImage =
        publication.coverFile?.url ||
        (publication.files && publication.files.length && String(publication.files[0]?.type || '').startsWith('image')
            ? publication.files[0].link
            : DEFAULT_OG_IMAGE);

    return (
        <Card
            sx={{
                maxWidth: 345,
                m: '0 auto',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                width: '100%',
                height: '100%'
            }}
            elevation={2}
        >
            <Link href={publicationHref} passHref legacyBehavior>
                <a style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Box sx={{ position: 'relative' }}>
                        <AspectRatioMedia
                            src={coverImage}
                            alt={publication.title}
                            sizes="(max-width: 600px) 100vw, 345px"
                            objectFit="contain"
                            sx={{
                                backgroundColor: '#fff',
                                borderRadius: 1,
                                maxHeight: 260
                            }}
                        />
                        {/* Yayın tarihi etiketi (resim üzerinde absolute) */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -4,
                                right: 0,
                                width: '50%',
                                bgcolor: 'rgba(0, 0, 0, 0.4)',
                                color: 'white',
                                textAlign: 'center',
                                padding: '2px 0',
                            }}
                        >
                            <Typography variant="caption" sx={{ fontSize: 12 }}>
                                {formattedDate(publication.publishDate || publication.createdAt)}
                            </Typography>
                        </Box>
                    </Box>
                </a>
            </Link>
            <CardContent sx={{ flexGrow: 1, minHeight: 96, display: 'flex' }}>
                <Stack spacing={1}>
                    {/* Yayın başlığı */}
                    <Link href={publicationHref} passHref legacyBehavior>
                        <a style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography
                                variant="h6"
                                component="div"
                                sx={TITLE_CLAMP_SX}
                            >
                                {publication.title}
                            </Typography>
                        </a>
                    </Link>
                    {/* Kategoriler */}
                    
                    { !hideCategories && publication.categories && publication.categories.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 1 }}>
                            {publication.categories.map((cat) => (
                                <Link
                                    key={cat._id}
                                    href={`/yayin-turu/${cat.slug}`}
                                    passHref
                                    legacyBehavior
                                >
                                    <a>
                                        <Chip
                                            label={cat.name}
                                            size="small"
                                            color="secondary"
                                            clickable
                                            sx={{ fontSize: 12, mr: 1, mb: 0.5 }}
                                        />
                                    </a>
                                </Link>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
