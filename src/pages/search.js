// pages/search.js
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// import SearchInput from '../component/basic/searchInput'; // Yolu düzenleyin
import SearchResults from '../component/Lists/searchResultList'; // Yolu düzenleyin
import { Container } from '@mui/material';
import Layout from '@/component/basic/layout';
import dynamic from 'next/dynamic';
import { buildMetaDescription } from '@/lib/seo';

const SearchInput = dynamic(() => import('../component/basic/searchInput'), { ssr: false });
export default function SearchPage() {
  const router = useRouter();
  const { s, page = 1 } = router.query; // Varsayılan sayfa 1

    return (
        <Layout>
            <Head>
                <title>Arama Sonuçları | TMMOB</title>
                <meta
                    name="description"
                    content={buildMetaDescription(`TMMOB içerik arama sonuçları: ${s || 'arama'}`)}
                />
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <Container>
                <SearchInput initialSearchTerm={s || ''} />
                <SearchResults searchTerm={s} page={parseInt(page, 10)} />
            </Container>
        </Layout>

    );
}
