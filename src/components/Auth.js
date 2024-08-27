import React from "react";
import useGoogleAuth from "./Firebase";
import GoogleImage from "../Images/google.png";
import { useAuthState } from "react-firebase-hooks/auth";
import "./Auth.css";

const Auth = () => {
  const { signInWithGoogle, logout, auth } = useGoogleAuth();
  const [user] = useAuthState(auth);

  return (
    <div className="auth-container">
      {user ? (
        <div className="auth-user">
          <div className="auth-user-info">
            <img src={user.photoURL} alt={user.displayName} />
            <p>{user.displayName}</p>
          </div>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={signInWithGoogle} className="auth-button">
          {" "}
          <img src={GoogleImage} className="google-image" />
          Sign in with Google
        </button>
      )}
    </div>
  );
};

export default Auth;
