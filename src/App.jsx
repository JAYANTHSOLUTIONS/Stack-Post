import React, { useState, useEffect } from 'react';
import FeedComposer from './component/FeedComposer';
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import Type from './component/Type';
import axios from 'axios';

// Unified Base API endpoint path mapping configuration
const API_BASE_URL = "https://stack-be.onrender.com/api/v1";

// Global request interceptor to automatically attach authorization headers
axios.interceptors.request.use(
  (config) => {
    const activeTokenStr = localStorage.getItem("app_user_jwt");
    if (activeTokenStr) {
      config.headers.Authorization = `Bearer ${activeTokenStr}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function StateLayout() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Sync session metrics out of localStorage cache on mounting phase
  useEffect(() => {
    const cachedProfileStr = localStorage.getItem("app_user_profile");
    if (cachedProfileStr) {
      setCurrentUser(JSON.parse(cachedProfileStr));
    }
  }, []);

  // Central sync wrapper to safely retrieve documents from MongoDB Atlas
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts`);
      setPosts(response.data);
    } catch (err) {
      console.error("Database connection failure:", err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Authentication login session persistence callback hook handlers
  const handleAuthLogin = (token, userProfilePayload) => {
    localStorage.setItem("app_user_jwt", token);
    localStorage.setItem("app_user_profile", JSON.stringify(userProfilePayload));
    setCurrentUser(userProfilePayload);
    fetchPosts(); // Re-fetch feed queue to apply updated view logic constraints
  };

  const handleAuthLogout = () => {
    localStorage.removeItem("app_user_jwt");
    localStorage.removeItem("app_user_profile");
    setCurrentUser(null);
  };

  // FIXED: Converted to FormData packing layout to transport binary image upload files safely
  const addPost = async (newPostPayload) => {
    try {
      const formData = new FormData();
      formData.append("raw", newPostPayload.raw);
      formData.append("html", newPostPayload.html);
      
      if (newPostPayload.imageFile) {
        formData.append("imageFile", newPostPayload.imageFile);
      }

      const response = await axios.post(`${API_BASE_URL}/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === "success") {
        setPosts((currentPosts) => [response.data.data, ...currentPosts]);
      }
    } catch (err) {
      console.error("Failed to commit post:", err.message);
    }
  };

  const editPost = async (postId, updatedPayload) => {
    try {
      // For basic edits, we'll continue mapping strings or wrap them into simple forms
      const formData = new FormData();
      formData.append("raw", updatedPayload.raw);
      formData.append("html", updatedPayload.html);
      
      if (updatedPayload.imageFile) {
        formData.append("imageFile", updatedPayload.imageFile);
      }

      const response = await axios.put(`${API_BASE_URL}/posts/${postId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === "success") {
        setPosts((currentPosts) =>
          currentPosts.map((p) => (p.id === postId ? response.data.data : p))
        );
      }
    } catch (err) {
      console.error("Failed to update post:", err.message);
    }
  };

  const deletePost = async (postId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/posts/${postId}`);
      if (response.data.status === "success") {
        setPosts((currentPosts) => currentPosts.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error("Failed to delete post:", err.message);
    }
  };

  const addComment = async (postId, text) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/posts/${postId}/comments`, { text });
      if (response.data.status === "success") {
        fetchPosts(); // Safely re-hydrate feed structural array tree index state layout maps
      }
    } catch (err) {
      console.error("Failed to commit comment payload:", err.message);
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`);
      if (response.data.status === "success") {
        fetchPosts();
      }
    } catch (err) {
      console.error("Failed to eliminate comment payload:", err.message);
    }
  };

  return (
    <Outlet context={{ 
      posts, currentUser, handleAuthLogin, handleAuthLogout, 
      addPost, editPost, deletePost, addComment, deleteComment 
    }} />
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
