import { Box, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PublicIcon from '@mui/icons-material/Public';
import SecurityIcon from '@mui/icons-material/Security';

const brandColors = {
    blue: '#142334',
    green: '#279B48',
};

const HomePage = () => {
    const theme = useTheme();

    const cards = [
        {
            title: 'ISO 9001',
            subtitle: 'Gestión de Calidad',
            icon: <CheckCircleOutlineIcon fontSize="large" />,
            color: brandColors.green,
        },
        {
            title: 'ISO 14001',
            subtitle: 'Gestión Ambiental',
            icon: <PublicIcon fontSize="large" />,
            color: brandColors.green,
        },
        {
            title: 'ISO 45001',
            subtitle: 'Seguridad y Salud en el Trabajo',
            icon: <SecurityIcon fontSize="large" />,
            color: brandColors.green,
        },
    ];

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100%',
                bgcolor: theme.palette.grey[50],
            }}
        >
            <Container
                maxWidth="xl"          
                sx={{
                    py: { xs: 6, md: 10 },
                    textAlign: 'center',
                }}
            >
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: brandColors.blue,
                    }}
                >
                    Sistema de Gestión Integrado
                </Typography>

                <Typography
                    variant="subtitle1"
                    sx={{
                        maxWidth: 640,
                        mx: 'auto',
                        mb: { xs: 6, md: 8 },
                        color: theme.palette.text.secondary,
                    }}
                >
                    Bienvenido a SIGBAQ la plataforma unificada de gestión de calidad, medio
                    ambiente y seguridad y salud en el trabajo.
                </Typography>

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={4}
                    justifyContent="center"
                    alignItems="stretch"
                >
                    {cards.map((card) => (
                        <Card
                            key={card.title}
                            elevation={3}
                            sx={{
                                flex: 1,
                                minWidth: { xs: '100%', sm: 260 },
                                borderRadius: 3,
                                border: `1px solid ${brandColors.green}`,
                                py: 3,
                                px: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 18px 45px rgba(0,0,0,0.12)',
                                },
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        width: 72,
                                        height: 72,
                                        mb: 3,
                                        mx: 'auto',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: alpha(card.color, 0.08),
                                        color: card.color,
                                    }}
                                >
                                    {card.icon}
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    {card.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {card.subtitle}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Container>
        </Box>
    );
};

export default HomePage;
