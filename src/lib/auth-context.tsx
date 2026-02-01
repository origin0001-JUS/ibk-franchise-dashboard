import { createContext, useContext, useEffect, useState } from 'react';
import {
    type User,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    sendEmailVerification,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { type UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch User Profile
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setProfile(userSnap.data() as UserProfile);
                } else {
                    // Create initial profile if getting here via direct sign up
                    // (Usually handled in signUp function, but good for safety)
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signUp = async (email: string, pass: string) => {
        if (!email.endsWith('@ibk.co.kr')) {
            throw new Error('IBK 이메일(@ibk.co.kr)만 가입 가능합니다.');
        }

        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, pass);
        await sendEmailVerification(newUser);

        // Check if this is the first user (Admin Bootstrapping)
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(1));
        const snapshot = await getDocs(q);
        const isFirstUser = snapshot.empty;

        // Create Profile in Firestore
        const newProfile: UserProfile = {
            uid: newUser.uid,
            email: newUser.email!,
            role: isFirstUser ? 'ADMIN' : 'USER',
            isApproved: isFirstUser ? true : false,
            createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', newUser.uid), newProfile);
        setProfile(newProfile);
    };

    const signIn = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            isAdmin: profile?.role === 'ADMIN',
            signIn,
            signUp,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
