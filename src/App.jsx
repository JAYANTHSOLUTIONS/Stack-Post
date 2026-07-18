import React, { useState, useEffect } from 'react';
import FeedComposer from './component/FeedComposer';
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import Type from './component/Type';
import axios from 'axios';

const API_BASE_URL = "https://stack-be.onrender.com/api/v1/posts";

function StateLayout() {
  const [posts, setPosts] = useState([]);

  // Fetch posts from MongoDB
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(API_BASE_URL);
        setPosts(response.data);
      } catch (err) {
        console.error("Database connection failure:", err.message);
      }
    };
    fetchPosts();
  }, []);

  // Save new post to MongoDB
  const addPost = async (newPostPayload) => {
    try {
      const response = await axios.post(API_BASE_URL, {
        raw: newPostPayload.raw,
        html: newPostPayload.html,
        postImage: newPostPayload.postImage
      });
      if (response.data.status === "success") {
        setPosts((currentPosts) => [response.data.data, ...currentPosts]);
      }
    } catch (err) {
      console.error("Failed to commit post:", err.message);
    }
  };

  // EDIT POST OPERATION
  const editPost = async (postId, updatedPayload) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${postId}`, updatedPayload);
      if (response.data.status === "success") {
        setPosts((currentPosts) =>
          currentPosts.map((p) => (p.id === postId ? response.data.data : p))
        );
      }
    } catch (err) {
      console.error("Failed to update post:", err.message);
    }
  };

  // DELETE POST OPERATION
  const deletePost = async (postId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${postId}`);
      if (response.data.status === "success") {
        setPosts((currentPosts) => currentPosts.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error("Failed to delete post:", err.message);
    }
  };

  // ADD COMMENT TO MONGO DB SUB-DOCUMENT ARRAY
  const addComment = async (postId, text) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${postId}/comments`, { text });
      if (response.data.status === "success") {
        setPosts((currentPosts) =>
          currentPosts.map((p) =>
            p.id === postId 
              ? { ...p, comments: [...(p.comments || []), response.data.data] } 
              : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to commit comment payload:", err.message);
    }
  };

  // DELETE COMMENT FROM MONGO DB SUB-DOCUMENT ARRAY
  const deleteComment = async (postId, commentId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${postId}/comments/${commentId}`);
      if (response.data.status === "success") {
        setPosts((currentPosts) =>
          currentPosts.map((p) =>
            p.id === postId 
              ? { ...p, comments: (p.comments || []).filter((c) => c.id !== commentId) } 
              : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to eliminate comment payload:", err.message);
    }
  };

  // Render context with perfectly valid prop binding syntax mapping
  return (
    <Outlet context={{ posts, addPost, editPost, deletePost, addComment, deleteComment }} />
  );
}

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route element={<StateLayout />}>
            <Route path="/" element={<FeedComposer />} />
            <Route path="/Type" element={<Type />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}