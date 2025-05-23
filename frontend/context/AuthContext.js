import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const user = res.data;

      
      let goals = null;
      try {
        const goalsRes = await api.get(`/api/users/${user.uid}`);
        goals = goalsRes.data || null;
        console.log("📦 Goals from backend:", goals);
      } catch (err) {
        console.log("❌ No goals found for user.");
      }

      const enrichedUser = { ...user, goals };

      setUserToken(user.uid);
      setUserInfo(enrichedUser);

      await AsyncStorage.setItem("userToken", user.uid);
      await AsyncStorage.setItem("userInfo", JSON.stringify(enrichedUser));
      console.log("👤 Logged in user from AsyncStorage:", enrichedUser);

    } catch (err) {
      console.log("Login error:", err);
      Alert.alert("خطأ", "فشل تسجيل الدخول");
    }
  };

  const logout = async () => {
    setUserToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userInfo");
  };

  const isLoggedIn = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const info = await AsyncStorage.getItem("userInfo");

      if (token && info) {
        const parsedInfo = JSON.parse(info);

        
        if (!parsedInfo.goals) {
          try {
            const goalsRes = await api.get(`/api/users/goals?uid=${token}`);
            parsedInfo.goals = goalsRes.data || null;
            console.log("📦 Loaded goals in isLoggedIn:", parsedInfo.goals);

            
            await AsyncStorage.setItem("userInfo", JSON.stringify(parsedInfo));
          } catch (err) {
            console.log("⚠️ No goals found during auto-login");
          }
        }

        setUserToken(token);
        setUserInfo(parsedInfo);
      }
    } catch (err) {
      console.log("Auto-login error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{ login, logout, userToken, userInfo, loading, setUserInfo }}
    >
      {children}
    </AuthContext.Provider>
  );
};
