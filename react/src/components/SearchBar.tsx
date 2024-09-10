import React, { useEffect, useState } from 'react';
import { Box, TextField, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IoSettingsSharp } from "react-icons/io5";
import axios from 'axios';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const getCurrentUsername = async () => {
    let token = "Bearer " + localStorage.getItem("token");
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    try {
      const responseName = await axios.get("http://127.0.0.1:5001/getUsername", headers);
      if (responseName.data) {
        setUsername(responseName.data.username);
      }
    } catch (error) {
      console.log(error);
      navigate('/login');
      return;
    }
  };

  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);

  const getProfileImage = async () => {
    if (username) {
      let token = "Bearer " + localStorage.getItem("token");
      let headers = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      };

      try {
        const responseProfileImage = await axios.get(`http://127.0.0.1:5001/get/profile_image?username=${username}`, headers);
        if (responseProfileImage.data.value) {
          setProfileImage(responseProfileImage.data.value)
        } else {
          setProfileImage("")
        }
      } catch (error) {
        console.log(error);

      }

    }
  };

  useEffect(() => {
    getProfileImage();
  }, [username]);

  const [usernames, setUsernames] = useState([]);

  const getUsers = async () => {
    let token = "Bearer " + localStorage.getItem("token");
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    try {
      const responseName = await axios.get("http://127.0.0.1:5001/getUsers", headers);
      if (responseName.data) {
        setUsernames(responseName.data);
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  useEffect(() => {
    getCurrentUsername();
    getUsers();
  }, []);


  const handleQuery = () => {

    if (query) {
      const filteredResults = usernames.filter((username: any) =>
        username.toString().toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
      setResults(filteredResults);
    } else {
      setResults([]);
    }
  };

  useEffect(() => {
    handleQuery();

  }, [query]);

  const handleAccessUser = (username: string) => {

    setQuery("");
    setResults([]);
    navigate(`/profile/${username}`)

  };

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = (event: any) => {
    if (event.key === 'ArrowDown') {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      setSelectedIndex((prevIndex) => (prevIndex - 1 + results.length) % results.length);
    } else if (event.key === 'Enter' && selectedIndex !== -1) {
      handleAccessUser(results[selectedIndex]);
    }
  };


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, results]);


  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  return (
    <Box
      width="100%"
      height="5%"
      sx={{
        background: '#222222',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        zIndex: 9999,
        top: 0,
        userSelect: 'none',
      }}
    >
<Box
      sx={{
      
        position: 'absolute',
        left: 20,
        p: 2,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: 'auto',
      }}
    >
      <Box
        sx={{
          cursor: 'pointer',
          transition: 'opacity 0.3s ease-in-out',
          '&:hover': {
            opacity: 0.6,
          },
          background: 'linear-gradient(45deg, #0ABCD6 10%, #EA00D9 60%)',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          zIndex: 'tooltip',
          fontSize: '1rem',
          mr: 1, // Add some margin to the right for spacing
        }}
        onClick={() => navigate('/feed')}
      >
        The Social Network
      </Box>
      <IoSettingsSharp style={{ fontSize: '1.5rem'  }} onClick={() => navigate(`/settings/${username}`)} />
    </Box>

      <Box
        height="10%"
        width="30%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        position="relative"
      >
        <TextField
          value={query}
          onChange={(e) => { setQuery(e.target.value) }}
          variant="outlined"
          placeholder="Search..."
          fullWidth
          size="small"
        />
        {results.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '100%',
              width: '100%',
              bgcolor: '#1e1e1e',
              backdropFilter: 'blur(100px)',
              border: '1px solid #29b6f6',
              borderRadius: '4px',
              mt: 3,
              zIndex: 1000,
            }}
          >
            {results.map((result: string, index) => (
              <Box
                key={index}
                p={2}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: selectedIndex === index ? '#222222' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#222222',
                  },
                }}
                onClick={() => handleAccessUser(result)}
              >
                {result}
              </Box>
            ))}
          </Box>
        )}
      </Box>


      <Avatar
        // alt="?"
        src={`data:image/jpeg;base64,${profileImage}`}
        sx={{
          cursor: 'pointer',
          transition: 'opacity 0.3s ease-in-out',
          '&:hover': {
            opacity: 0.6,
          },
          position: 'absolute',
          right: 20,
        }}
        onClick={() => navigate(`/profile/${username}`)}
      />
    </Box>
  );
};

export default SearchBar;
