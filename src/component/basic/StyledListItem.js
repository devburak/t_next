import { styled } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.primary.main : 'inherit',
  color: selected ? theme.palette.common.white : 'inherit',
  '&:hover': { backgroundColor: theme.palette.primary.main, color: theme.palette.common.white },
  paddingTop: 0,
  paddingBottom: 1,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
}));

export { StyledListItem, ListItemText as StyledListItemText };
