import * as React from "react";
import { useRouter } from "next/router";
import PublicationCard from "../../component/publications/PublicationCard";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import Layout from '../../component/basic/layout';

export async function getServerSideProps({ params, query }) {
  const { kategori="" } = params;
  const page = parseInt(query.page) || 1;
  const limit = 18; // Sayfa başına kaç kart
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/publication?categorySlug=${kategori}&page=${page}&limit=${limit}`;
  const res = await fetch(url);
  const data = await res.json();

  return {
    props: {
      kategori,
      page,
      limit,
      data,
    },
  };
}

export default function KategoriYayinlari({ kategori, page, limit, data }) {
  const router = useRouter();

  if (!data || !data.data || data.data.length === 0) {
    return (
        <Layout>
            <Box
              sx={{
                mt: 1,
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                border: '1px solid rgba(15, 23, 42, 0.08)',
                backgroundColor: '#fff',
                boxShadow: '0 18px 42px rgba(15, 23, 42, 0.08)',
              }}
            >
                <Typography variant="h5">Yayın bulunamadı.</Typography>
            </Box>
        </Layout>
    );
  }

  const handlePageChange = (event, value) => {
    router.push(`/yayin-turu/${kategori}?page=${value}`);
  };

  return (
    <Layout>
      <Box
        sx={{
          mt: 1,
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          border: '1px solid rgba(15, 23, 42, 0.08)',
          backgroundColor: '#fff',
          boxShadow: '0 18px 42px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Yayınlar
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 3,
            '& .MuiCard-root': {
              maxWidth: 'none',
              width: '100%',
            },
          }}
        >
          {data.data.map((pub) => (
            <Box key={pub._id} sx={{ minWidth: 0 }}>
              <PublicationCard publication={pub} />
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={data.totalPages || 1}
            page={page}
            onChange={handlePageChange}
            color="secondary"
          />
        </Box>
      </Box>
    </Layout>
  );
}
