import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import { Alert, CssBaseline, TextField } from '@mui/material';
import { Route, Routes, Navigate, BrowserRouter, Link as ReachLink } from "react-router-dom";

import { MdOutlineCreate } from "react-icons/md";
import { RiQuestionLine } from "react-icons/ri";
import InputAdornment from '@mui/material/InputAdornment';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import MailIcon from '@mui/icons-material/Mail';
import { HiDotsVertical } from "react-icons/hi";

import { Link } from "react-router-dom";

import { Delete } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  // initializari variabile
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Logica pentru autentificarea prin Gmail
    console.log('Implementează autentificarea prin Gmail aici');
  };
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  let customWidth = '20%';
  if (isMobile) {
    customWidth = '80%;'
  }

  const [progress, setProgress] = useState(0);
  const [gradientProgress, setGradientProgress] = useState(0);
  const [restartGradient, setRestartGradient] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [errorUsername, setErrorUsername] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);
  const [errorLogging, setErrorLogging] = useState(false);


  const updateProgress = () => {
    if (progress <= 200) {
      setProgress(progress + 1);
    }
  };
  const updateGradientProgress = () => {
    if (!restartGradient) {
      setGradientProgress(gradientProgress + 0.1);
    } else {
      setGradientProgress(gradientProgress - 0.1);
    }
    if (gradientProgress >= 200) {
      setRestartGradient(true);
    } else if (gradientProgress <= 0) {
      setRestartGradient(false);
    }
  };

  useEffect(() => {
    updateProgress();
  }, [progress]);

  useEffect(() => {
    updateGradientProgress();
  }, [gradientProgress]);


  const navigate = useNavigate();
  const sendData = () => {
    let validCredentials = true;
    if (username == "") {
      setErrorUsername(true);
      validCredentials = false;
      setTimeout(() => setErrorUsername(false), 3000);
    }

    if (password == "") {
      setErrorPassword(true);
      validCredentials = false;
      setTimeout(() => setErrorPassword(false), 3000);
    }

    if (!validCredentials) {
      return;
    }



    const jsonObject = JSON.parse(
      `{"username": "${username}", "password": "${password}"}`
    );
    axios
      .post("http://127.0.0.1:5001/login", jsonObject,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      .then((response) => {
        localStorage.removeItem("token");
        localStorage.setItem("token", response.data.token);
        navigate(`/profile/${username}`);
      })
      .catch((error) => {
        setErrorLogging(true);
        setTimeout(() => setErrorLogging(false), 3000);
      })
      ;
  };


  return (
    <Box>
      <LinearProgress color="secondary" variant="determinate" value={progress} />
      <LinearProgress variant="determinate" value={progress} />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={2}
        gap={6}
        marginTop={isMobile ? '100px' : '200px'}
      >
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            width: '100%',
            textAlign: 'center',
            p: 2,
            background: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            typography: 'body1',
          }}>
          <Link to="/Conditions" style={{ color: '#FFF', marginTop: '20px', textDecoration: 'none' }}>
            Usage Conditions
          </Link>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 30,
            right: 30,
            p: 2,
            background: `linear-gradient(45deg, #0ABCD6 10%, #EA00D9 ${gradientProgress}%)`,
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            border: '2px solid',
            borderColor: 'primary.main',
            borderRadius: '8px',
            boxShadow: 1,
            zIndex: 'tooltip',
            fontSize: '1rem',
            textAlign: 'center',
          }}
        >
          The Social Network
        </Box>


        <Box
          sx={{
            position: 'fixed',
            top: 100,
            right: 20,
            p: 2,
            background: 'linear-gradient(15deg, #0ABCD6 10%, #EA00D9 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            borderRadius: '0 0 0 8px',
            boxShadow: 1,
            zIndex: 1100,
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '1rem',
            textAlign: 'center',
          }}
        >
        </Box>



        <Typography variant={isMobile ? 'h2' : 'h1'} sx={{
          background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}>
          Login
        </Typography>

        {/* Username and Password Fields */}
        <Box width={customWidth}>
          <TextField id="standard-basic"
            required
            error={errorUsername}
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => { setUsername(e.target.value.trim()); }} />

          <TextField
            required
            error={errorPassword}
            id="standard-password-input"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value.trim()); }}
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <span style={{ cursor: 'pointer' }} onClick={() => { setShowPassword(!showPassword) }}>
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={() => { sendData() }}
          >
            Sign In
          </Button>

          {/* Buttons Row */}
          <Box display="flex" justifyContent="space-between" width="100%" sx={{ mt: 1 }}>
            <Box width="50%" >
              <Link to="/register" style={{ textDecoration: 'none', display: 'block' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  fullWidth
                >
                  <MdOutlineCreate />
                  Sign Up
                </Button>
              </Link>
            </Box>
            <Box width="50%">
              <Link to="/Recovery" style={{ textDecoration: 'none', display: 'block' }}>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                >
                  <RiQuestionLine />
                  Forgot Password
                </Button>
              </Link>
            </Box>
          </Box>
          {errorUsername && (
            <Alert variant="outlined" severity="error" sx={{ mt: 1 }}>
              Please insert a valid username
            </Alert>)}
          {errorPassword && (
            <Alert variant="outlined" severity="error" sx={{ mt: 1 }}>
              Please insert a valid password
            </Alert>)}
          {errorLogging && (
            <Alert variant="outlined" severity="error" sx={{ mt: 1 }}>
              Wrong username or password
            </Alert>)}
        </Box>
        {/* Textul "About Us"*/}
        {/* <Link to="/about" style={{ color: '#FFF', marginTop: '20px', textDecoration: 'none' }}>
          About Us
        </Link> */}
      </Box>
    </Box>
  );
}


export default Login;