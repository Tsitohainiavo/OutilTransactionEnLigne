import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import UserProfile from './UserProfil';
function Utilisateur() {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState({ id: '', email: '' });
    // Ajouter un état pour le terme de recherche
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrer les utilisateurs selon le terme de recherche
    const filteredUsers = utilisateurs.filter(utilisateur =>
        utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Ajouter cette fonction dans le composant Utilisateur
    const handleExportCSV = () => {
        const csvContent = [
            ['ID', 'Email'], // En-têtes
            ...filteredUsers.map(user => [user.id, user.email])
                .map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'utilisateurs.csv');
    };
    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredUsers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Utilisateurs");
        XLSX.writeFile(wb, "utilisateurs.xlsx");
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('https://localhost:7265/api/OracleData/utilisateurs', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => response.data)
            .then(data => {
                setUtilisateurs(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des utilisateurs:', error);
            });
    }, []);

    const handleDelete = (id) => {
        const token = localStorage.getItem('token');
        axios.delete(`https://localhost:7044/api/OracleData/utilisateurs/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(() => {
                setUtilisateurs(utilisateurs.filter(utilisateur => utilisateur.id !== id));
            })
            .catch(error => {
                console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            });
    };

    const handleEdit = (id) => {
        const user = utilisateurs.find(utilisateur => utilisateur.id === id);
        setCurrentUser(user);
        setEditDialogOpen(true);
    };

    const handleEditSave = () => {
        const token = localStorage.getItem('token');
        axios.put(`https://localhost:7044/api/OracleData/utilisateurs/${currentUser.id}`, {
            email: currentUser.email
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(() => {
                setUtilisateurs(utilisateurs.map(utilisateur => utilisateur.id === currentUser.id ? currentUser : utilisateur));
                setEditDialogOpen(false);
            })
            .catch(error => {
                console.error('Erreur lors de la modification de l\'utilisateur:', error);
            });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setCurrentUser({ ...currentUser, [name]: value });
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Liste des Utilisateurs
            </Typography>
            <div>
                <TextField
                label="Rechercher par email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3 }}
                />
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleExportCSV}
                    sx={{ mb: 3, ml: 2 }}
                >
                    Exporter en CSV
                </Button>
                <UserProfile/>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleExportExcel}
                    sx={{ mb: 3, ml: 2 }}
                >
                    Exporter en Excel
                </Button>
            </div>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </div>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                            <TableBody>
                                {filteredUsers.map(utilisateur => (
                                <TableRow key={utilisateur.id}>
                                    <TableCell>{utilisateur.id}</TableCell>
                                    <TableCell>{utilisateur.email}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="primary" onClick={() => handleEdit(utilisateur.id)}>
                                            Modifier
                                        </Button>
                                        <Button variant="contained" color="secondary" onClick={() => handleDelete(utilisateur.id)} style={{ marginLeft: '10px' }}>
                                            Supprimer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Modifier Utilisateur</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Modifiez les informations de lutilisateur ci-dessous.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        value={currentUser.email}
                        onChange={handleEditChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={handleEditSave} color="primary">
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Utilisateur;
