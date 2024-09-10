import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import './Conditions.css';
import Cinematic from '../assets/Cinematic.mp4';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";

const Conditions: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setShowVideo(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let videoTimer: NodeJS.Timeout | null = null;
    if (showVideo) {
      videoTimer = setTimeout(() => {
        setTimerCompleted(true);
        navigate('/Login');
      }, 67000);
    }

    return () => {
      if (videoTimer) clearTimeout(videoTimer);
    };
  }, [showVideo, navigate]);
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
    <div className="Conditions">
      {!timerCompleted && (
        <>
          {isVisible && (
            <Typography variant="h4" sx={{
              background: `linear-gradient(90deg, #0ABCD6 ${gradientProgress - 100}%, #EA00D9 ${gradientProgress}%)`,
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
              width: '80%',
              textAlign: 'center',
              }}> 
              <h1>Thank you for your interest!</h1>
              <p>We are trying to create a united and problem-free community</p>
            </Typography>
          )}
          {showVideo && (
            <>
              <video autoPlay loop muted style={{
                position: "fixed",
                width: "100%",
                left: "50%",
                top: "50%",
                height: "100%",
                objectFit: "cover",
                transform: "translate(-50%, -50%)",
                zIndex: 1
              }}>
                <source src={Cinematic} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 3,
                color: 'white',
                textAlign: 'center',
                width: '80%',
              }}>
                <p>By creating an account and using our platform, you agree not to post content that is illegal, offensive or infringes the intellectual property rights of others. Respect the confidentiality and right to privacy of other users by avoiding sharing personal information without consent. Our company reserves the right to delete any content deemed inappropriate and to suspend or terminate accounts that violate these rules. Users' personal data is processed in accordance with data protection legislation, with the aim of improving the services offered and ensuring the security of the platform.</p>
                <Link to="/Login" style={{ textDecoration: 'none'}}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        fullWidth = {false}
                        sx={{ mt: 3 }}
                        onClick={() => {/* Logică pentru navigare sau acțiune */}}
                    >
                        Back
                    </Button>
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Conditions;
