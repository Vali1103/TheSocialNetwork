import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, TextField } from '@mui/material';
import { Route, Routes, Navigate, BrowserRouter } from "react-router-dom";
import Login from './components/Login';
import Register from './components/Register';
import About from './components/About';
import Profile from './components/Profile';
import Feed from './components/Feed';
import Conditions from './components/Conditions';
import Recovery from './components/Recovery';
import Test from './components/test';
import axios from 'axios';
import SettingPage from './components/setting'; // Correctly import the Setting component

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ea00d9',
    },
    secondary: {
      main: '#29b6f6',
    },
    divider: '#0abdc6',
    background: {
      default: '#000000',
      paper: '#000000',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(10deg, #0ABCD6 10%, #EA00D9 90%)',
          border: 0,
          borderRadius: 3,
          boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
          color: 'white',
          fontWeight: 'bold',
          height: 48,
          padding: '0 30px',
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
    },
  },
  spacing: 8,
  typography: {
    fontFamily: '"Orbitron", sans-serif',
  },
});

function App() {
  const [usernames, setUsernames] = useState([]);

  const getUsers = async () => {
    let token = "Bearer " + localStorage.getItem("token");
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    };

    try {
      const responseName = await axios.get("http://127.0.0.1:5001/getUsers", headers);
      if (responseName.data) {
        setUsernames(responseName.data);
        console.log(usernames);
        console.log(responseName.data);
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Navigate replace to={"/login"} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/conditions" element={<Conditions />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/test" element={<Test />} />

          {/* <Route path="/test" element={<test />} /> */}
          <>
            {usernames.map((username, index) => (
              <React.Fragment key={index}>
                <Route path={`/profile/${username}`} element={<Profile profileUsername={username} />} />
                <Route path={`/settings/${username}`} element={<SettingPage profileUsername={username}/>} />
              </React.Fragment>
            ))}
          </>
          <Route path="/feed" element={<Feed />}/>
          
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
