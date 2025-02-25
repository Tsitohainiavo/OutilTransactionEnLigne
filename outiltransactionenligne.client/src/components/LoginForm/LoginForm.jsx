import { useState } from 'react';
import sombiniainaImage from './sombiniaina.jpg';
import logoCem from './LOGO-CEM-WEB-removebg.png';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpField, setShowOtpField] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://localhost:7044/api/oracledata/login', {
                Email: email,
                Password: password,
            });
            if (response.status === 200) {
                setShowOtpField(true); // Afficher le champ OTP
            }
        } catch (error) {
            if (error.response) {
                alert(error.response.data);
            } else {
                console.error('Erreur lors de la connexion:', error.message);
                alert('Une erreur s\'est produite lors de la connexion.');
            }
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await axios.post('https://localhost:7044/api/oracledata/verify-otp', {
                Email: email,
                Otp: otp,
            });
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userInfo', JSON.stringify(response.data.user));
                window.location.href = '/dashboardlayoutbasic';
            }
        } catch (error) {
            if (error.response) {
                alert(error.response.data);
            } else {
                console.error('Erreur lors de la vérification du code OTP:', error.message);
                alert('Une erreur s\'est produite lors de la vérification du code OTP.');
            }
        }
    };

    return (
        <Container className="min-vh-100 d-flex align-items-center justify-content-center"  >
            <div className="login-container row shadow-lg rounded-4 overflow-hidden">
                <div className="col-lg-4 p-5 form-section" style={{ backgroundColor: 'white' }}>
                    <div className="text-center mb-4">
                        <img src={logoCem} alt="Logo" className="w-50" />
                    </div>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4" controlId="formEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4" controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        {showOtpField && (
                            <Form.Group className="mb-4" controlId="formOtp">
                                <Form.Label>Code OTP</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        )}
                        {!showOtpField && (
                            <Button variant="primary" type="submit" className="w-100 mb-3">
                                Sign In
                            </Button>
                        )}
                        {showOtpField && (
                            <Button variant="primary" onClick={handleVerifyOtp} className="w-100 mb-3">
                                Valider le code OTP
                            </Button>
                        )}
                        {!showOtpField && (
                            <div className="text-center">
                                <a href="/signup" className="text-decoration-none">Forgot password?</a>
                            </div>
                        )}
                        {!showOtpField && (
                            <div className="social-login mt-4">
                                <p className="text-center mb-3">Or sign in with</p>
                                <div className="d-flex justify-content-center gap-3">
                                    <Button variant="outline-secondary">Google</Button>
                                    <Button variant="outline-secondary">Facebook</Button>
                                </div>
                            </div>
                        )}
                    </Form>
                </div>
                <div className="col-lg-8 d-none d-lg-block p-0">
                    <div className="h-100 image-container">
                        <img
                            src={sombiniainaImage}
                            alt="Login Background"
                            className="login-image w-100 h-100"
                        />
                    </div>
                </div>
            </div>
        </Container>
    );
}

export default LoginForm;