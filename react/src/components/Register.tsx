import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { Alert, CssBaseline, Icon, InputAdornment, InputLabel, TextField } from '@mui/material';
import { Route, Routes, Navigate, BrowserRouter, Link as ReachLink } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import axios from 'axios';


function Register() {
  const [mail, setMail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorFields, setErrorFields] = useState(false);
  const [errorConfirmPassword, setErrorConfirmPassword] = useState(false);
  const [errorRegister, setErrorRegister] = useState(false);
  const [successRegister, setSuccessRegister] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  let customWidth = '20%';
  if (isMobile) {
    customWidth = '80%;'
  }

  const sendData = () => {

    let validCredentials = true;
    if (username == "" || password == "" || confirmPassword == "" || mail == "") {
      setErrorFields(true);
      validCredentials = false;
      setTimeout(() => setErrorFields(false), 3000);
    }

    if (password !== confirmPassword) {
      setErrorConfirmPassword(true);
      validCredentials = false;
      setTimeout(() => setErrorConfirmPassword(false), 3000);
    }

    if (!validCredentials) {
      return;
    }


    const jsonObject = JSON.parse(
      `{"username": "${username}", "password": "${password}"}`
    );
    axios
      .put("http://127.0.0.1:5001/register", jsonObject,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      .then((response) => {
        console.log("Register: " + response);
        setSuccessRegister(true);
        setTimeout(() => setSuccessRegister(false), 3000);

      })
      .catch((error) => {
        setErrorRegister(true);
        setTimeout(() => setErrorRegister(false), 3000);
      })
      ;
  };


  const [progress, setProgress] = useState(0);
  const [gradientProgress, setGradientProgress] = useState(0);
  const [restartGradient, setRestartGradient] = useState(false);

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


  return (

    <Box>
      <LinearProgress color="secondary" variant="determinate" value={progress} />
      <LinearProgress variant="determinate" value={progress} />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        p={2}
        gap={6}
        marginTop={isMobile ? '100px' : '150px'}
      >
        <ReachLink to="/">

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

        </ReachLink>
        <Typography variant={isMobile ? 'h2' : 'h1'} sx={{
          background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}>
          Register
        </Typography>

        <Box flexDirection="column" width={customWidth}>
          <TextField required id="standard-basic"
            label="Mail" variant="outlined" fullWidth
            error={errorFields}
            value={mail}
            onChange={(e) => { setMail(e.target.value.trim()); }}
          />
          <TextField required id="standard-basic"
            label="Username" variant="outlined" fullWidth
            error={errorFields}
            value={username}
            margin="normal"
            onChange={(e) => { setUsername(e.target.value.trim()); }} />
          <TextField
            required
            id="standard-password-input"
            label="Password"
            error={errorFields || errorConfirmPassword}

            type={showPassword ? 'text' : 'password'}
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
          <TextField
            required
            id="standard-password-input"
            label="Confirm password"
            error={errorFields || errorConfirmPassword}
            margin="normal"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value.trim()); }}
            variant="outlined"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <span style={{ cursor: 'pointer' }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </InputAdornment>
              ),
            }}
          />


          <Button fullWidth onClick={() => { sendData() }}>Submit</Button>
          <ReachLink to="/login">
            <Button fullWidth sx={{ mt: 1 }}>Login</Button>
          </ReachLink>
          {successRegister && (
            <Alert variant="outlined" severity="success" sx={{ mt: 1 }}>
              Your account was created
            </Alert>)}
          {errorFields && (
            <Alert variant="outlined" severity="error" sx={{ mt: 1 }}>
              Please complete all fields
            </Alert>)}
          {errorConfirmPassword && !errorFields && (
            <Alert variant="outlined" severity="error" sx={{ mt: 1 }}>
              Password and confirm password do not match
            </Alert>)}
            {errorRegister && (
            <Alert variant="outlined" severity="error" sx={{ mt: 1 }}>
              Account username already taken
            </Alert>)}
        </Box>

      </Box>
    </Box>
  );
}

export default Register;