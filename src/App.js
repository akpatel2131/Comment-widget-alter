import React, { useState, useEffect, useCallback } from "react";
import Auth from "./components/Auth";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import useGoogleAuth from "./components/Firebase";
import HashLoader from "react-spinners/HashLoader";

import CommentInput from "./components/CommentInput";
import CommentList from "./components/CommentList";
import { useAuthState } from "react-firebase-hooks/auth";
import "./App.css";

function App() {
  const [sortBy, setSortBy] = useState("latest");
  const [commentCount, setCommentCount] = useState(0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const { db, auth } = useGoogleAuth();
  const [user] = useAuthState(auth);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      console.log("fetch comment");
      const q = query(
        collection(db, "comments"),
        orderBy(sortBy === "latest" ? "createdAt" : "reactions.likes", "desc"),
        limit(8)
      );
      const querySnapshot = await getDocs(q);
      const fetchedCommentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("all comment fetched");

      setComments(fetchedCommentsData);
      setCommentCount(fetchedCommentsData.length);
    } catch (error) {
      console.error({ error });
    } finally {
      setLoading(false)
      setShowReplyInput(false);
    }
  }, [db, getDoc, sortBy]);

  useEffect(() => {
    fetchComments();
  }, [sortBy, user]);

  return (
    <div className="app-container">
      <Auth />
      <div className="comment-container">
        <div className="comments-header">
          <div className="commet-text">Comments({commentCount})</div>
          <div className="sort-controls">
            <button
              className={
                sortBy === "latest"
                  ? "selected-sort-button-latest"
                  : "sort-button-latest"
              }
              onClick={() => setSortBy("latest")}
            >
              Latest
            </button>
            <button
              className={
                sortBy === "popular"
                  ? "selected-sort-button-popular"
                  : "sort-button-popular"
              }
              onClick={() => setSortBy("popular")}
            >
              Popular
            </button>
          </div>
        </div>
        {loading ? (
          <div className="loader">
            <HashLoader color="#36d7b7" size={50} />
          </div>
        ) : (
          <>
            <CommentList
              commentList={comments}
              onSuccess={async () => await fetchComments()}
              showInput={showReplyInput}
              setShowInput={setShowReplyInput}
            />
            {(!showReplyInput && user) && (
              <CommentInput onSuccess={async () => await fetchComments()} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
