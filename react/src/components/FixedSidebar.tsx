import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';
import './feed.css';
import { CiHeart } from "react-icons/ci";
import { IoHeart } from "react-icons/io5";
import axios from 'axios';

type Story = {
  id: number;
  username: string;
  media: string;
  mediaType: 'image' | 'video';
  nr_likes: number;
  apreciation_by: string[];
};

interface FixedSidebarProps {
  profileUsername: string;
}

const FixedSidebar: React.FC<FixedSidebarProps> = ({ profileUsername }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [showStory, setShowStory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video'>('image');

  const fetchStories = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5001/stories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const fetchedStories = response.data.map((story: Story) => ({
        ...story,
        media: `data:${story.mediaType === 'image' ? 'image/jpeg' : 'video/mp4'};base64,${story.media}`
      }));
      setStories(fetchedStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
};


  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (showStory && activeStory) {
      const timer = setTimeout(() => {
        setShowStory(false);
        setActiveStory(null);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showStory, activeStory]);

  const handleClick = (story: Story) => {
    setActiveStory(story);
    setShowStory(true);
  };

  const handleAddStory = async () => {
    if (!selectedMedia) return;

    try {
      const response = await axios.post('http://127.0.0.1:5001/add_story', {
        media: selectedMedia.split(',')[1],
        mediaType: selectedMediaType
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const newStory: Story = {
        id: response.data.id,
        username: profileUsername,
        media: selectedMedia,
        mediaType: selectedMediaType,
        nr_likes: 0,
        apreciation_by: []
      };

      setStories([...stories, newStory]);
      setShowModal(false);
      setSelectedMedia(null);
    } catch (error) {
      console.error('Error adding story:', error);
    }
  };


  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedMedia(e.target?.result as string);
        setSelectedMediaType(file.type.startsWith('video') ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };


  const handleLikeToggle = async () => {
    if (!activeStory) return;

    const isLiked = activeStory.apreciation_by.includes(profileUsername);
    const newApreciationBy = isLiked
      ? activeStory.apreciation_by.filter(user => user !== profileUsername)
      : [...activeStory.apreciation_by, profileUsername];
    
    // Optimistically update the UI first
    const updatedStories = stories.map(story => {
      if (story.id === activeStory.id) {
        return {
          ...story,
          nr_likes: isLiked ? story.nr_likes - 1 : story.nr_likes + 1,
          apreciation_by: newApreciationBy
        };
      }
      return story;
    });

    setStories(updatedStories);
    setActiveStory({
      ...activeStory,
      nr_likes: isLiked ? activeStory.nr_likes - 1 : activeStory.nr_likes + 1,
      apreciation_by: newApreciationBy
    });

    // Then send the update to the server
    try {
      await axios.post(`http://127.0.0.1:5001/update_story_like`, {
        story_id: activeStory.id,
        liked: !isLiked
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error updating like:', error);
      // If error, revert the changes locally
      setStories(stories); // revert to old stories state
    }
  };


  return (
    <Box className="fixed-sidebar">
      <Typography variant="h6" color="white">
        Stories
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        {stories.map((story) => (
          <Box
            key={story.id}
            display="flex"
            flexDirection="column"
            alignItems="center"
            onClick={() => handleClick(story)}
            style={{ cursor: 'pointer' }}
          >
            {story.mediaType === 'image' ? (
              <img
                src={story.media}
                alt={story.username}
                style={{ width: '60px', height: '60px', borderRadius: '50%' }}
              />
            ) : (
              <video
                src={story.media}
                style={{ width: '60px', height: '60px', borderRadius: '50%' }}
                muted
              />
            )}
            <Typography variant="caption" color="white">
              {story.username}
            </Typography>
          </Box>
        ))}
      </Box>
      {showStory && activeStory && (
        <Box className="story-overlay">
          {activeStory.mediaType === 'image' ? (
            <img src={activeStory.media} alt={activeStory.username} className="story-image" />
          ) : (
            <video src={activeStory.media} className="story-image" controls />
          )}
          <Box display="flex" alignItems="center">
            {activeStory.apreciation_by.includes(profileUsername) ? (
              <IoHeart onClick={handleLikeToggle} style={{ cursor: 'pointer', fontSize: '32px', color: 'red' }} />
            ) : (
              <CiHeart onClick={handleLikeToggle} style={{ cursor: 'pointer', fontSize: '32px' }} />
            )}
            <Typography variant="body2" color="white" style={{ marginLeft: '8px' }}>
              {activeStory.nr_likes}
            </Typography>
          </Box>
        </Box>
      )}
      <Button
        className="add-button"
        variant="contained"
        color="primary"
        onClick={() => setShowModal(true)}
        style={{ marginTop: 'auto', padding: '4px 8px', fontSize: '12px' }}
      >
        Add
      </Button>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Box className="modal-content">
          <Typography variant="h6" color="white">
            Add New Story
          </Typography>
          <input type="file" accept="image/*,video/*" onChange={handleMediaChange} />
          {selectedMedia && (
            selectedMediaType === 'image' ? (
              <img src={selectedMedia} alt="Selected" style={{ marginTop: '10px', width: '200px', height: '200px' }} />
            ) : (
              <video src={selectedMedia} style={{ marginTop: '10px', width: '200px', height: '200px' }} controls />
            )
          )}
          <Button variant="contained" color="primary" onClick={handleAddStory} style={{ marginTop: '10px' }}>
            Add
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default FixedSidebar;
