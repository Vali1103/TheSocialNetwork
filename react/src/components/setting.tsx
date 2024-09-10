import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import { FiMenu } from "react-icons/fi";
import { CiUser } from "react-icons/ci";
import { IoLogInOutline } from "react-icons/io5";
import SearchBar from './SearchBar';
import './file2.css';

import axios from 'axios';


const toggleSidebar = () => {
  console.log('Sidebar toggled');
};

const onClick = (item: HTMLButtonElement, subMenus: NodeListOf<HTMLDivElement>, buttons: NodeListOf<HTMLButtonElement>) => {
  subMenus.forEach(menu => {
    menu.style.height = "0px";
  });
  buttons.forEach(button => {
    button.classList.remove("active");
  });

  if (!item.nextElementSibling) {
    item.classList.add("active");
    return;
  }

  const subMenu = item.nextElementSibling as HTMLDivElement;
  const ul = subMenu.querySelector("ul") as HTMLUListElement;

  if (!subMenu.clientHeight) {
    subMenu.style.height = `${ul.clientHeight}px`;
    item.classList.add("active");
  } else {
    subMenu.style.height = "0px";
    item.classList.remove("active");
  }
};

interface settingProps {
  profileUsername: string;
}

const Setting: React.FC<settingProps> = ({profileUsername}) => {  
  const [username, setUsername] = useState(profileUsername);
  const [newUsername, setNewUsername] = useState('');
  const [deleteUsername, setDeleteUsername] = useState('');
  const [deletePassword, setDeletePassword] = useState(''); // Adăugat
  const [deleteEmail, setDeleteEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('myEmail@gmail.com');
  const [newEmail, setNewEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showForm2, setShowFormDelete] = useState(false);
  const [showForm21, setShowFormDelete1] = useState(false);
  const [showFormChangePassword, setShowFormChangePassword] = useState(false);
  const [showFormResetPassword, setShowFormResetPassword] = useState(false);
  const [showFormEmail, setShowFormEmail] = useState(false);
  const [showFormSecurityQuestion, setShowFormSecurityQuestion] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
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

  let customWidth = '20%';
  if (isMobile) {
    customWidth = '80%';
  }

  const sendData = () => {  
    const jsonObject = JSON.parse(
      `{"old_username": "${username}", "new_username": "${newUsername}"}`
    );
  
    axios
      .post("http://127.0.0.1:5001/change_username", jsonObject, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        console.log("Change Username: " + response);
        setUsername(newUsername);  // Update the username in state if needed
      })
      .catch((error) => {
        console.log("ERROR: username was taken");
        // Handle error here
      });
  };
  

  const confirmDelete = () => {
    setShowFormDelete1(true);
    setShowFormDelete(false);
  };

  const sendDelete = () => {  
    const jsonObject = JSON.parse(
      `{"username": "${deleteUsername}", "password": "${deletePassword}"}`
    );

    axios
      .post("http://127.0.0.1:5001/delete_user", jsonObject, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        console.log("User deleted: " + response);
        // Handle successful deletion, e.g., redirect or update UI
        setShowFormDelete1(false);
        setDeleteUsername('');
        setDeletePassword('');
      })
      .catch((error) => {
        console.log("ERROR: Unable to delete user");
        // Handle error here
      });
  };
  

  const changePassword = () => {
    const jsonObject = JSON.parse(
      `{"username": "${username}", "old_password": "${oldPassword}", "new_password": "${newPassword}"}`
    );
  
    axios
      .post("http://127.0.0.1:5001/change_password", jsonObject, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        console.log("Password changed: " + response);
        // Handle successful password change, e.g., show a message or update UI
        setOldPassword('');
        setNewPassword('');
        setShowFormChangePassword(false);
      })
      .catch((error) => {
        console.log("ERROR: Unable to change password");
        // Handle error here
      });
  };
  

  const confirmResetPassword = () => {
    console.log('Password reset requested');
  };

  const updateEmail = () => {
    console.log('Email update requested:', { newEmail });
    setEmail(newEmail);
    setShowFormEmail(false);
  };

  const updateSecurityQuestion = () => {
    const jsonObject = {
      question: securityQuestion,
      answer: securityAnswer,
    };
  
    axios
      .post("http://127.0.0.1:5001/update_security_question", jsonObject, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then((response) => {
        console.log("Security question updated: " + response);
        setShowFormSecurityQuestion(false);
      })
      .catch((error) => {
        console.log("ERROR: Unable to update security question");
      });
  };

  

  useEffect(() => {
    const subMenus = document.querySelectorAll<HTMLDivElement>(".sub-menu");
    const buttons = document.querySelectorAll<HTMLButtonElement>(".sidebar ul button");

    buttons.forEach(button => {
      button.addEventListener('click', () => onClick(button, subMenus, buttons));
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowForm(false);
        setShowFormDelete(false);
        setShowFormDelete1(false);
        setShowFormChangePassword(false);
        setShowFormResetPassword(false);
        setShowFormEmail(false);
        setShowFormSecurityQuestion(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('click', () => onClick(button, subMenus, buttons));
      });
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="component-container">
      <SearchBar />
      <aside className="sidebar">
        <header>
          <button type='button' onClick={toggleSidebar}>
            <span><FiMenu />Menu</span>
          </button>
        </header>
        <ul>
          <li>
            <button type="button">
              <span>Username</span>
            </button>
            <div className="sub-menu">
              <ul>
                <li><button type="button" onClick={() => setShowForm(true)}>Edit Username</button></li>
                <li><button type="button" onClick={() => setShowFormDelete(true)}>Delete Username</button></li>
              </ul>
            </div>
          </li>
          <li>
            <button type="button">
              <p>Password</p>
            </button>
            <div className="sub-menu">
              <ul>
                <li><button type="button" onClick={() => setShowFormChangePassword(true)}>Change Password</button></li>
                <li><button type="button" onClick={() => setShowFormResetPassword(true)}>Reset Password</button></li>
              </ul>
            </div>
          </li>
          <li>
            <button type="button">
              <span>Email</span>
            </button>
            <div className="sub-menu">
              <ul>
                <li><button type="button" onClick={() => setShowFormEmail(true)}>Edit Email</button></li>
                <li><button type="button" onClick={() => setShowFormSecurityQuestion(true)}>More Options</button></li>
              </ul>
            </div>
          </li>
          <li>
            <Link to="/login" className="sidebar-button">
              <span><IoLogInOutline />Log Out</span>
            </Link>
          </li>
        </ul>
      </aside>
      {showForm && (
        <div className="form-overlay">
          <Box width={customWidth} className="form-container">
            <IconButton
              aria-label="close"
              onClick={() => setShowForm(false)}
              style={{
                position: 'absolute',
                top: 200,
                right: 600,
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              className="non-editable-box"
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.9)',
                borderRadius: '4px',
                padding: '16.5px 14px',
                backgroundColor: '#130832',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '16px'
              }}
            >
              {username}
            </Box>
            <TextField
              required
              id="standard-username-input"
              label="New Username"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value.trim())}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              onClick={sendData}
            >
              Change My Username
            </Button>
          </Box>
        </div>
      )}
      {showForm2 && (
        <div className="form-overlay">
          <Box width={customWidth} className="form-container">
            <IconButton
              aria-label="close"
              onClick={() => setShowFormDelete(false)}
              style={{
                position: 'absolute',
                top: 200,
                right: 600,
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant='h6'
              sx={{
                background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textAlign: 'center',
                padding: '8px 0'
              }}>
              Are you sure you want to close this Account?
            </Typography>
            <Typography variant='h6'
              sx={{
                background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textAlign: 'center',
                padding: '8px 0'
              }}>
              All your posts and data will be deleted
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              onClick={confirmDelete}
            >
              Delete!
            </Button>
          </Box>
        </div>
      )}
      {showForm21 && (
        <div className="form-overlay">
          <Box width={customWidth} className="form-container">
            <IconButton
              aria-label="close"
              onClick={() => setShowFormDelete1(false)}
              style={{
                position: 'absolute',
                top: 200,
                right: 600,
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <CloseIcon />
            </IconButton>
            <TextField
              required
              id="delete-username-input"
              label="Username"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              value={deleteUsername}
              onChange={(e) => setDeleteUsername(e.target.value.trim())}
            />
            <TextField
              required
              id="delete-password-input"
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value.trim())}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              onClick={sendDelete}
            >
              Confirm Delete
            </Button>
          </Box>
        </div>
      )}

      {showFormChangePassword && (
        <div className="form-overlay">
          <Box width={customWidth} className="form-container">
            <IconButton
              aria-label="close"
              onClick={() => setShowFormChangePassword(false)}
              style={{
                position: 'absolute',
                top: 200,
                right: 600,
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <CloseIcon />
            </IconButton>
            <TextField
              required
              id="old-password-input"
              label="Old Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value.trim())}
            />
            <TextField
              required
              id="new-password-input"
              label="New Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value.trim())}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              onClick={changePassword}
            >
              Change Password
            </Button>
          </Box>
        </div>
      )}

      {showFormResetPassword && (
        <div className="form-overlay">
          <Box width={customWidth} className="form-container">
            <IconButton
              aria-label="close"
              onClick={() => setShowFormResetPassword(false)}
              style={{
                position: 'absolute',
                top: 200,
                right: 600,
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant='h6'
              sx={{
                background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textAlign: 'center',
                padding: '8px 0'
              }}>
              Are you sure you want to reset your password?
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              onClick={confirmResetPassword}
            >
              Reset Password
            </Button>
          </Box>
        </div>
      )}
      {showFormEmail && (
        <div className="form-overlay">
          <Box width={customWidth} className="form-container">
            <IconButton
              aria-label="close"
              onClick={() => setShowFormEmail(false)}
              style={{
                position: 'absolute',
                top: 200,
                right: 600,
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              className="non-editable-box"
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.9)',
                borderRadius: '4px',
                padding: '16.5px 14px',
                backgroundColor: '#130832',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '16px'
              }}
            >
              {email}
            </Box>
            <TextField
              required
              id="new-email-input"
              label="New Email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value.trim())}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              onClick={updateEmail}
            >
              Update Email
            </Button>
          </Box>
        </div>
      )}
      {showFormSecurityQuestion && (
        <div className="form-overlay">
            <Box width={customWidth} className="form-container">
                <IconButton
                    aria-label="close"
                    onClick={() => setShowFormSecurityQuestion(false)}
                    style={{
                        position: 'absolute',
                        top: 200,
                        right: 600,
                        color: 'rgba(255, 255, 255, 0.9)'
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <TextField
                    required
                    id="security-question-input"
                    label="Security Question"
                    type="text"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value.trim())}
                />
                <TextField
                    required
                    id="security-answer-input"
                    label="Security Answer"
                    type="text"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value.trim())}
                />
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={updateSecurityQuestion}
                >
                    Update Security Question
                </Button>
            </Box>
        </div>
    )}


    </div>
  );
};

export default Setting;