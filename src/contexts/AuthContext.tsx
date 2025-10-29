import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { jwtDecode } from "jwt-decode";
import { GET_CLIENT, GET_CLIENT_BY_PHONE, GET_CLIENT_BY_ID, type JWTDecoded } from "../pages/authentication";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null; // Replace 'any' with your Client type
  loading: boolean;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  // BEST PRACTICE: Query client by ID for most efficient lookup
  const { data: clientIdData, refetch: refetchClientById } = useQuery(GET_CLIENT_BY_ID, {
    variables: { id: clientId },
    skip: !clientId,
    onCompleted: (data) => {
      console.log("[1] AuthContext - Client data fetched by ID (EFFICIENT!):", {
        clientId: data.client?.id,
        email: data.client?.email,
        name: `${data.client?.fName} ${data.client?.lName}`,
        permissions: data.client?.permissions?.length || 0,
      });
      setUser(data.client);
      setLoading(false);
    },
    onError: (error) => {
      console.error("[2] AuthContext - Error fetching client by ID:", error);
      // Fall back to email/phone query
      setClientId(null);
    },
  });

  // FALLBACK: Query for client data when we have an email (backward compatibility)
  const { data: clientEmailData } = useQuery(GET_CLIENT, {
    variables: { email: userEmail },
    skip: !userEmail || !!clientId,  // Skip if we have clientId (more efficient)
    onCompleted: (data) => {
      console.log("[3] AuthContext - Client data fetched by email (FALLBACK):", data.clientByEmail?.email);
      setUser(data.clientByEmail);
      setLoading(false);
    },
  });

  // FALLBACK: Query for client data when we have a phone number (backward compatibility)
  const { data: clientPhoneData } = useQuery(GET_CLIENT_BY_PHONE, {
    variables: { phoneNumber: userPhone },
    skip: !userPhone || !!clientId,  // Skip if we have clientId (more efficient)
    onCompleted: (data) => {
      console.log("[4] AuthContext - Client data fetched by phone (FALLBACK):", data.clientByPhone?.phoneNumber);
      setUser(data.clientByPhone);
      setLoading(false);
    },
  })

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        const decoded = jwtDecode<JWTDecoded>(token);
        setIsAuthenticated(true);

        console.log("[5] AuthContext - JWT decoded:", {
          hasClientId: !!decoded.clientId,
          hasEmail: !!decoded.email,
          hasPhoneNumber: !!decoded.phoneNumber,
          hasTenantId: !!decoded.tenantId
        });

        // Best practice: Use clientId if available (most efficient)
        if (decoded.clientId) {
          setClientId(decoded.clientId);
          console.log("[6] AuthContext - Using clientId from JWT:", decoded.clientId);
          // This will trigger the GET_CLIENT_BY_ID query
        }

        // Store email/phone as fallback
        if (decoded.email) {
          setUserEmail(decoded.email);
          console.log("[7] AuthContext - Email from JWT (fallback):", decoded.email);
        } else if (decoded.phoneNumber) {
          setUserPhone(decoded.phoneNumber);
          console.log("[8] AuthContext - Phone from JWT (fallback):", decoded.phoneNumber);
        }
      } catch (error) {
        console.error("[9] AuthContext - Invalid token:", error);
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    setUser(null);
    setUserEmail(null);
    setUserPhone(null);
    setClientId(null);
    console.log("[10] AuthContext - User logged out");
  };

  const refreshAuth = () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        const decoded = jwtDecode<JWTDecoded>(token);
        setIsAuthenticated(true);

        console.log("[11] AuthContext - Auth refreshed, JWT contains:", {
          hasClientId: !!decoded.clientId,
          hasEmail: !!decoded.email,
          hasPhoneNumber: !!decoded.phoneNumber,
          hasTenantId: !!decoded.tenantId
        });

        if (decoded.clientId) {
          setClientId(decoded.clientId);
          console.log("[12] AuthContext - ClientId refreshed:", decoded.clientId);
          // Refetch client data by ID
          if (refetchClientById) {
            console.log("[13] AuthContext - Refetching client data by ID");
            refetchClientById();
          }
        }

        if (decoded.email) {
          setUserEmail(decoded.email);
          console.log("[14] AuthContext - Email refreshed (fallback):", decoded.email);
        } else if (decoded.phoneNumber) {
          setUserPhone(decoded.phoneNumber);
          console.log("[15] AuthContext - Phone refreshed (fallback):", decoded.phoneNumber);
        }
      } catch (error) {
        console.error("[16] AuthContext - Invalid token during refresh:", error);
        logout();
      }
    } else {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
