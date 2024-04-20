'use client'

import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import {onAuthStateChanged, User} from "firebase/auth";
import {auth} from "@/lib/firebase";

const AuthContext = createContext<User | null>(null);

export const useAuthContext = () => useContext(AuthContext)

export const AuthContextProvider = ({children}: PropsWithChildren) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    );
}