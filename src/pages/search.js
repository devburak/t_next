// pages/search.js
import React from 'react';
import { useRouter } from 'next/router';
import SearchInput from '../component/basic/searchInput'; // Yolu düzenleyin
import SearchResults from '../component/Lists/searchResultList'; // Yolu düzenleyin
import { Container } from '@mui/material';
import Layout from '@/component/basic/layout';

export default function SearchPage() {
  const router = useRouter();
  const { s, page = 1 } = router.query; // Varsayılan sayfa 1

    return (
        <Layout>
            <Container>
                <SearchInput initialSearchTerm={s || ''} />
                <SearchResults searchTerm={s} page={parseInt(page, 10)} />
            </Container>
        </Layout>

    );
}
