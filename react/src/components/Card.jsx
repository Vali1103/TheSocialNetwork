import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CiHeart } from "react-icons/ci";
import { GoComment } from "react-icons/go";
import { RiShareForwardLine } from "react-icons/ri";
import { IoHeart } from "react-icons/io5";
import Typography from '@mui/material/Typography';
import { Box, TextField, Button } from '@mui/material';
import '../styles.css';

const initialCards = [];

export const Card = ({ isThisMyProfile, username }) => {
    const [cards, setCards] = useState(initialCards);
    const [selectedCard, setSelectedCard] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [newCardDescription, setNewCardDescription] = useState("");
    const [newCardImage, setNewCardImage] = useState(null);

    const fetchCards = async () => {
        let token = "Bearer " + localStorage.getItem("token");
        let headers = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        };
        const response = await axios.get(`http://127.0.0.1:5001/images?username=${username}`, headers);
        if (response.data) {
            setCards(response.data.map(image => ({
                ...image,
                liked: false,
                comments: image.comment_list ? JSON.parse(image.comment_list) : [],
                uploadDate: new Date(image.upload_date) // Convertim string-ul de dată într-un obiect Date
            })));
        }
    };
    
    const handleAddNewCard = async () => {
        if (newCardImage && newCardDescription.trim() !== "") {
            const reader = new FileReader();
            reader.readAsDataURL(newCardImage);
            reader.onload = async () => {
                const base64Image = reader.result.split(',')[1];
                let token = "Bearer " + localStorage.getItem("token");
                let headers = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                };
                const response = await axios.post('http://127.0.0.1:5001/upload_image', {
                    image: base64Image,
                    description: newCardDescription
                }, headers);
    
                if (response.data.status === 'OK') {
                    addCard({
                        id: Date.now(), // Temporarily generate ID for frontend
                        description: newCardDescription,
                        number_likes: 0,
                        number_comments: 0,
                        number_shares: 0,
                        image: URL.createObjectURL(newCardImage),
                        liked: false,
                        comments: [],
                        uploadDate: new Date(response.data.upload_date) // Convertim string-ul de dată într-un obiect Date
                    });
                    setNewCardImage(null);
                    setNewCardDescription("");
                }
            };
        }
    };

    const handleAddComment = async (e) => {
        if (e.key === 'Enter' && newComment.trim() !== "") {
            const cardIndex = cards.findIndex(card => card.id === selectedCard.id);
            const card = cards[cardIndex];
            let token = "Bearer " + localStorage.getItem("token");
            let headers = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            };

            const response = await axios.post('http://127.0.0.1:5001/add_comment', {
                image_id: card.id,
                comment: {
                    id: card.comments.length + 1,
                    content: newComment,
                    likes: 0,
                    liked: false
                }
            }, headers);

            if (response.data.status === 'OK') {
                const updatedCard = {
                    ...card,
                    comments: response.data.comment_list,
                    number_comments: response.data.number_comments
                };
                const updatedCards = [...cards];
                updatedCards[cardIndex] = updatedCard;
                setCards(updatedCards);
                setSelectedCard(updatedCard);
                setNewComment("");
            }
        }
    };

    useEffect(() => {
        fetchCards();
    }, [username]);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewCardImage(e.target.files[0]);
        }
    };

    const addCard = (newCard) => {
        setCards([...cards, newCard]);
    };

    const toggleLike = async (index, event) => {
        event.stopPropagation();
        const updatedCards = cards.map((card, i) => {
            if (i === index) {
                const updatedCard = { 
                    ...card, 
                    liked: !card.liked, 
                    number_likes: card.liked ? card.number_likes - 1 : card.number_likes + 1 
                };
                if (selectedCard && selectedCard.id === card.id) {
                    setSelectedCard(updatedCard);
                }
                return updatedCard;
            }
            return card;
        });
        setCards(updatedCards);
    
        const card = updatedCards[index];
        let token = "Bearer " + localStorage.getItem("token");
        let headers = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        };
    
        await axios.post('http://127.0.0.1:5001/update_likes', {
            image_id: card.id,
            liked: card.liked
        }, headers);
    };
    

    const toggleCommentLike = async (cardIndex, commentId) => {
        const updatedCards = cards.map((card, index) => {
            if (index === cardIndex) {
                const updatedComments = card.comments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            liked: !comment.liked,
                            likes: comment.liked ? comment.likes - 1 : comment.likes + 1
                        };
                    }
                    return comment;
                });
                const updatedCard = { ...card, comments: updatedComments };
    
                if (selectedCard && selectedCard.id === card.id) {
                    setSelectedCard(updatedCard);
                }
    
                return updatedCard;
            }
            return card;
        });
        setCards(updatedCards);
    
        const card = updatedCards[cardIndex];
        const comment = card.comments.find(comment => comment.id === commentId);
        let token = "Bearer " + localStorage.getItem("token");
        let headers = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        };
    
        await axios.post('http://127.0.0.1:5001/update_comment_like', {
            image_id: card.id,
            comment_id: commentId,
            liked: comment.liked
        }, headers);
    };
    
    const handleCommentClick = (index, event) => {
        event.stopPropagation();
        setSelectedCard(cards[index]);
    };

    return (
        <div>
            {isThisMyProfile && (
                <Box gap={4} display='flex' flexDirection='column' >
                    <Typography variant="h4"
                        sx={{
                            userSelect: 'none',
                            background: `linear-gradient(45deg, #0ABCD6 10%, #EA00D9 60%)`,
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}>
                        Create post
                    </Typography>
                    <Box display='flex' flexDirection='column' gap={4} bgcolor="#1e1e1e" p={2}>
                        <TextField
                            type="text"
                            placeholder="Description..."
                            multiline
                            variant="outlined"
                            value={newCardDescription}
                            onChange={(e) => setNewCardDescription(e.target.value)}
                            fullWidth
                        />
                        {newCardImage && <img alt="" src={URL.createObjectURL(newCardImage)} />}
                        <Box display='flex' flexDirection='row' justifyContent='space-between' fullWidth>
                            <Button fullWidth onClick={handleAddNewCard}>
                                Save post
                            </Button>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                                id="upload-image"
                            />
                            <Button fullWidth onClick={() => { document.getElementById('upload-image').click() }} width='50%'>
                                Upload photo
                            </Button>
                        </Box>
                    </Box>
                    <Typography variant="h4"
                        className="posts-title"
                        sx={{
                            userSelect: 'none',
                            background: `linear-gradient(45deg, #0ABCD6 10%, #EA00D9 60%)`,
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}>
                        Posts
                    </Typography>
                </Box>
            )}

            <div className="cards-container">
                <div className="cards">
                    {cards.map((card, index) => (
                        <label key={card.id} id={card.id} onDoubleClick={() => setSelectedCard(card)}>
                            <input type="checkbox" />
                            <div className="card" onClick={(e) => e.stopPropagation()}>
                                <div className="front">
                                    <header>
                                        <h2>{card.name}</h2>
                                    </header>
                                    <div className="upload-label">
                                        <img src={`data:image/jpeg;base64,${card.image}`} alt="Post" className="post-image" />
                                    </div>
                                    <div className="interaction-bar">
                                        {card.liked ? (
                                            <IoHeart className="heart-icon filled" onClick={(event) => toggleLike(index, event)} />
                                        ) : (
                                            <CiHeart className="heart-icon" onClick={(event) => toggleLike(index, event)} />
                                        )}
                                        <span className="counter">{card.number_likes}</span>
                                        <GoComment className="comment-icon" onClick={(event) => setSelectedCard(card)} />
                                        <span className="counter">{card.number_comments}</span>
                                        <RiShareForwardLine className="share-icon" onClick={(e) => e.stopPropagation()} />
                                        <span className="counter">{card.number_shares}</span>
                                    </div>
                                </div>
                                <div className="back">
                                    <header>
                                        <h2>{card.name}</h2><span>close</span>
                                    </header>
                                    <div className="card-details">
                                        <p className="card-date">{new Date(card.uploadDate).toLocaleString()}</p>
                                    </div>
                                    <h5>{card.description}</h5>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>

                {selectedCard && (
                    <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-button" onClick={() => setSelectedCard(null)}>X</button>
                            <img src={`data:image/jpeg;base64,${selectedCard.image}`} alt="Enlarged Post" className="enlarged-image" />
                            <div className="modal-details">
                                <h2>{selectedCard.name}</h2>
                                <p>{selectedCard.description}</p>
                                <p className="card-date">{selectedCard.uploadDate.toLocaleString()}</p> {/* Utilizare corecta */}
                                <div className="interaction-bar">
                                    {selectedCard.liked ? (
                                        <IoHeart className="heart-icon filled" onClick={(event) => toggleLike(cards.indexOf(selectedCard), event)} />
                                    ) : (
                                        <CiHeart className="heart-icon" onClick={(event) => toggleLike(cards.indexOf(selectedCard), event)} />
                                    )}
                                    <span className="counter">{selectedCard.number_likes}</span>
                                    <GoComment className="comment-icon" />
                                    <span className="counter">{selectedCard.number_comments}</span>
                                    <RiShareForwardLine className="share-icon" />
                                    <span className="counter">{selectedCard.number_shares}</span>
                                </div>
                                <div className="comments-section wide">
                                    {selectedCard.comments.map((comment) => (
                                        <div key={comment.id} className="comment wide">
                                            <p>{comment.content}</p>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {comment.liked ? (
                                                    <IoHeart className="heart-icon filled" onClick={() => toggleCommentLike(cards.indexOf(selectedCard), comment.id)} />
                                                ) : (
                                                    <CiHeart className="heart-icon" onClick={() => toggleCommentLike(cards.indexOf(selectedCard), comment.id)} />
                                                )}
                                                <span className="likes">{comment.likes} likes</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={handleAddComment}
                                    className="comment-input wide"
                                />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
