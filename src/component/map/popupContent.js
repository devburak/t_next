import React from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

const PopupContent = ({ title = "", content = "", files = [] }) => {
    return (
        <Box>
            <Typography variant="subtitle1" component="h2" gutterBottom style={{ fontWeight: 'bold' }}>
                {title}
            </Typography>
            <Typography variant="body2" component="p" gutterBottom>
                {content}
            </Typography>
            {files && files.map((file, index) => (
                <Box key={index} display="flex" alignItems="center" marginBottom={1}>
                    <AttachFileIcon style={{ marginRight: 8 }} />
                    <Link href={file.link} target="_blank" rel="noopener noreferrer">
                        {file.name}
                    </Link>
                </Box>
            ))}
        </Box>
    );
};

export default PopupContent;
