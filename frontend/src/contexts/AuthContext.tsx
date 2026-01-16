import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { supabase } from '../config/supabase';

interface AuthContextType {
  currentUser: User | null;
  userProfile: any | null;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUserProfile: (firebaseUid?: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    // Perform login, then update daily streak
    const cred = await signInWithEmailAndPassword(auth, email, password);
    try {
      // Ensure we have latest profile
      const profile = await fetchUserProfile(cred.user.uid);
      // Update streak if profile found
      if (profile?.id) {
        await updateDailyStreak(profile.id);
        // Refresh context profile after update
        await refreshUserProfile(cred.user.uid);
      }
    } catch (err) {
      console.error('Streak update after login failed:', err);
    }
    return cred;
  };

  const logout = async () => {
    return signOut(auth);
  };

  const fetchUserProfile = async (firebaseUid: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error) throw error;
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      return null;
    }
  };

  // Helper: Update daily login streak stored in `user_streaks`
  const updateDailyStreak = async (userId: string) => {
    try {
      // Fetch current streak record
      const { data: streakRow, error: streakErr } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (streakErr && streakErr.code !== 'PGRST116') { // ignore "No rows" error
        throw streakErr;
      }

      // Compute dates in UTC date-only strings
      const today = new Date();
      const todayStr = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
        .toISOString()
        .slice(0, 10);

      let current_streak = 0;
      let longest_streak = 0;
      let last_log_date: string | null = null;

      if (!streakRow) {
        // First-time record
        current_streak = 1;
        longest_streak = 1;
        last_log_date = todayStr;
      } else {
        current_streak = streakRow.current_streak ?? 0;
        longest_streak = streakRow.longest_streak ?? 0;
        last_log_date = streakRow.last_log_date ?? null;

        if (last_log_date === todayStr) {
          // Already counted today; do nothing
          return;
        }

        if (!last_log_date) {
          current_streak = 1;
          longest_streak = Math.max(longest_streak, current_streak);
        } else {
          const last = new Date(last_log_date + 'T00:00:00Z');
          const diffDays = Math.floor(
            (Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - last.getTime()) /
            (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            current_streak = (current_streak ?? 0) + 1;
            longest_streak = Math.max(longest_streak ?? 0, current_streak);
          } else {
            // Missed days; reset streak to 1
            current_streak = 1;
            longest_streak = Math.max(longest_streak ?? 0, current_streak);
          }
        }

        last_log_date = todayStr;
      }

      const payload = {
        user_id: userId,
        current_streak,
        longest_streak,
        last_log_date,
        updated_at: new Date().toISOString()
      };

      const { error: upsertErr } = await supabase
        .from('user_streaks')
        .upsert(payload, { onConflict: 'user_id' });

      if (upsertErr) throw upsertErr;
    } catch (err) {
      console.error('Failed to update daily streak:', err);
    }
  };

  const refreshUserProfile = async (firebaseUid?: string) => {
    const uid = firebaseUid || currentUser?.uid;
    if (!uid) return;
    await fetchUserProfile(uid);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    refreshUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
