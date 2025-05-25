import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Box, Chip, Stack } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

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
    const router = useRouter();
    const coverImage =
        publication.coverFile?.url ||
        (publication.files && publication.files.length && publication.files[0].type.startsWith('image')
            ? publication.files[0].link
            : '/no-image.png');

    return (
        <Card
            sx={{
                maxWidth: 345,
                m: '0 auto',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none'
            }}
            elevation={2}
        >
            <Link href={`/yayin/${publication._id}`} passHref legacyBehavior>
                <a style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Box sx={{ position: 'relative' }}>
                        <CardMedia
                            component="img"
                            image={coverImage}
                            alt={publication.title}
                            sx={{
                                height: 180,
                                width: '100%',
                                objectFit: 'contain',
                                backgroundColor: '#fff',
                                borderRadius: 1,
                                display: 'block',
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
            <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={1}>
                    {/* Yayın başlığı */}
                    <Link href={`/yayin/${publication._id}`} passHref legacyBehavior>
                        <a style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography
                                gutterBottom
                                variant="h6"
                                component="div"
                                sx={{ fontSize: 12, fontWeight: 'bold', lineHeight: '1.5' }}
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