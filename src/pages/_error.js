// pages/_error.js
import React from 'react';
import ErrorPage from '../component/basic/ErrorPage';

const CustomError = ({ statusCode }) => {
    return (
        <ErrorPage 
            statusCode={statusCode} 
            message="" 
        />
    );
};

CustomError.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default CustomError;
