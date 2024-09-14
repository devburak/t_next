import React, { useEffect, useState } from 'react';
import { Paper, Typography, Grid, Link, Pagination } from '@mui/material';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

function CategoryResults({ page, category, exp = true, vertical = false }) {
    const [categoryResults, setCategoryResults] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [categoryTitle, setCategoryTitle] = useState(''); // Kategori başlığı için durum değişkeni

    const router = useRouter();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    useEffect(() => {
        if (!category) return; // Kategori belirtilmemişse, istek yapma

        // Kategori başlığını çekme
        const fetchCategoryTitle = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/category/byslug/${category}`);
                if (!response.ok) throw new Error('Sunucu hatası!');
                const data = await response.json();
                setCategoryTitle(data.title); // Kategori başlığını güncelle
            } catch (error) {
                console.error('Kategori başlığı yüklenirken bir hata oluştu:', error);
            }
        };

        fetchCategoryTitle();

        const fetchCategoryResults = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/content/contents?categoryName=${category}&page=${page}`);
                if (!response.ok) throw new Error('Sunucu hatası!');
                const data = await response.json();
                setCategoryResults(data.docs);
                setTotalPages(data.totalPages); // Toplam sayfa sayısını güncelle
            } catch (error) {
                console.error('Kategori sonuçları yüklenirken bir hata oluştu:', error);
            }
        };

        fetchCategoryResults();
    }, [category, page]);

    const handlePageChange = (event, value) => {
        router.push({
            pathname: '/category',
            query: { category: category, page: value },
        });
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <h2>{categoryTitle}</h2>
            </Grid>
            {categoryResults.map((item) => (
                <Grid item xs={12} key={item._id}>
                    <Paper elevation={2} sx={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', p: 2 }}>
                        {item.images[0] && (
                            <img
                                src={item.images[0].thumbnailUrl}
                                alt={item.title}
                                style={{ width: '80px', height: '80px', marginRight: vertical ? '0' : '16px', marginBottom: vertical ? '16px' : '0' }}
                            />
                        )}
                        <div>
                            <Link href={`/icerik/${item.slug}`} color="inherit" underline="hover">
                                <Typography variant="subtitle1" style={{ lineHeight: 1.3 }}>{item.title}</Typography>
                            </Link>
                            <Typography variant="body2" color="textSecondary">
                                {dayjs(item.publishedDate).format('DD MMMM YYYY')}
                            </Typography>
                            {exp && (
                                <Typography variant="body2" color="textSecondary" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.summary} ...
                                </Typography>
                            )}
                        </div>
                    </Paper>
                </Grid>
            ))}
            <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Grid>
    );
}

export default CategoryResults;
