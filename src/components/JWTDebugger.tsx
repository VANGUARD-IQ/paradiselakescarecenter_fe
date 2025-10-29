import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
} from "@chakra-ui/react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../contexts/AuthContext";

export const JWTDebugger = () => {
  const { isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [expiryCountdown, setExpiryCountdown] = useState<string>("");
  const [loginTime, setLoginTime] = useState<string>("");
  const [totalDuration, setTotalDuration] = useState<string>("");

  // Check admin status
  useEffect(() => {
    const storedPassword = localStorage.getItem("admin_password");
    setIsAdmin(storedPassword === "123456");
  }, []);

  // Handle JWT timing information
  useEffect(() => {
    const updateCountdown = () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const decoded = jwtDecode<{ exp: number; iat: number }>(token);
        const expiryTime = decoded.exp * 1000;
        const issuedTime = decoded.iat * 1000;
        const now = Date.now();
        const diff = expiryTime - now;
        
        // Calculate total duration
        const totalDurationMs = expiryTime - issuedTime;
        const totalDays = Math.floor(totalDurationMs / (1000 * 60 * 60 * 24));
        setTotalDuration(`${totalDays} days`);

        // Format login time
        setLoginTime(new Date(issuedTime).toLocaleString());
        
        // Calculate countdown
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setExpiryCountdown(`${hours} hours, ${minutes} minutes`);
        } else {
          setExpiryCountdown("Expired");
        }
      }
    };

    // Update immediately
    updateCountdown();
    
    // Then update every minute
    const interval = setInterval(updateCountdown, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <Box mt={8} p={4} borderWidth="1px" borderRadius="lg">
      <Heading size="md" mb={4}>Debug JWT Information</Heading>
      <Stack spacing={4}>
        <Box>
          <Text fontWeight="bold">Login Time:</Text>
          <Text fontSize="lg">
            {loginTime}
          </Text>
        </Box>
        <Box>
          <Text fontWeight="bold">Token Duration:</Text>
          <Text fontSize="lg">
            {totalDuration}
          </Text>
        </Box>
        <Box>
          <Text fontWeight="bold">Time until expiry:</Text>
          <Text color={expiryCountdown === "Expired" ? "red.500" : "green.500"} fontSize="lg" fontWeight="bold">
            {expiryCountdown}
          </Text>
        </Box>
        <Box>
          <Text fontWeight="bold">Raw JWT:</Text>
          <Text fontSize="sm" as="pre" whiteSpace="pre-wrap" p={2} bg="gray.100" borderRadius="md">
            {localStorage.getItem("auth_token")}
          </Text>
        </Box>
        <Box>
          <Text fontWeight="bold">Decoded JWT:</Text>
          <Text fontSize="sm" as="pre" whiteSpace="pre-wrap" p={2} bg="gray.100" borderRadius="md">
            {JSON.stringify(jwtDecode(localStorage.getItem("auth_token") || ""), null, 2)}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}; 