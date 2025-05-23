import React, {
  useState,
  useContext,
  useEffect,
  useState as ReactState,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { AuthContext } from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = ReactState("");
  const [password, setPassword] = ReactState("");
  const [showLogo, setShowLogo] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("خطأ", "يرجى إدخال الإيميل وكلمة السر");
      return;
    }
    await login(email, password);

    navigation.reset({
      index: 0,
      routes: [{ name: "Tabs" }],
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(true), 2500);
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
            <Animatable.Text
              animation="fadeInDown"
              duration={1500}
              style={styles.catchphrase}
            >
              ماتدري وش تاكل؟
            </Animatable.Text>

            {showLogo ? (
              <Animatable.Image
                animation="fadeIn"
                duration={1200}
                delay={200}
                source={require("../assets/images/Logo.png")}
                style={styles.logo}
              />
            ) : (
              <View style={styles.logo} />
            )}

            <View style={styles.form}>
              <Text style={styles.title}>وش تنتظر؟ سجل وخلنا نبدأ</Text>

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

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>يلا نبدأ</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.link}>ما عندك حساب؟ سجل معنا</Text>
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

export default LoginScreen;

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
    fontSize: 28,
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
    borderWidth: 2,
    borderColor: "#c",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    shadowRadius: 100,
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
