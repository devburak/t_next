// components/StyledListItem.js
import { styled } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

// Tanımlanan renkler
const ACTIVE_BG_COLOR = '#2C3E50';
const DEFAULT_BG_COLOR = 'inherit';
const HOVER_BG_COLOR = '#2C3E50';
const TEXT_COLOR_ACTIVE = '#ffffff';
const TEXT_COLOR_DEFAULT = 'inherit';

// Styled ListItem
const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
    backgroundColor: selected ? ACTIVE_BG_COLOR : DEFAULT_BG_COLOR,
    color: selected ? TEXT_COLOR_ACTIVE : TEXT_COLOR_DEFAULT,
    '&:hover': {
        backgroundColor: HOVER_BG_COLOR,
        color: TEXT_COLOR_ACTIVE,
    },
    paddingTop: 0,
    paddingBottom: "1px",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    // Ekstra boşluklar veya diğer stiller
}));

// Styled ListItemText
const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    '& .MuiListItemText-primary': {
        fontSize: '1rem',
        // Diğer metin stilleri
    },
}));

export { StyledListItem, StyledListItemText };
