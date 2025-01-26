import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/router';

function PeriodComponent( ) {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { periodId } = router.query; // URL'den periodId al

  useEffect(() => {
    // LocalStorage'dan dönem bilgilerini kontrol et
    const cachedPeriods = localStorage.getItem('periods');
    if (cachedPeriods) {
      setPeriods(JSON.parse(cachedPeriods));
    } else {
      fetchPeriods();
    }
  }, []);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/periods`);
      const data = await res.json();

      if (data?.periods) {
        setPeriods(data.periods);
        localStorage.setItem('periods', JSON.stringify(data.periods)); // LocalStorage'a kaydet
      }
    } catch (error) {
      console.error('Dönem verileri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (event, value) => {
    // URL'yi shallow routing ile güncelle
    const newQuery = {
      ...router.query,
      periodId: value?._id || undefined, // Eğer dönem seçilmemişse query'den kaldır
    };

    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <Autocomplete
      options={periods}
      getOptionLabel={(option) => option.name || ''}
      isOptionEqualToValue={(option, value) => option._id === value?._id}
      value={periods.find((period) => period._id === periodId) || null} // Default olarak URL'deki periodId'yi seç
      onChange={handlePeriodChange}
      loading={loading}
      size='small'
      renderInput={(params) => (
        <TextField
          {...params}
          label="Dönem Seçin"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default PeriodComponent;
