import React, { useEffect, useState, ChangeEvent } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { Card } from './Card';
import SearchBar from './SearchBar';
import { Box, TextField, IconButton, InputAdornment, Avatar } from '@mui/material';
import { CiSearch } from "react-icons/ci";
import axios from 'axios';
import { IoMdPersonAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { TiTick } from "react-icons/ti";
import { TiCancel } from "react-icons/ti";
import { TiTrash } from "react-icons/ti";

interface ProfileProps {
  profileUsername: string;
}

const Profile: React.FC<ProfileProps> = ({ profileUsername }) => {
  const [editInfo, setEditInfo] = useState([
    { editing: false, label: 'Name', value: '' },
    { editing: false, label: 'About', value: '' },
    { editing: false, label: 'Gender', value: '' },
    { editing: false, label: 'Age', value: '' },
    { editing: false, label: 'Location', value: '' },
  ]);

  const [showContent, setShowContent] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gradientProgress, setGradientProgress] = useState(0);
  const [restartGradient, setRestartGradient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [searchValue, setSearchValue] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  // const [filteredFriends, setFilteredFriends] = useState(Friends.slice(0, 4));
  const navigate = useNavigate();

  // const handleSearch = (searchValue: string) => {
  //   setSearchValue(searchValue);
  //   const filtered = Friends.filter(friend => friend.name.toLowerCase().includes(searchValue.toLowerCase())).slice(0, 4);
  //   setFilteredFriends(filtered);
  // };

  const updateProgress = () => {
    if (progress <= 200) {
      setProgress(progress + 1);
    }
  };

  const updateGradientProgress = () => {
    if (!restartGradient) {
      setGradientProgress(gradientProgress + 0.01);
    } else {
      setGradientProgress(gradientProgress - 0.01);
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

  const handleEditToggle = (index: number) => {
    const newEditDesc = [...editInfo];
    newEditDesc[index].editing = !newEditDesc[index].editing;
    setEditInfo(newEditDesc);
  };

  const handleTextChange = (index: number, event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newEditDesc = [...editInfo];
    newEditDesc[index].value = event.target.value;
    setEditInfo(newEditDesc);
  };


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
        setUsername(responseName.data.username)
      }

    } catch (error) {
      console.log(error)
      navigate('/login');
      return;
    }
  };

  useEffect(() => {
    getCurrentUsername();
  }, []);

  const getData = async () => {
    let token = "Bearer " + localStorage.getItem("token");
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    try {
      const newEditDesc = [
        { editing: false, label: 'Name', value: '' },
        { editing: false, label: 'About', value: '' },
        { editing: false, label: 'Gender', value: '' },
        { editing: false, label: 'Age', value: '' },
        { editing: false, label: 'Location', value: '' },
      ];
      const responseName = await axios.get(`http://127.0.0.1:5001/get/name?username=${profileUsername}`, headers);
      if (responseName.data.value) {
        newEditDesc[0].value = responseName.data.value;
      }

      const responseAbout = await axios.get(`http://127.0.0.1:5001/get/about?username=${profileUsername}`, headers);
      if (responseAbout.data.value) {
        newEditDesc[1].value = responseAbout.data.value;
      }

      const responseGender = await axios.get(`http://127.0.0.1:5001/get/gender?username=${profileUsername}`, headers);
      if (responseGender.data.value) {
        newEditDesc[2].value = responseGender.data.value;
      }

      const responseAge = await axios.get(`http://127.0.0.1:5001/get/age?username=${profileUsername}`, headers);
      if (responseAge.data.value) {
        newEditDesc[3].value = responseAge.data.value;
      }

      const responseLocation = await axios.get(`http://127.0.0.1:5001/get/location?username=${profileUsername}`, headers);
      if (responseLocation.data.value) {
        newEditDesc[4].value = responseLocation.data.value;
      }

      const responseProfileImage = await axios.get(`http://127.0.0.1:5001/get/profile_image?username=${profileUsername}`, headers);
      if (responseProfileImage.data.value) {
        setProfileImage(responseProfileImage.data.value)
      } else {
        setProfileImage("")
      }

      const responseCoverImage = await axios.get(`http://127.0.0.1:5001/get/cover_image?username=${profileUsername}`, headers);
      if (responseCoverImage.data.value) {
        setCoverImage(responseCoverImage.data.value)
      } else {
        setCoverImage('/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2ODApLCBxdWFsaXR5ID0gOTkK/9sAQwABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQECAgEBAgEBAQICAgICAgICAgECAgICAgICAgIC/9sAQwEBAQEBAQEBAQEBAgEBAQICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC/8AAEQgC0AUAAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8AKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9k=')
      }

      const responseFriendsRequest = await axios.get(`http://127.0.0.1:5001/get_list_requests`, headers);
      console.log(responseFriendsRequest.data.result);
      if (responseFriendsRequest.data.result) {
        setFriendRequests(responseFriendsRequest.data.result);
      }

      const responseFriends = await axios.get(`http://127.0.0.1:5001/get_friends_request`, headers);
      console.log(responseFriends.data.result);
      if (responseFriends.data.result) {
        setFriends(responseFriends.data.result);
      }

      setEditInfo(newEditDesc);
      setShowContent(true);

    } catch (error) {
      setShowContent(false);
      navigate('/login');
    }
  };

  const changeData = (index: number) => {
    let apiName = ['name', 'about', 'gender', 'age', 'location'];
    let key = apiName[index];
    let pathName = 'change_' + apiName[index];
    const jsonObject = JSON.parse(
      `{"${key}": "${editInfo[index].value}"}`
    );
    let token = "Bearer " + localStorage.getItem("token");
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };
    axios
      .post(`http://127.0.0.1:5001/${pathName}`, jsonObject, headers);
  }


  const changeImage = async (e: any, index: number) => {
    let apiName = ['cover_image', 'profile_image'];
    let pathName = 'change_' + apiName[index];
    let key = apiName[index];
    let image;
    if (e.target.files && e.target.files[0]) {
      image = e.target.files[0];
    }
    if (image) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        let token = "Bearer " + localStorage.getItem("token");
        let headers = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        };
        const jsonObject = JSON.parse(
          `{"${key}": "${base64Image}"}`
        );
        const response = await axios.post(`http://127.0.0.1:5001/${pathName}`, jsonObject, headers);
        if (response.data.status === 'OK') {
          if (index == 0) {
            setCoverImage(base64Image);
          } else {
            setProfileImage(base64Image);
          }
        }
      };
    }
  };


  const [profileImage, setProfileImage] = useState<string | undefined>("");
  const [coverImage, setCoverImage] = useState<string | undefined>("");

  useEffect(() => {
    getData();
  }, [navigate, profileUsername]);


  const addFriend = async () => {
    let token = "Bearer " + localStorage.getItem("token");
    const jsonObject = JSON.parse(
      `{"friend_username": "${profileUsername}"}`
    );
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    try {
      const response = await axios.post("http://127.0.0.1:5001/add_friend_request", jsonObject, headers);
      if (response.data) {
        console.log(response)
      }

    } catch (error) {
      console.log(error)
    }
  };

  const acceptFriend = async (friendUsername: string) => {
    let token = "Bearer " + localStorage.getItem("token");
    const jsonObject = JSON.parse(
      `{"friend_username": "${friendUsername}"}`
    );
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    try {
      const response = await axios.post("http://127.0.0.1:5001/accept_friend_request", jsonObject, headers);
      if (response.data) {
        console.log(response)
      }

    } catch (error) {
      console.log(error)
    }
  };

  const cancelFriend = async (friendUsername: string) => {
    let token = "Bearer " + localStorage.getItem("token");
    const jsonObject = JSON.parse(
      `{"friend_username": "${friendUsername}"}`
    );
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    try {
      const response = await axios.post("http://127.0.0.1:5001/cancel_friend_request", jsonObject, headers);
      if (response.data) {
        console.log(response)
      }

    } catch (error) {
      console.log(error)
    }
  };

  const deleteFriend = async (friendUsername: string) => {
    let token = "Bearer " + localStorage.getItem("token");
    const jsonObject = JSON.parse(
      `{"friend_username": "${friendUsername}"}`
    );
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    };

    try {
      const response = await axios.post("http://127.0.0.1:5001/delete_friend_request", jsonObject, headers);
      if (response.data) {
        console.log(response)
      }

    } catch (error) {
      console.log(error)
    }
  };


  let isThisMyProfile = username == profileUsername;

  return (
    <div>
      <Box>
        <SearchBar />
        {showContent && (

          <>

            {isThisMyProfile ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                p={2}
              >
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  p={2}
                >
                  <Box sx={{ position: 'relative', display: 'inline-block', userSelect: 'none', }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { changeImage(e, 0) }} id="upload-cover" />
                    <label htmlFor="upload-cover">
                      <img
                        alt="Cover"
                        src={`data:image/jpeg;base64,${coverImage}`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          opacity: isHovered ? 0.6 : 1,
                          transition: 'opacity 0.3s ease-in-out',
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      />
                    </label>
                    <Box
                      p={2}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        position: 'absolute',
                        bottom: 40,
                        left: 40,
                        background: '#222222',
                      }}
                    >
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { changeImage(e, 1) }} id="upload-profile" />
                      <label htmlFor="upload-profile">
                        <Avatar

                          src={`data:image/jpeg;base64,${profileImage}`}
                          sx={{
                            width: 150,
                            height: 150,
                            cursor: 'pointer',
                            transition: 'opacity 0.3s ease-in-out',
                            '&:hover': {
                              opacity: 0.6,
                            },
                          }}
                        />
                      </label>
                      <Typography
                        variant='h2'
                        p={2}
                        sx={{
                          background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                        }} >
                        {editInfo[0].value}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box
                  display="flex" justifyContent="space-between"
                  width="1280px"
                >

                  <Box bgcolor="#222222"
                    display="flex"
                    flexDirection="column"
                    alignItems="left"
                    justifyContent="flex-start"
                    width="40%"
                    p={2}
                    gap={4}
                    sx={{
                      userSelect: 'none',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    <Typography variant="h4"
                      p={1}
                      className="posts-title"
                      sx={{
                        background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                      }}>
                      Description
                    </Typography>

                    {editInfo.map((item, index) => (
                      <div key={index}>
                        {!item.editing ? (
                          <Typography
                            onClick={() => handleEditToggle(index)}
                            variant="h5"
                            sx={{
                              cursor: 'pointer',
                              transition: 'opacity 0.3s ease-in-out',
                              '&:hover': {
                                opacity: 0.6,
                              },
                            }}
                          >
                            {item.label}: {item.value}
                          </Typography>
                        ) : (
                          <Box display="flex" flexDirection="column">
                            <TextField
                              id={`outlined-basic-${index}`}
                              label={item.label}
                              multiline
                              variant="outlined"
                              value={item.value}
                              onChange={(event) => handleTextChange(index, event)}
                            />
                            <Button fullWidth onClick={() => { handleEditToggle(index); changeData(index); }}>
                              Save
                            </Button>
                          </Box>
                        )}
                        {index % 2 === 0 ? (
                          <LinearProgress color="secondary" variant="determinate" value={progress} />
                        ) : (
                          <LinearProgress variant="determinate" value={progress} />
                        )}
                      </div>
                    ))}

                    <Typography variant="h4"
                      p={1}
                      className="posts-title"
                      sx={{
                        background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mt: 4,
                      }}>
                      Friends List
                    </Typography>
                    <TextField
                      variant="outlined"
                      placeholder="Search..."
                      fullWidth
                      size='small'
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              color="primary"
                            >
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    // onChange={(e) => handleSearch(e.target.value)}
                    />

                    {friends
                      .filter(friend => friend !== "")  // Filtrează prietenii cu nume gol
                      .map((friend, index) => (
                        <div key={index}>
                          <Box
                            display='flex'
                            flexDirection='row'
                            alignItems='center'
                            justifyContent='space-between' // asigură spațierea între text și iconiță
                            sx={{ width: '100%' }} // asigură că box-ul ocupă lățimea completă
                          >
                            <Typography
                              variant="h5"
                              sx={{
                                cursor: 'pointer',
                                transition: 'opacity 0.3s ease-in-out',
                                '&:hover': {
                                  opacity: 0.6,
                                },
                              }}
                              onClick={() => {navigate(`/profile/${friend}`)}}
                            >
                              {friend}
                            </Typography>
                            <TiTrash
                              size={30}
                              style={{
                                cursor: 'pointer',
                                transition: 'opacity 0.3s ease-in-out',
                              }}
                              onClick={() => deleteFriend(friend)}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            />
                          </Box>
                          {index % 2 === 0 ? (
                            <LinearProgress color="secondary" variant="determinate" value={progress} />
                          ) : (
                            <LinearProgress variant="determinate" value={progress} />
                          )}
                        </div>
                      ))}


                    <Typography variant="h4"
                      p={1}
                      className="posts-title"
                      sx={{
                        background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mt: 4,
                      }}>
                      Friends Requests
                    </Typography>

                    {friendRequests.map((friend, index) => (
                      <div key={index}>
                        <Box
                          key={index}
                          display='flex'
                          flexDirection='row'
                          alignItems='center'
                          justifyContent='space-between'  // asigură spațierea între text și iconiță
                          sx={{ width: '100%' }}  // asigură că box-ul ocupă lățimea completă
                        >
                          <Typography
                            variant="h5"
                            sx={{
                              cursor: 'pointer',
                              transition: 'opacity 0.3s ease-in-out',
                              '&:hover': {
                                opacity: 0.6,
                              },
                            }}
                            onClick={() => {navigate(`/profile/${friend}`)}}
                          >
                            {friend}
                          </Typography>
                          <TiTick
                            size={30}
                            style={{
                              marginLeft: 'auto',
                              cursor: 'pointer',
                              transition: 'opacity 0.3s ease-in-out',
                            }}
                            onClick={() => acceptFriend(friend)}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          />
                          <TiCancel size={30}
                            style={{
                              cursor: 'pointer',
                              transition: 'opacity 0.3s ease-in-out',
                            }}
                            onClick={() => cancelFriend(friend)}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'} />
                        </Box>
                        {index % 2 === 0 ? (
                          <LinearProgress color="secondary" variant="determinate" value={progress} />
                        ) : (
                          <LinearProgress variant="determinate" value={progress} />
                        )}
                      </div>
                    ))}

                  </Box>

                  <Box
                    bgcolor="#222222"
                    display="flex"
                    flexDirection="column"
                    alignItems="left"
                    justifyContent="flex-start"
                    marginLeft="10px"
                    width="60%"
                    p={2}
                    sx={{ height: '100vh', overflowY: 'auto' }}
                  >
                    <Card isThisMyProfile={isThisMyProfile} username={profileUsername} />
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                p={2}
              >
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  p={2}
                >
                  <Box sx={{ position: 'relative', display: 'inline-block', userSelect: 'none', }}>
                    <img
                      alt="Cover"
                      src={`data:image/jpeg;base64,${coverImage}`}
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    />
                    <Box
                      p={2}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        position: 'absolute',
                        bottom: 40,
                        left: 40,
                        background: '#222222',
                      }}
                    >
                      <Avatar
                        src={`data:image/jpeg;base64,${profileImage}`}
                        sx={{
                          width: 150,
                          height: 150,
                        }}
                      />
                      <Box display='flex' flexDirection='row' alignItems='center' p={2}>
                        <Typography
                          variant='h2'
                          sx={{
                            background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                          }} >
                          {editInfo[0].value}
                        </Typography>
                        <IconButton
                          color="primary"
                          size="large"
                          onClick={addFriend}
                        >
                          <IoMdPersonAdd />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Box
                  display="flex" justifyContent="space-between"
                  width="1280px"
                >

                  <Box bgcolor="#222222"
                    display="flex"
                    flexDirection="column"
                    alignItems="left"
                    justifyContent="flex-start"
                    width="40%"
                    p={2}
                    gap={4}
                    sx={{
                      userSelect: 'none',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    <Typography variant="h4"
                      p={1}
                      className="posts-title"
                      sx={{
                        background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                      }}>
                      Description
                    </Typography>

                    {editInfo.map((item, index) => (
                      <div key={index}>
                        <Typography
                          variant="h5"
                        >
                          {item.label}: {item.value}
                        </Typography>
                        {index % 2 === 0 ? (
                          <LinearProgress color="secondary" variant="determinate" value={progress} />
                        ) : (
                          <LinearProgress variant="determinate" value={progress} />
                        )}
                      </div>
                    ))}

                    <Typography variant="h4"
                      p={1}
                      className="posts-title"
                      sx={{
                        background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mt: 4,
                      }}>
                      Friends List
                    </Typography>
                    <TextField
                      variant="outlined"
                      placeholder="Search..."
                      fullWidth
                      size='small'
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              color="primary"
                            >
                              <CiSearch />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    // onChange={(e) => handleSearch(e.target.value)}
                    />
                    {friends
                      .filter(friend => friend !== "")  // Filtrează prietenii cu nume gol
                      .map((friend, index) => (
                        <div key={index}>
                          <Box
                            display='flex'
                            flexDirection='row'
                            alignItems='center'
                            justifyContent='space-between' // asigură spațierea între text și iconiță
                            sx={{ width: '100%' }} // asigură că box-ul ocupă lățimea completă
                          >
                            <Typography
                              variant="h5"
                              sx={{
                                cursor: 'pointer',
                                transition: 'opacity 0.3s ease-in-out',
                                '&:hover': {
                                  opacity: 0.6,
                                },
                              }}
                              onClick={() => {navigate(`/profile/${friend}`)}}
                            >
                              {friend}
                            </Typography>
                            <TiTrash
                              size={30}
                              style={{
                                cursor: 'pointer',
                                transition: 'opacity 0.3s ease-in-out',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            />
                          </Box>
                          {index % 2 === 0 ? (
                            <LinearProgress color="secondary" variant="determinate" value={progress} />
                          ) : (
                            <LinearProgress variant="determinate" value={progress} />
                          )}
                        </div>
                      ))}

                  </Box>

                  <Box
                    bgcolor="#222222"
                    display="flex"
                    flexDirection="column"
                    alignItems="left"
                    justifyContent="flex-start"
                    marginLeft="10px"
                    width="60%"
                    p={2}
                    sx={{ height: '100vh', overflowY: 'auto' }}
                  >
                    <Card isThisMyProfile={isThisMyProfile} username={profileUsername} />
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </div>
  );
}

export default Profile;