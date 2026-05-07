import { createContext, useContext, useState } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  const fetchUser = async () => {
    if (!token) return;

    try {
      const res = await axios.get(
        "https://mind-space-ov3r.onrender.com/user/profile",
        {
          headers: {
            Authorization: `dash ${token}`,
          },
        }
      );

      setUser(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);