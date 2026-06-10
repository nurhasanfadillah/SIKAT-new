import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient, safeFetch } from '../lib/auth-client';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isBendahara: boolean;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isBendahara: false,
  refetchProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData, isPending: sessionPending, refetch: refetchSession } = authClient.useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = async () => {
    if (sessionData?.user) {
      try {
        const res = await safeFetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Failed to load user profile from API:', error);
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
    setProfileLoading(false);
  };

  useEffect(() => {
    if (!sessionPending) {
      fetchProfile();
    }
  }, [sessionData, sessionPending]);

  const refetchProfile = async () => {
    await refetchSession();
    await fetchProfile();
  };

  const isAdmin = profile?.role === 'Super Admin';
  const isBendahara = profile?.role === 'Bendahara' || isAdmin;
  const loading = sessionPending || (sessionData?.user ? profileLoading : false);

  return (
    <AuthContext.Provider value={{ 
      user: sessionData?.user || null, 
      profile, 
      loading, 
      isAdmin, 
      isBendahara,
      refetchProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
