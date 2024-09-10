import React, { useState } from 'react';
import { Box, TextField, InputAdornment, Typography } from '@mui/material';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ButtonPost } from './Button';


const LoginFields = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Box width="100%" sx={{ pt: 24, '& > *': { mb: 3 } }}> {/* Adaugă padding-top la Box pentru a muta conținutul mai jos */}
            <Typography variant="h6" gutterBottom>
                Update Credentials
            </Typography>
            <TextField
                required
                id="standard-old-password-input"
                label="Old Password"
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
            <TextField
                required
                id="standard-new-password-input"
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value.trim()); }}
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
            <ButtonPost
                onClick={() => { console.log('Changing credentials to:', username, newPassword); }}
            />
        </Box>
    );
};

export default LoginFields;
