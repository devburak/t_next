// pages/[categorySlug].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';  // useRouter hook'unu ekleyin
import { Container, Pagination, Typography } from '@mui/material';
import ContentListItem from '../../component/ContentListItem';  // Bileşen yolu

const CategoryPage = ({ categorySlug, initialContents, totalPages, category }) => {
  const router = useRouter();  // useRouter hook'u kullanımı
  const [contents, setContents] = useState(initialContents);
  const [page, setPage] = useState(1);

  // Sayfa değiştiğinde yeni içerikleri çek
  const handlePageChange = async (event, value) => {
    setPage(value);

    // URL'yi güncelle ve history'yi tut
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: value },
    }, undefined, { shallow: true });  // shallow routing kullanımı

    // Yeni içerikleri API'den çek
    const res = await fetch(`/api/contents/${categorySlug}?page=${value}`);
    const data = await res.json();
    setContents(data.contents);
  };

  useEffect(() => {
    // URL'den sayfa parametresini al ve mevcut sayfayı güncelle
    if (router.query.page) {
      setPage(parseInt(router.query.page));
    }
  }, [router.query.page]);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {category?.name? category?.name.toUpperCase() :categorySlug.toUpperCase()} Kategorisi
      </Typography>

      {/* İçerik Listesi */}
      {contents.map((content) => (
        <ContentListItem
          key={content.slug}
          title={content.title}
          publishDate={content.publishDate}
          featuredMedia={content.featuredMedia}
          spot={content.spot}
          link={`/${content.slug}`}
        />
      ))}

      {/* Sayfalama (Pagination) */}
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        color="primary"
        sx={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}
      />
    </Container>
  );
};

// Sunucu tarafında veri çekme
export async function getServerSideProps({ params, query }) {
  const { categorySlug } = params;
  const page = query.page || 1;  // URL parametresinden sayfa numarasını al veya varsayılan olarak 1'i kullan
  console.log(categorySlug, page);
  
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/contents/category/${categorySlug}?page=${page}`);  // Seçili sayfayı kullan

    // Eğer istek başarılı değilse hata mesajı döndür
    if (!res.ok) {
      console.error('Sunucudan veri alınırken hata oluştu:', res.statusText);
      return {
        notFound: true,  // 404 sayfasına yönlendir
      };
    }

    const data = await res.json();
console.log(data)
    // Gelen verileri kontrol et, boş veya undefined ise varsayılan değer ata
    const contents = data.contents || [];
    const totalPages = data.totalPages || 0;
    const category = data.category || {}


    return {
      props: {
        category,
        categorySlug,
        initialContents: contents,
        totalPages: totalPages,
      },
    };
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    return {
      notFound: true,  // Hata durumunda 404 sayfasına yönlendir
    };
  }
}

export default CategoryPage;
