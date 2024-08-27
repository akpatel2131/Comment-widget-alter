import React, { useMemo, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import moment from "moment";
import useGoogleAuth from "./Firebase";
import "./CommentList.css";
import CommentInput from "./CommentInput";

const CommentsContainer = ({
  comment,
  parentComment,
  onSuccess,
  showInput,
  setShowInput,
  reply = false,
}) => {
  const nestedComments = comment.reply.map((item) => {
    return (
      <CommentsContainer
        comment={item}
        parentComment={comment}
        key={item.id}
        onSuccess={onSuccess}
        showInput={showInput}
        setShowInput={setShowInput}
        reply
      />
    );
  });
  const [replyId, setReplyId] = useState("");
  const [reactions, setReactions] = useState(
    comment.reactions || { likes: [], hearts: [] }
  );
  const { db, auth } = useGoogleAuth();

  const handleReaction = async (type) => {
    const { uid } = auth.currentUser;
    let updatedReactions;

    if (reply) {
      const replyCommentRef = doc(db, "comments", parentComment.id);
      const updatedReplies = parentComment.reply.map((reply) => {
        if (reply.id === comment.id) {
          if (!reply.reactions[type].includes(uid)) {
            console.log({ [type]: reply.reactions[type] });
            return {
              ...reply,
              reactions: {
                ...reply.reactions,
                [type]: [...reply.reactions[type], uid],
              },
            };
          }
        }
        return reply;
      });
      await updateDoc(replyCommentRef, { reply: updatedReplies });
      const updatedComment = { ...comment, reply: updatedReplies };
    } else {
      const commentRef = doc(db, "comments", comment.id);

      if (!reactions[type].includes(uid)) {
        updatedReactions = {
          ...reactions,
          [type]: [...reactions[type], uid],
        };
        await updateDoc(commentRef, { reactions: updatedReactions });
      }
    }
    setReactions(updatedReactions);
    await onSuccess()
  };

  const userReaction = useMemo(() => {
    if(!comment.reactions) {
      return ;
    }
    return {
      likes: comment.reactions.likes,
      hearts: comment.reactions.hearts
    }
  },[comment])

  return (
    <>
      <div
        key={comment.id}
        className={reply ? "reply-comment-section" : "comment-section"}
      >
        <div className={reply ? "reply-comment" : "comment"}>
          <img src={comment.user.photoURL} alt={comment.user.displayName} />
          <div className="comment-body">
            <p>
              <strong>{comment.user.displayName}</strong>
            </p>
            <p dangerouslySetInnerHTML={{ __html: comment.text }} />
            {comment.fileURL && <img src={comment.fileURL} alt="Attachment" />}
            <div className="comment-list-action">
              <div className="comment-reaction">
                <button
                  className="like-button"
                  onClick={() => {
                    handleReaction("likes");
                  }}
                >
                  👍 {userReaction?.likes.length}
                </button>
                <button
                  className="heart-button"
                  onClick={() => handleReaction("hearts")}
                >
                  ❤️ {userReaction?.hearts.length}
                </button>
              </div>
              <button
                disabled={reply}
                className="reply-button"
                onClick={() => {
                  setReplyId(comment.id);
                  setShowInput(true);
                }}
              >
                Reply
              </button>
              <p className="time">
                {moment(comment.createdAt.toDate()).fromNow()}
              </p>
            </div>
          </div>
        </div>
        {nestedComments}
      </div>
      {showInput && replyId === comment.id ? (
        <CommentInput
          setShowInput={setShowInput}
          reply
          parentCommentId={comment.id}
          onSuccess={onSuccess}
        />
      ) : null}
    </>
  );
};

const CommentList = ({ commentList, onSuccess, showInput, setShowInput }) => {
  if (!commentList) {
    return null;
  }

  return (
    <div className="comment-list-container">
      {commentList.map((comment) => (
        <CommentsContainer
          comment={comment}
          key={comment.id}
          onSuccess={onSuccess}
          showInput={showInput}
          setShowInput={setShowInput}
        ></CommentsContainer>
      ))}
    </div>
  );
};

export default CommentList;
