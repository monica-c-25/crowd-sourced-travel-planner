import React, { createContext, useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } = useAuth0();

  // Sync with MongoDB if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const loginData = {
        auth0_id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
      };

      // Send user data to Flask backend to sync with MongoDB
      fetch("http://localhost:46725/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("User data synced with MongoDB:", data);
        })
        .catch((error) => {
          console.error("Error syncing user data:", error);
        });
    }
  }, [isAuthenticated, user]); // Only run when user or isAuthenticated changes

  return (
    <AuthContext.Provider
      value={{
        loginWithRedirect,
        logout,
        isAuthenticated,
        isLoading,
        user, // Provide the Auth0 user object directly
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

