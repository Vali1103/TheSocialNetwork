import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CiHeart } from 'react-icons/ci';
import { GoComment } from 'react-icons/go';
import { RiShareForwardLine } from 'react-icons/ri';
import { IoHeart } from 'react-icons/io5';
import Typography from '@mui/material/Typography';
import { Box, TextField, Button, LinearProgress, Tabs, Tab } from '@mui/material';
import SearchBar from './SearchBar';
import FixedSidebar from './FixedSidebar';
import FriendRequestsSidebar from './FriendRequestsSidebar';
import './feed.css';

type Post = {
  id: number;
  username: string;
  image: string;
  description: string;
  number_likes: number;
  number_comments: number;
  number_shares: number;
  comment_list: Comment[];
  liked_by: string[];
  upload_date: Date;
};

type Comment = {
  id: number;
  user: string;
  content: string;
  date: string;
  liked: boolean;
  likes: number;
};

type ApiPost = {
  id: number;
  username: string;
  image: string;
  description: string;
  number_likes: number;
  number_comments: number;
  number_shares: number;
  comment_list: string;
  liked_by: string;
  upload_date: string;
};

interface FeedProps {
  profileUsername: string;
}

function Feed() {
  const [postsNewest, setPostsNewest] = useState<Post[]>([]);
  const [postsOldest, setPostsOldest] = useState<Post[]>([]);
  const [postsPopular, setPostsPopular] = useState<Post[]>([]);
  const [progress, setProgress] = useState(0);
  const [value, setValue] = useState(0);
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
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
      return;
    }
  };

  const fetchPostsNewest = async () => {
    let token = 'Bearer ' + localStorage.getItem('token');
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    try {
      const response = await axios.get('http://127.0.0.1:5001/imagess', headers);
      if (response.data) {
        const posts = response.data
          .map((post: ApiPost) => ({
            ...post,
            comment_list: post.comment_list ? JSON.parse(post.comment_list) : [],
            liked_by: post.liked_by ? JSON.parse(post.liked_by) : [],
            upload_date: new Date(post.upload_date),
          }))
          .sort((a: Post, b: Post) => b.upload_date.getTime() - a.upload_date.getTime());
        setPostsNewest(posts);
      }
    } catch (error) {
      console.error('Error fetching newest posts:', error);
    }
  };

  const fetchPostsOldest = async () => {
    let token = 'Bearer ' + localStorage.getItem('token');
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    try {
      const response = await axios.get('http://127.0.0.1:5001/images_desc', headers);
      if (response.data) {
        const posts = response.data
          .map((post: ApiPost) => ({
            ...post,
            comment_list: post.comment_list ? JSON.parse(post.comment_list) : [],
            liked_by: post.liked_by ? JSON.parse(post.liked_by) : [],
            upload_date: new Date(post.upload_date),
          }))
          .sort((a: Post, b: Post) => a.upload_date.getTime() - b.upload_date.getTime());
        setPostsOldest(posts);
      }
    } catch (error) {
      console.error('Error fetching oldest posts:', error);
    }
  };

  const fetchPostsPopular = async () => {
    let token = 'Bearer ' + localStorage.getItem('token');
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    try {
      const response = await axios.get('http://127.0.0.1:5001/images_by_likes', headers);
      if (response.data) {
        const posts = response.data
          .map((post: ApiPost) => ({
            ...post,
            comment_list: post.comment_list ? JSON.parse(post.comment_list) : [],
            liked_by: post.liked_by ? JSON.parse(post.liked_by) : [],
            upload_date: new Date(post.upload_date),
          }))
          .sort((a: Post, b: Post) => b.number_likes - a.number_likes);
        setPostsPopular(posts);
      }
    } catch (error) {
      console.error('Error fetching popular posts:', error);
    }
  };

  const handleAddComment = async (postId: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newComment[postId]?.trim() !== '') {
      const currentPosts = value === 0 ? postsNewest : value === 1 ? postsOldest : postsPopular;
      const postIndex = currentPosts.findIndex((post) => post.id === postId);
      const post = currentPosts[postIndex];
      let token = 'Bearer ' + localStorage.getItem('token');
      let headers = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      };
  
      const response = await axios.post(
        'http://127.0.0.1:5001/add_comment',
        {
          image_id: post.id,
          comment: {
            id: post.comment_list.length + 1,
            content: newComment[postId],
            likes: 0,
            liked: false,
            user: username,
            date: new Date().toISOString(),
          },
        },
        headers
      );
  
      if (response.data.status === 'OK') {
        const updatedPost = {
          ...post,
          comment_list: response.data.comment_list,
          number_comments: response.data.number_comments,
        };
        const updatedPosts = [...currentPosts];
        updatedPosts[postIndex] = updatedPost;
  
        if (value === 0) setPostsNewest(updatedPosts);
        if (value === 1) setPostsOldest(updatedPosts);
        if (value === 2) setPostsPopular(updatedPosts);
  
        setNewComment({ ...newComment, [postId]: '' });
      }
    }
  };

  const toggleLike = async (index: number, event: React.MouseEvent<SVGElement>) => {
    event.stopPropagation();
    const currentPosts = value === 0 ? postsNewest : value === 1 ? postsOldest : postsPopular;
    const updatedPosts = currentPosts.map((post, i) => {
      if (i === index) {
        const updatedPost = {
          ...post,
          liked_by: post.liked_by.includes(username)
            ? post.liked_by.filter((user) => user !== username)
            : [...post.liked_by, username],
          number_likes: post.liked_by.includes(username) ? post.number_likes - 1 : post.number_likes + 1,
        };
        return updatedPost;
      }
      return post;
    });
  
    if (value === 0) setPostsNewest(updatedPosts);
    if (value === 1) setPostsOldest(updatedPosts);
    if (value === 2) setPostsPopular(updatedPosts);
  
    const post = updatedPosts[index];
    let token = 'Bearer ' + localStorage.getItem('token');
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
  
    await axios.post(
      'http://127.0.0.1:5001/update_likes',
      {
        image_id: post.id,
        liked: post.liked_by.includes(username),
      },
      headers
    );
  };

  const toggleCommentLike = async (postIndex: number, commentId: number) => {
    const currentPosts = value === 0 ? postsNewest : value === 1 ? postsOldest : postsPopular;
    const updatedPosts = currentPosts.map((post, index) => {
      if (index === postIndex) {
        const updatedComments = post.comment_list.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            };
          }
          return comment;
        });
        const updatedPost = { ...post, comment_list: updatedComments };
        return updatedPost;
      }
      return post;
    });
  
    if (value === 0) setPostsNewest(updatedPosts);
    if (value === 1) setPostsOldest(updatedPosts);
    if (value === 2) setPostsPopular(updatedPosts);
  
    const post = updatedPosts[postIndex];
    const comment = post.comment_list.find((comment) => comment.id === commentId);
    let token = 'Bearer ' + localStorage.getItem('token');
    let headers = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
  
    await axios.post(
      'http://127.0.0.1:5001/update_comment_like',
      {
        image_id: post.id,
        comment_id: commentId,
        liked: comment!.liked,
      },
      headers
    );
  };
  

  useEffect(() => {
    getCurrentUsername();
    fetchPostsNewest();
    fetchPostsOldest();
    fetchPostsPopular();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <LinearProgress color="secondary" variant="determinate" value={progress} />
      <LinearProgress variant="determinate" value={progress} />
      <SearchBar />
      <FixedSidebar profileUsername={username} />
      <FriendRequestsSidebar profileUsername={username} />
      <Box gap={10} p={10} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={2} gap={4} width="55%" bgcolor="#222222">
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Newest" />
          <Tab label="Oldest" />
          <Tab label="Most popular" />
        </Tabs>
        {value === 0 && (
          <div className="container">
            {postsNewest.map((post, index) => (
              <div key={post.id} className="post-container">
                <h2>{post.username}</h2>
                <p>{post.upload_date.toLocaleDateString()}</p>
                <div className="upload-label">
                  <img src={`data:image/jpeg;base64,${post.image}`} alt="Post" className="post-image" />
                </div>
                <p>{post.description}</p>
                <div className="interaction-bar">
                  {post.liked_by.includes(username) ? (
                    <IoHeart className="heart-icon filled" onClick={(event) => toggleLike(index, event)} />
                  ) : (
                    <CiHeart className="heart-icon" onClick={(event) => toggleLike(index, event)} />
                  )}
                  <span className="counter">{post.number_likes}</span>
                  <GoComment className="comment-icon" />
                  <span className="counter">{post.number_comments}</span>
                  <RiShareForwardLine className="share-icon" />
                  <span className="counter">{post.number_shares}</span>
                </div>
                <div className="comments-section wide">
                  {post.comment_list.map((comment) => (
                    <div key={comment.id} className="comment wide">
                      <p>
                        <strong>{comment.user}</strong>: {comment.content}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {comment.liked ? (
                          <IoHeart className="heart-icon filled" onClick={() => toggleCommentLike(index, comment.id)} />
                        ) : (
                          <CiHeart className="heart-icon" onClick={() => toggleCommentLike(index, comment.id)} />
                        )}
                        <span className="likes">{comment.likes} likes</span>
                      </div>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment[post.id] || ''}
                  onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                  onKeyDown={(e) => handleAddComment(post.id, e)}
                  className="comment-input wide"
                />
              </div>
            ))}
          </div>
        )}
        {value === 1 && (
          <div className="container">
            {postsOldest.map((post, index) => (
              <div key={post.id} className="post-container">
                <h2>{post.username}</h2>
                <p>{post.upload_date.toLocaleDateString()}</p>
                <div className="upload-label">
                  <img src={`data:image/jpeg;base64,${post.image}`} alt="Post" className="post-image" />
                </div>
                <p>{post.description}</p>
                <div className="interaction-bar">
                  {post.liked_by.includes(username) ? (
                    <IoHeart className="heart-icon filled" onClick={(event) => toggleLike(index, event)} />
                  ) : (
                    <CiHeart className="heart-icon" onClick={(event) => toggleLike(index, event)} />
                  )}
                  <span className="counter">{post.number_likes}</span>
                  <GoComment className="comment-icon" />
                  <span className="counter">{post.number_comments}</span>
                  <RiShareForwardLine className="share-icon" />
                  <span className="counter">{post.number_shares}</span>
                </div>
                <div className="comments-section wide">
                  {post.comment_list.map((comment) => (
                    <div key={comment.id} className="comment wide">
                      <p>
                        <strong>{comment.user}</strong>: {comment.content}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {comment.liked ? (
                          <IoHeart className="heart-icon filled" onClick={() => toggleCommentLike(index, comment.id)} />
                        ) : (
                          <CiHeart className="heart-icon" onClick={() => toggleCommentLike(index, comment.id)} />
                        )}
                        <span className="likes">{comment.likes} likes</span>
                      </div>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment[post.id] || ''}
                  onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                  onKeyDown={(e) => handleAddComment(post.id, e)}
                  className="comment-input wide"
                />
              </div>
            ))}
          </div>
        )}
        {value === 2 && (
          <div className="container">
            {postsPopular.map((post, index) => (
              <div key={post.id} className="post-container">
                <h2>{post.username}</h2>
                <p>{post.upload_date.toLocaleDateString()}</p>
                <div className="upload-label">
                  <img src={`data:image/jpeg;base64,${post.image}`} alt="Post" className="post-image" />
                </div>
                <p>{post.description}</p>
                <div className="interaction-bar">
                  {post.liked_by.includes(username) ? (
                    <IoHeart className="heart-icon filled" onClick={(event) => toggleLike(index, event)} />
                  ) : (
                    <CiHeart className="heart-icon" onClick={(event) => toggleLike(index, event)} />
                  )}
                  <span className="counter">{post.number_likes}</span>
                  <GoComment className="comment-icon" />
                  <span className="counter">{post.number_comments}</span>
                  <RiShareForwardLine className="share-icon" />
                  <span className="counter">{post.number_shares}</span>
                </div>
                <div className="comments-section wide">
                  {post.comment_list.map((comment) => (
                    <div key={comment.id} className="comment wide">
                      <p>
                        <strong>{comment.user}</strong>: {comment.content}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {comment.liked ? (
                          <IoHeart className="heart-icon filled" onClick={() => toggleCommentLike(index, comment.id)} />
                        ) : (
                          <CiHeart className="heart-icon" onClick={() => toggleCommentLike(index, comment.id)} />
                        )}
                        <span className="likes">{comment.likes} likes</span>
                      </div>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment[post.id] || ''}
                  onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                  onKeyDown={(e) => handleAddComment(post.id, e)}
                  className="comment-input wide"
                />
              </div>
            ))}
          </div>
        )}
      </Box>
    </Box>

    </>
  );
};

export default Feed;
