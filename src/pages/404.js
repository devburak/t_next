// pages/404.js
import React from 'react';
import ErrorPage from '../component/basic/ErrorPage';

const Custom404 = () => {
    return (
        <ErrorPage 
            statusCode={404} 
            message="" 
        />
    );
};

export default Custom404;