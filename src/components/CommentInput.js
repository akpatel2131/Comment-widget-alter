import React, { useState } from "react";
import "react-quill/dist/quill.snow.css";
import useGoogleAuth from "./Firebase";
import ReactQuill from 'react-quill';
import { collection, addDoc, Timestamp, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import "draft-js/dist/Draft.css";
import "./CommentInput.css";

const CommentInput = ({ onSuccess, reply=false, setShowInput, parentCommentId }) => {
  const { db, auth } = useGoogleAuth();
  const [comment, setComment] = useState('');

  const addComment = async () => {
    const { uid, displayName, photoURL } = auth.currentUser;

    await addDoc(collection(db, "comments"), {
      text: comment,
      createdAt: Timestamp.fromDate(new Date()),
      user: {
        uid,
        displayName,
        photoURL
      },
      reactions: { likes: [], hearts: [] },
      reply: []
    });
    setComment('');
    await onSuccess();
  };

  const addCommentReply = async() => {
    const { uid, displayName, photoURL } = auth.currentUser;
    const replyId = uuidv4();
    const replyData = {
      text: comment,
      id: replyId,
      createdAt: Timestamp.fromDate(new Date()),
      user: {
        uid,
        displayName,
        photoURL
      },
      reactions: { likes: [], hearts: [] },
      reply: [],
    };

    const commentRef = doc(db, "comments", parentCommentId);
    await updateDoc(commentRef, {
      reply: arrayUnion(replyData)
    });

    setComment('');
    await onSuccess();

  }

  return (
    <div className="comment-input-container">
      <ReactQuill value={comment} onChange={setComment} />
      <div className="comment-input-actions">
          {reply && <button className="cancel-button" onClick={() => setShowInput(false)}>Cancel</button>}
          <button className="send-button" onClick={async() => {
            if(reply) await addCommentReply()
            else await addComment()
            }}>Send</button>
        </div>
    </div>
  );
};

export default CommentInput;
