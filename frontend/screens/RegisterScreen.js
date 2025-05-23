import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const RegisterScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLogo, setShowLogo] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("خطأ", "يرجى إدخال الإيميل وكلمة السر");
      return;
    }

    try {
      const res = await api.post("/api/auth/register", { email, password });
      const user = res.data;
      login(user.email, password);
    } catch (err) {
      console.log("Registration error:", err);
      Alert.alert("خطأ", "فشل التسجيل. تأكد من أن البريد غير مستخدم.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#a6a6a6", "#fff"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.catchphrase}>مستخدم جديد؟ نورتنا ✨</Text>

            {showLogo ? (
              <Image
                source={require("../assets/images/Logo.png")}
                style={styles.logo}
              />
            ) : (
              <View style={styles.logo} />
            )}

            <View style={styles.form}>
              <Text style={styles.title}>سجل دخولك وازهلني</Text>

              <TextInput
                style={styles.input}
                placeholder="الإيميل"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="right"
              />

              <TextInput
                style={styles.input}
                placeholder="كلمة السر"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textAlign="right"
              />

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>سجلني</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.link}>عندك حساب؟ ادخل من هنا</Text>
              </TouchableOpacity>
            </View>
            <Text
              style={{
                textAlign: "center",
                color: "#ccc",
                fontSize: 12,
                marginTop: 30,
                marginBottom: 10,
              }}
            >
              © 2025 Raghad Sultan Binshanar. All rights reserved.
            </Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 60,
  },
  catchphrase: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#0c7c1f",
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: "contain",
    marginTop: 10,
    marginBottom: 20,
  },
  form: {
    width: "100%",
    marginTop: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#009966",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    marginTop: 10,
    color: "#007AFF",
    fontSize: 14,
  },
});
