/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import { FaLock, FaEnvelope, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

const SignUpForm = () => {
    const [formData, setFormData] = useState({
        typeUtilisateur: '',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Les mots de passe ne correspondent pas");
            return;
        }

        try {
            const response = await axios.post('https://localhost:7044/api/OracleData/register', {
                TypeUtilisateur: formData.typeUtilisateur,
                Nom: formData.nom,
                Prenom: formData.prenom,
                Email: formData.email,
                Telephone: formData.telephone,
                Adresse: formData.adresse,
                Password: formData.password
            });

            if (response.status === 200) {
                alert("Inscription r�ussie !");
                window.location.href = '/';
            }
        } catch (error) {
            if (error.response) {
                alert(error.response.data);
            } else {
                console.error('Erreur lors de l\'inscription:', error.message);
                alert('Une erreur s\'est produite lors de l\'inscription.');
            }
        }
    };

    return (
        <div className="signup-form-container">
            <div className='wrapper'>
                <form onSubmit={handleSubmit}>
                    <h1>Inscription</h1>

                    <div className='input-box'>
                        <input
                            type='text'
                            placeholder='Type utilisateur'
                        name="typeUtilisateur"
                        value={formData.typeUtilisateur}
                        onChange={handleChange}
                        />
                        <FaUser className='icon' />
                    </div>

                    <div className='input-box'>
                        <input
                            type='text'
                            placeholder='Nom'
                            name="nom"
                            required
                            value={formData.nom}
                            onChange={handleChange}
                        />
                        <FaUser className='icon' />
                    </div>

                    <div className='input-box'>
                        <input
                            type='text'
                            placeholder='Pr�nom'
                            name="prenom"
                            required
                            value={formData.prenom}
                            onChange={handleChange}
                        />
                        <FaUser className='icon' />
                    </div>

                    <div className='input-box'>
                        <input
                            type='email'
                            placeholder='Email'
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <FaEnvelope className='icon' />
                    </div>

                    <div className='input-box'>
                        <input
                            type='tel'
                            placeholder='T�l�phone'
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                        />
                        <FaPhone className='icon' />
                    </div>

                    <div className='input-box'>
                        <input
                            type='text'
                            placeholder='Adresse'
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                        />
                        <FaMapMarkerAlt className='icon' />
                    </div>

                    <div className='input-box'>
                        <input
                            type='password'
                            placeholder='Mot de passe'
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <FaLock className='icon' />
                    </div>

                    <div className='input-box'>
                        <input
                            type='password'
                            placeholder='Confirmer le mot de passe'
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        <FaLock className='icon' />
                    </div>

                    <div className='terms'>
                        <label>
                            <input type='checkbox' required />
                            J'accepte les conditions d'utilisation
                        </label>
                    </div>

                    <button type='submit'>S'inscrire</button>

                    <div className='login-link'>
                        <p>Vous avez d�j� un compte ? <a href="/">Connectez-vous</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpForm;