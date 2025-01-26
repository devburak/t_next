// components/ErrorPage.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import SearchInput, disable SSR
const SearchInput = dynamic(() => import('./searchInput'), { ssr: false });

const ErrorPage = ({ statusCode = 500, message = "" }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh',
                textAlign: 'center',
                px: 2,
            }}
        >
            <Typography variant="h3" component="h1" gutterBottom>
            {statusCode ? `Bir şeylerde sorun oluştu (Hata ${statusCode})` : "Bir şeylerde sorun oluştu"}

            </Typography>
            <Typography variant="body1" gutterBottom>
                {message || "Ulaşmak istediğiniz yere arama ile gidebilirsiniz "}
                <SearchInput /> 
                {" ya da ana sayfa üzerinden tekrar kendiniz gitmeyi deneyebilirsiniz."}
            </Typography>
            <Box sx={{ mt: 4 }}>
                <Link href="/" passHref>
                    <Button  variant="contained" color="primary">
                        Ana Sayfa&apos;ya Dön
                    </Button>
                </Link>
            </Box>
        </Box>
    );
};

export default ErrorPage;
