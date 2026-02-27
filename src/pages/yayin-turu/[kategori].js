import * as React from "react";
import { useRouter } from "next/router";
import PublicationCard from "../../component/publications/PublicationCard";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
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
            <Container sx={{ mt: 4 }}>
                <Typography variant="h5">Yayın bulunamadı.</Typography>
            </Container>
        </Layout>
    );
  }

  const handlePageChange = (event, value) => {
    router.push(`/yayin-turu/${kategori}?page=${value}`);
  };

  return (
    <Layout>
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
       Yayınlar
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={2} justifyContent="flex-start">
        {data.data.map((pub) => (
          <Box key={pub._id} sx={{ width: 300 }}>
            <PublicationCard publication={pub} />
          </Box>
        ))}
      </Stack>
      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={data.totalPages || 1}
          page={page}
          onChange={handlePageChange}
          color="secondary"
        />
      </Box>
    </Container>
    </Layout>
  );
}
