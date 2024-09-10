import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import { TiTick, TiCancel } from "react-icons/ti";
import axios from 'axios';
import './feed.css';

interface FixedSidebarProps {
  profileUsername: string;
}

type FriendRequest = {
  username: string;
};

const FriendRequestsSidebar: React.FC<FixedSidebarProps> = ({ profileUsername }) => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prevProgress => (prevProgress >= 100 ? 0 : prevProgress + 1));
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  const fetchFriendRequests = async () => {
    const token = "Bearer " + localStorage.getItem("token");
    const headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    };

    try {
      const response = await axios.get("http://127.0.0.1:5001/get_list_requests", headers);
      if (response.data.result) {
        const requests = response.data.result.map((username: string) => ({ username }));
        setFriendRequests(requests);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const acceptFriend = async (friendUsername: string) => {
    const token = "Bearer " + localStorage.getItem("token");
    const jsonObject = { friend_username: friendUsername };
    const headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    };

    try {
      const response = await axios.post("http://127.0.0.1:5001/accept_friend_request", jsonObject, headers);
      if (response.data) {
        console.log(response);
        setFriendRequests(prevRequests => prevRequests.filter(request => request.username !== friendUsername));
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const cancelFriend = async (friendUsername: string) => {
    const token = "Bearer " + localStorage.getItem("token");
    const jsonObject = { friend_username: friendUsername };
    const headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    };

    try {
      const response = await axios.post("http://127.0.0.1:5001/cancel_friend_request", jsonObject, headers);
      if (response.data) {
        console.log(response);
        setFriendRequests(prevRequests => prevRequests.filter(request => request.username !== friendUsername));
      }
    } catch (error) {
      console.error("Error canceling friend request:", error);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  return (
    <Box className="friend-requests-sidebar" p={2}  sx={{ bgcolor: '#222222', borderRadius: '8px' }}>
      <Typography variant="h5" mb={2} color="#5570c9">
        Friend Requests:
      </Typography>
      {/* <LinearProgress color="secondary" variant="determinate" value={progress} sx={{ mb: 2 }} /> */}

      {friendRequests.length > 0 ? (
        friendRequests.map((request, index) => (
          <Box key={index} display="flex" alignItems="center" justifyContent="space-between" width="100%" mt={2}>
            <Avatar sx={{ bgcolor: '#0ABCD6', mr: 2 }}>
              {request.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body1" color="#5570c9" flexGrow={1}>
              {request.username}
            </Typography>
            <Box display="flex" alignItems="center">
              <TiTick
                size={30}
                style={{
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease-in-out',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                onClick={() => acceptFriend(request.username)}
              />
              <TiCancel
                size={30}
                style={{
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease-in-out',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                onClick={() => cancelFriend(request.username)}
              />
            </Box>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="white" mt={2}>
          No friend requests
        </Typography>
      )}
    </Box>
  );
};

export default FriendRequestsSidebar;
