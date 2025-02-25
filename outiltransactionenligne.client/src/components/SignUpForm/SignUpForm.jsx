/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';

const SignUpForm = () => {
    const [formData, setFormData] = useState({
        email: '',
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
                Email: formData.email,
                Password: formData.password
            });

            if (response.status === 200) {
                alert("Inscription réussie !");
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
                        <p>Vous avez dejà un compte ? <a href="/">Connectez-vous</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpForm;