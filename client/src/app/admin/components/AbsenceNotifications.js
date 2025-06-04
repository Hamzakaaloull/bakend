import * as React from 'react';
import { 
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LoadingIn from '@/app/hooks/LoadingIn';
import { 
  Schedule, 
  Class, 
  Person, 
  Close 
} from '@mui/icons-material';

const AbsenceNotifications = ({ 
  absences, 
  loading, 
  onSeanceClick,
  apiUrl,
  currentDate
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const theme = useTheme();
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // دالة لعرض التاريخ بالفرنسية كما هو من Strapi
  const formatStrapiDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ ml: 2 }}>
      <Tooltip title="Notifications d'absence">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ 
            position: 'relative',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
        >
          <Badge 
            badgeContent={loading ? <CircularProgress size={10} color="inherit" /> : absences.length} 
            color="error"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                right: 5,
                top: 5,
                fontSize: theme.typography.pxToRem(12),
                minWidth: 20,
                height: 20,
                borderRadius: '50%',
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              }
            }}
          >
            <NotificationsIcon sx={{ fontSize: 28 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ 
          sx: { 
            width: 380, 
            maxHeight: 500,
            borderRadius: 3,
            boxShadow: theme.shadows[10],
            border: `1px solid ${theme.palette.divider}`
          } 
        }}
      >
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Notifications d'absence
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: 'inherit' }}>
              <Close />
            </IconButton>
          </Box>
          <Typography variant="body2">
            {formatStrapiDate(currentDate)} | {absences.length} séance(s) manquée(s)
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <LoadingIn size={50} overlay={false} />
          </Box>
        ) : absences.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 60, color: 'grey.300', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              Aucune séance manquée aujourd'hui
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0, maxHeight: 400, overflow: 'auto' }}>
            {absences.map((seance, index) => (
              <React.Fragment key={seance.id}>
                <ListItem 
                  button="true" 
                  onClick={() => {
                    onSeanceClick(seance);
                    handleClose();
                  }}
                  sx={{
                    py: 2,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={seance.userPhoto?.[0]?.url ? `${apiUrl}${seance.userPhoto[0].url}` : null}
                      sx={{ width: 50, height: 50, boxShadow: theme.shadows[2] }}
                    >
                      {!seance.userPhoto?.[0]?.url && <Person />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="bold" 
                        sx={{ mb: 0.5 }}
                      >
                        {seance.cour?.title || '—'}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" component="span">
                            {seance.user?.username || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Schedule fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" component="span">
                            {seance.start_time} - {seance.end_time}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                {index < absences.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </Box>
  );
};

export default AbsenceNotifications;