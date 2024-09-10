import { Typography } from "@mui/material";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import { Route, Routes, Navigate, BrowserRouter, Link as ReachLink  } from "react-router-dom";
import backgroundImage from "../assets/back2.jpg";


function About() {
    return (
        <div>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                p={2}
                gap={2}
                sx={{ 
                    width: '100vw',
                    height: '100vh',
                    margin: '0 auto',
                    padding: 0,
                    position: 'relative',
                    background: `url(${backgroundImage}) no-repeat center center fixed`, 
                    backgroundSize: 'cover',
                    borderRadius: '0px', 
                    boxShadow: 'none',
                }}>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    p={2}
                    gap={2}
                    sx={{ 
                        height: 'auto', 
                        width: '100%', 
                        maxWidth: '600px', 
                        margin: '0 auto', 
                        position: 'relative',
                        background: 'url("../assets/back2.jpg") center / cover no-repeat',
                        borderRadius: '8px', 
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    }}
                >
                    
                    <Typography 
                        variant="body1" 
                        sx={{
                            fontSize: '1.1rem',
                            background: 'linear-gradient(15deg, #0ABCD6 10%, #EA00D9 90%)',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            lineHeight: '1.6',
                            textAlign: 'justify',
                            letterSpacing: '0.5px',
                            padding: '0 20px',
                            textShadow: '1px 1px 8px rgba(0,0,0,0.2)'
                        }}> 
                        Project Description: The Social Network 

                        Our mission with Social Network is to redefine the social media landscape by introducing an innovative platform inspired by the dynamic interactions of Instagram and the threaded conversations of Threads. The Social Network is designed to cater to the digital era’s needs, providing a seamless, engaging, and deeply connected social experience. 

                        Real-Time Relevant Feed

                        The Social Network brings to life real-time content sharing and interactions, offering users instant visibility into the latest posts, and comments from their network. This feature ensures users are always up to date, fostering a lively and engaging community atmosphere.

                        Adaptive Interface: Dark and Light Modes

                        Understanding the diverse preferences and needs of our users, The Social Network introduces a customizable interface with dark and light modes. This feature not only prioritizes user comfort and accessibility but also aligns with our mission to offer a seamless and engaging social experience across all conditions of use.
                        
                    </Typography>
                    <Link to="/Login" style={{ textDecoration: 'none'}}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            sx={{ 
                                mt: 3,
                                fontSize: '1rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)', 
                                '&:hover': {
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                },
                            }}>
                            Back
                        </Button>
                    </Link>
                </Box>
            </Box>

        </div>
    )
}


export default About;
 