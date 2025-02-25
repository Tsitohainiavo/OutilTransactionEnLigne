// eslint-disable-next-line no-unused-vars
import * as React from 'react';
import {  useState } from 'react';
import { extendTheme, styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddLocationTwoToneIcon from '@mui/icons-material/AddLocationTwoTone';
import LayersIcon from '@mui/icons-material/Layers';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Container, Grid } from '@mui/material';
import Utilisateur from './Utilisateur'; // Importer le composant Orders
import DashboardContent from './DashboardContent'; // Importer le composant DashboardContent
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
//import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
//import CloudCircleIcon from '@mui/icons-material/CloudCircle';
//import SearchIcon from '@mui/icons-material/Search';
import { ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import AddLocationAltTwoToneIcon from '@mui/icons-material/AddLocationAltTwoTone';
import AgenceMap from './AgenceMap';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import logo from './LoginForm/LOGO-CEM-WEB-removebg.png';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
//import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
    Menu,
    MenuItem,
} from '@mui/material';
const NAVIGATION = [
    {
        kind: 'header',
        title: 'Menu',
    },
    {
        segment: 'dashboard',
        title: 'Dashboard',
        icon: <DashboardIcon />,
    },
    {
        segment: 'utilisateurs',
        title: 'Utilisateurs',
        icon: <AddLocationTwoToneIcon />,
    },
    {
        segment: 'agences',
        title: 'Nos Agences',
        icon: <AddLocationAltTwoToneIcon />,
    },
    {
        kind: 'divider',
    },
    {
        kind: 'header',
        title: 'Analytics',
    },
    {
        segment: 'integrations',
        title: 'Integrations',
        icon: <LayersIcon />,
        sx: { display: { xs: 'none', md: 'flex' } }
    },
];

const demoTheme = extendTheme({
    colorSchemes: { light: true, dark: true },
    colorSchemeSelector: 'class',
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
});


function ToolbarActionsSearch() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [user, setUser] = useState(null);
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo);
        }
    }, []);
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            // eslint-disable-next-line no-unused-vars
            await axios('https://localhost:7044/api/OracleData/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/';

        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
        handleClose();
    };

    if (!user) {
        return null;
    }
    return (
        <Stack
            direction="row"
            spacing={{ xs: 1, sm: 2 }}
            sx={{
                alignItems: 'center',
                flexShrink: 0
            }}
        >
            <Tooltip title="Notifications">
                <IconButton sx={{ display: { xs: 'flex', sm: 'flex' } }}>
                    <Badge badgeContent={4} color="error">
                        <NotificationsIcon fontSize="small" />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Tooltip title={user.email}>
                <IconButton size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit">
                    <AccountCircleIcon fontSize="medium" />
                </IconButton>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleClose}>Mon profil</MenuItem>
                    <MenuItem onClick={handleLogout}>Se déconnecter</MenuItem>
                </Menu>
                {/*<IconButton*/}
                {/*    size='large'*/}
                {/*    aria-label="account of current user"*/}
                {/*    aria-controls="menu-appbar"*/}
                {/*    aria-haspopup="true"*/}
                {/*    onClick={null}*/}
                {/*    color="inherit"*/}
                {/*>*/}
                {/*    <Avatar>*/}
                {/*        <AccountCircleIcon />*/}
                {/*    </Avatar>*/}
                {/*</IconButton>*/}
            </Tooltip>

            <ThemeSwitcher sx={{
                '& .MuiSwitch-root': {
                    width: 36,
                    height: 20,
                    padding: 0
                },
                '& .MuiSwitch-thumb': {
                    width: 16,
                    height: 16,
                }
            }} />
        </Stack>
    );
}

function CustomAppTitle() {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1, sm: 2, md: 4 }}
            sx={{
                flexGrow: 1,
                minWidth: 0 // Permet le truncation du texte
            }}
        >
            <img
                src={logo}
                alt="Logo"
                style={{
                    width: 'clamp(60px, 8vw, 80px)',
                    height: 'auto',
                    objectFit: 'contain'
                }}
            />
            <Typography
                variant="h6"
                sx={{
                    fontSize: { xs: '0rem', sm: '1rem', md: '1.25rem' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
            >
                Caisse d&apos;&eacute;pargne Madagascar
            </Typography>
        </Stack>
    );
}

const Skeleton = styled('div')(({ theme, height }) => ({
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    height,
    content: '" "',
}));

export default function DashboardLayoutBasic(props) {
    // eslint-disable-next-line react/prop-types
    const { window } = props;
    const router = useDemoRouter('/dashboard');

    // Remove this const when copying and pasting into your project.
    const demoWindow = window ? window() : undefined;
    const navigate = useNavigate();
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            const userInfo = localStorage.getItem('userInfo');

            // Vérification basique du token
            if (!token || !userInfo) {
                navigate('/login');
                return;
            }

            try {
                // Vérification côté client de l'expiration
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    throw new Error('Token expiré');
                }

                // Vérification côté serveur
                await axios.get('https://localhost:7044/api/oracledata/validate-token', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                navigate('/login');
                console.log('Erreur lors de la validation du token:', error);
            }
        };

        verifyToken();
    }, [navigate]);
    return (
        <AppProvider
            navigation={NAVIGATION}
            router={router}
            theme={demoTheme}
            window={demoWindow}
        >
            <DashboardLayout 
                slots={{
                    appTitle: CustomAppTitle,
                    toolbarActions: ToolbarActionsSearch,
                }}
                sx={{
                    '& .MuiToolbar-root': {
                        flexWrap: 'wrap',
                        minHeight: { xs: 56, sm: 64 },
                        padding: { xs: '8px', sm: '12px 16px' }
                    }
                }}
            >
                    <Container maxWidth="xl" sx={{
                        py: { xs: 2, sm: 3 },
                        px: { xs: 1, sm: 2 }
                    }}>
                    {router.pathname === '/dashboard' ? (
                        <DashboardContent /> // Afficher le composant DashboardContent si le segment est "dashboard"
                    ) : router.pathname === '/utilisateurs' ? (
                        <Utilisateur /> // Afficher le composant Orders si le segment est "orders"
                        ) : router.pathname === '/agences' ? (
                            <AgenceMap /> // Afficher le composant Orders si le segment est "orders"
                        ) : (
                        <Grid container spacing={1}>
                            <Grid item xs={5} />
                            <Grid item xs={12}>
                                <Skeleton height={14} />
                            </Grid>
                            <Grid item xs={12}>
                                <Skeleton height={14} />
                            </Grid>
                            <Grid item xs={4}>
                                <Skeleton height={100} />
                            </Grid>
                            <Grid item xs={8}>
                                <Skeleton height={100} />
                            </Grid>

                            <Grid item xs={12}>
                                <Skeleton height={150} />
                            </Grid>
                            <Grid item xs={12}>
                                <Skeleton height={14} />
                            </Grid>

                            <Grid item xs={3}>
                                <Skeleton height={100} />
                            </Grid>
                            <Grid item xs={3}>
                                <Skeleton height={100} />
                            </Grid>
                            <Grid item xs={3}>
                                <Skeleton height={100} />
                            </Grid>
                            <Grid item xs={3}>
                                <Skeleton height={100} />
                            </Grid>
                        </Grid>
                    )}
                </Container>
            </DashboardLayout>
        </AppProvider>
    );
}
