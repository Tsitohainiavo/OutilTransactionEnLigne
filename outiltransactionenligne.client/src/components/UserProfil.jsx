// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import {
    Avatar,
    Menu,
    MenuItem,
    IconButton,
    Typography,
    Box
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';

const UserProfile = () => {
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
    const handleSendTestEmail = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'https://localhost:7265/api/OracleData/send-test-email',
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            alert('Email de test envoyé avec succès !');
        } catch (error) {
            console.error('Erreur:', error);
            alert("Échec de l'envoi de l'email");
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            // eslint-disable-next-line no-unused-vars
            await axios('https://localhost:7265/api/OracleData/logout', {
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
                {user.email}
            </Typography>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
            >
                <Avatar>
                    <AccountCircleIcon />
                </Avatar>
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
            <button onClick={handleSendTestEmail}>Tester email</button>
        </Box>
    );
};

export default UserProfile;