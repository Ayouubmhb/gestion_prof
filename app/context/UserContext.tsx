// UserContext.tsx
"use client"
import React, { createContext, useContext, useState } from "react";

type User = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  photo: string | null;
  isAdmin: boolean;
  isProfesseur: boolean;
};

type UserContextType = {
  userNewData: User;
  setUserNewData: React.Dispatch<React.SetStateAction<User>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userNewData, setUserNewData] = useState<User>({
    id: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    photo: "",
    isAdmin: false,
    isProfesseur: false,
  });

  return (
    <UserContext.Provider value={{ userNewData, setUserNewData }}>
      {children}
    </UserContext.Provider>
  );
};