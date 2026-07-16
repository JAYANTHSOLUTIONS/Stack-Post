import React, { useState, useEffect } from 'react';
import FeedComposer from './component/FeedComposer';
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import Type from './component/Type';

// This sub-component wraps your views and feeds them the shared context
function StateLayout() {
  const [posts, setPosts] = useState([]);

  // Load posts from local storage on startup
  useEffect(() => {
    const savedPosts = localStorage.getItem('local_feed_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, []);

  // Shared updater function
  const addPost = (newPostPayload) => {
    const updatedPostCollection = [newPostPayload, ...posts];
    setPosts(updatedPostCollection);
    localStorage.setItem('local_feed_posts', JSON.stringify(updatedPostCollection));
  };

  // context passes this object down automatically to whatever route is active
  return <Outlet context={{ posts, addPost }} />;
}

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* We wrap both routes inside the StateLayout */}
          <Route element={<StateLayout />}>
            <Route path="/" element={<FeedComposer />} />
            <Route path="/Type" element={<Type />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}