// App.jsx
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import DashboardLayoutBasic from './components/Demo';
import axios from 'axios';
import ProtectedRoute from './components/ProtectedRoute';
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

function App() {
    return (
        <Router>
            <div style={{ backgroundColor: '#fff4f4' }}>
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='/login' element={<Login />} />
                    {/*<Route path='/' element={<LoginForm/>} />*/}
                    {/*<Route path='/loginform' element={<LoginForm />} />*/}
                    <Route path='/signup' element={<Signup />} />
                    <Route
                        path='/dashboardlayoutbasic'
                        element={
                            <ProtectedRoute>
                                <DashboardLayoutBasic />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

