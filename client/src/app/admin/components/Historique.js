import * as React from 'react';
import {
  Box,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  useMediaQuery,
  Grid,
  Avatar,
  Divider,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore,
  Schedule,
  Class,
  Groups,
  Room,
  Person,
  Close,
  Description,
  CalendarToday,
  AccessTime,
  CheckCircle,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import LoadingIn from '@/app/hooks/LoadingIn';
import AbsenceNotifications from './AbsenceNotifications';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: '16px !important',
  boxShadow: theme.shadows[3],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[6],
  },
  '&:before': { display: 'none' },
}));

const DetailItem = ({ icon, label, value }) => (
  <Grid container spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
    <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
      {React.cloneElement(icon, { sx: { mr: 1, color: 'primary.main' } })}
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
    </Grid>
    <Grid item xs={12} sm={9}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value || '—'}
      </Typography>
    </Grid>
  </Grid>
);

export default function HistoriqueGrid() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));
  const [histos, setHistos] = React.useState([]);
  const [filterDate, setFilterDate] = React.useState('');
  const [expanded, setExpanded] = React.useState(null);
  const [selectedSeance, setSelectedSeance] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  
  // الحصول على تاريخ اليوم بنفس تنسيق Strapi (UTC)
  const getCurrentStrapiDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };
   const now = new Date();
  console.log('getCurrentStrapiDate:', now.toISOString().split('T')[0]);
  const [currentDate, setCurrentDate] = React.useState(getCurrentStrapiDate());

  React.useEffect(() => {
    setLoading(true); 
    fetch(
      `${API_URL}/api/historiques?` +
        'populate[seances][populate][user]=true&' +
        'populate[seances][populate][salle]=true&' +
        'populate[seances][populate][cour]=true&' +
        'populate[seances][populate][brigade]=true&' +
        'populate[seances][populate][userPhoto]=true'
    )
      .then((r) => r.json())
      .then((j) => setHistos(j.data))
      .catch(console.error)
      .finally(() => setLoading(false));

      const host = fetch(
      `${API_URL}/api/historiques?` +
        'populate[seances][populate][user]=true&' +
        'populate[seances][populate][salle]=true&' +
        'populate[seances][populate][cour]=true&' +
        'populate[seances][populate][brigade]=true&' +
        'populate[seances][populate][userPhoto]=true'
    );
    host.then((r) => r.json())
      .then((j) => console.log( "this is host ",j));
  }, []);

  // حساب الغياب: فقط لسجلات اليوم الحالي (بنفس تنسيق Strapi)
  const absences = React.useMemo(() => {
    if (!histos || histos.length === 0) return [];
    
    return histos.flatMap(histo => {
      // تاريخ السجل في Strapi (بدون وقت)
     // const strapiDate = histo.date.split('T')[0];
              const strapiDateold = histo.date; // التاريخ من Strapi (مثال: "2023-05-31T00:00:00.000Z")

        // 1. إنشاء كائن Date من تاريخ Strapi
        const dateObj = new Date(strapiDateold);

        // 2. إضافة يوم واحد
        dateObj.setDate(dateObj.getDate() + 1);

        // 3. الحصول على التاريخ الجديد بصيغة YYYY-MM-DD
        const strapiDate = dateObj.toISOString().split('T')[0];
      // نريد فقط سجلات اليوم الحالي (بنفس تنسيق Strapi)
      if (strapiDate !== currentDate) return [];
      
      return histo.seances.filter(seance => !seance.Appele);
    });
  }, [histos, currentDate]);

  // التصفية حسب التاريخ المختار (بدون تحويل)
  const filtered = React.useMemo(() => {
    if (!filterDate) return histos;
    
    return histos.filter((h) => {
         const strapiDateold = histo.date; // التاريخ من Strapi (مثال: "2023-05-31T00:00:00.000Z")
        // 1. إنشاء كائن Date من تاريخ Strapi
        const dateObj = new Date(strapiDateold);
        // 2. إضافة يوم واحد
        dateObj.setDate(dateObj.getDate() + 1);
        // 3. الحصول على التاريخ الجديد بصيغة YYYY-MM-DD
        const strapiDate = dateObj.toISOString().split('T')[0];
      return strapiDate === filterDate;
    });
  }, [histos, filterDate]);

  const handleChange = (id) => (_, isExp) => {
    setExpanded(isExp ? id : null);
  };

  const handleOpen = (seance) => {
    setSelectedSeance(seance);
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setSelectedSeance(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          label="📅 Filtrer par date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          sx={{
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        />
        <AbsenceNotifications 
          absences={absences} 
          loading={loading} 
          onSeanceClick={handleOpen}
          apiUrl={API_URL}
          currentDate={currentDate}
        />
      </Box>
       
      {loading ? (
        <Box
          sx={{
            width: '100%',
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LoadingIn overlay={false} size={80} />
        </Box>
      ) : (
        <>
          {filtered.length === 0 && (
            <Box
              sx={{
                textAlign: 'center',
                p: 4,
                borderRadius: 3,
                bgcolor: 'background.default',
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                📭 Aucun historique trouvé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Essayez de modifier les filtres de recherche
              </Typography>
            </Box>
          )}

          {filtered.map((histo) => {
           // const strapiDate = histo.createdAt.split('T')[0];
           const strapiDateold = histo.date; // التاريخ من Strapi (مثال: "2023-05-31T00:00:00.000Z")
              // 1. إنشاء كائن Date من تاريخ Strapi
              const dateObj = new Date(strapiDateold);
              // 2. إضافة يوم واحد
              dateObj.setDate(dateObj.getDate() + 1);
              // 3. الحصول على التاريخ الجديد بصيغة YYYY-MM-DD
              const strapiDate = dateObj.toISOString().split('T')[0];
            const times = Array.from(
              new Set(histo.seances.map((s) => s.start_time.slice(0, 5)))
            ).sort();
        
            const brigades = Array.from(
              new Set(histo.seances.map((s) => s.brigade?.nom || '—'))
            );

            return (
              <StyledAccordion
                key={histo.id}
                expanded={expanded === histo.id}
                onChange={handleChange(histo.id)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'primary.contrastText' }} />}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: '16px 16px 0 0',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CalendarToday fontSize="small" />
                      <Typography variant="h6">
                        {strapiDate}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${histo.seances.length} séances`}
                      size="small"
                      sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <Paper variant="outlined" sx={{ borderRadius: 2, border: 'none' }}>
                    <Box sx={{ overflowX: 'auto' }}>
                      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                        <Box component="thead">
                          <Box component="tr">
                            <Box
                              component="th"
                              sx={{
                                px: 2,
                                py: 1.5,
                                bgcolor: 'grey.100',
                                minWidth: 120,
                                textAlign: 'left',
                              }}
                            >
                              Brigade
                            </Box>
                            {times.map((t) => (
                              <Box
                                key={t}
                                component="th"
                                sx={{
                                  px: 2,
                                  py: 1.5,
                                  bgcolor: 'grey.100',
                                  minWidth: 150,
                                  textAlign: 'center',
                                }}
                              >
                                <AccessTime fontSize="small" sx={{ mr: 1 }} />
                                {t}
                              </Box>
                            ))}
                          </Box>
                        </Box>

                        <Box component="tbody">
                          {brigades.map((brigade) => (
                            <Box component="tr" key={brigade}>
                              <Box
                                component="td"
                                sx={{
                                  px: 3,
                                  py: 2,
                                  bgcolor: 'background.paper',
                                  borderRight: '1px solid',
                                  borderColor: 'divider',
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 1,
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Groups fontSize="small" color="primary" />
                                  <Typography variant="subtitle2">{brigade}</Typography>
                                </Box>
                              </Box>

                              {times.map((t) => {
                                const s = histo.seances.find(
                                  (sec) => (sec.brigade?.nom || '—') === brigade && sec.start_time.slice(0, 5) === t 
                                );
                                return (
                                  <Box
                                    component="td"
                                    key={t}
                                    sx={{
                                      px: 2,
                                      py: 1.5,
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      bgcolor: 'background.paper',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                    onClick={() => handleOpen(s)}
                                  >
                                    {s && (
                                      <>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                          <Class
                                            fontSize="small"
                                            sx={{ mr: 1, color: 'secondary.main' }}
                                          />
                                          <Typography variant="caption" fontWeight={500}>
                                            {s.cour?.title || '—'}
                                          </Typography>
                                        </Box>
                                        <LinearProgress
                                          variant="determinate"
                                          value={s.Appele ? 100 : 0}
                                          sx={{
                                            height: 4,
                                            mb: 1,
                                            borderRadius: 2,
                                            bgcolor: 'divider',
                                            '& .MuiLinearProgress-bar': {
                                              bgcolor: s.Appele ? 'success.main' : 'error.main',
                                            },
                                          }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                          <Chip
                                            icon={<Room fontSize="small" />}
                                            label={s.salle?.nom || '—'}
                                            size="small"
                                            variant="outlined"
                                          />
                                          <Chip
                                            icon={<Person fontSize="small" />}
                                            label={s.user?.username || 'N/A'}
                                            size="small"
                                            variant="outlined"
                                          />
                                        </Box>
                                      </>
                                    )}
                                  </Box>
                                );
                              })}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </AccordionDetails>
              </StyledAccordion>
            );
          })}
        </>
      )}
      
      {/* Dialogue Détails */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📋 Détails de la séance</span>
            <IconButton onClick={handleClose} sx={{ color: 'inherit' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ py: 3 }}>
          {selectedSeance && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DetailItem
                  icon={<CalendarToday />}
                  label="Date"
                  value={selectedSeance.date.split('T')[0]}
                />
                <DetailItem
                  icon={<AccessTime />}
                  label="Heure début"
                  value={selectedSeance.start_time}
                />
                <DetailItem
                  icon={<CheckCircle />}
                  label="Heure fin"
                  value={selectedSeance.end_time}
                />
                <DetailItem
                  icon={<Description />}
                  label="Appelé"
                  value={selectedSeance.Appele ? 'Oui' : 'Non'}
                />
                <DetailItem
                  icon={<AccessTime />}
                  label="Temps de présence"
                  value={selectedSeance.time_presence}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DetailItem
                  icon={<Class />}
                  label="Cours"
                  value={selectedSeance.cour?.title}
                />
                <DetailItem
                  icon={<Groups />}
                  label="Brigade"
                  value={`${selectedSeance.brigade?.nom} (${selectedSeance.brigade?.stage})`}
                />
                <DetailItem
                  icon={<Room />}
                  label="Salle"
                  value={`${selectedSeance.salle?.nom} (${selectedSeance.salle?.bloc})`}
                />
                <DetailItem
                  icon={<Person />}
                  label="Professeur"
                  value={selectedSeance.user?.username || selectedSeance.user?.email}
                />
              </Grid>

              {/* Photo de l'utilisateur */}
              {selectedSeance.userPhoto?.[0] && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1, color: 'primary.main' }} />
                    Photo du professeur
                  </Typography>
                  <Avatar
                    src={`${API_URL}${selectedSeance.userPhoto[0].url}`}
                    sx={{ width: 100, height: 100, boxShadow: 3 }}
                  />
                </Grid>
              )}

              {selectedSeance.cour?.cour_contant?.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Description sx={{ mr: 1, color: 'primary.main' }} />
                    Documents associés
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedSeance.cour.cour_contant.map((doc) => (
                      <Button
                        key={doc.id}
                        href={`${API_URL}${doc.url}`}
                        target="_blank"
                        variant="outlined"
                        startIcon={<Description />}
                        sx={{ borderRadius: 3 }}
                      >
                        {doc.name}
                      </Button>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{ borderRadius: 3, textTransform: 'none' }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}