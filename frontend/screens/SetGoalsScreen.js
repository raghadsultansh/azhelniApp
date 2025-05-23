import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const SetGoalsScreen = () => {
  const { userInfo, setUserInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const fromProfile = route.params?.fromProfile;

  const [calories, setCalories] = useState(userInfo?.goals?.calorieGoal?.toString() || "");
  const [protein, setProtein] = useState(userInfo?.goals?.proteinGoal?.toString() || "");
  const [carbs, setCarbs] = useState(userInfo?.goals?.carbGoal?.toString() || "");
  const [fats, setFats] = useState(userInfo?.goals?.fatGoal?.toString() || "");

  const handleSubmit = async () => {
    if (!calories || !protein || !carbs || !fats) {
      Alert.alert("تنبيه", "يرجى تعبئة جميع الحقول");
      return;
    }

    try {
      const body = {
        uid: userInfo.uid,
        calorieGoal: parseInt(calories),
        proteinGoal: parseInt(protein),
        carbGoal: parseInt(carbs),
        fatGoal: parseInt(fats),
      };

      await api.post("/api/users/goals", body);
      setUserInfo({ ...userInfo, goals: body });

      navigation.reset({
        index: 0,
        routes: [{ name: "Tabs" }],
      });
    } catch (err) {
      console.log("❌ Error saving goals:", err);
      Alert.alert("خطأ", "فشل حفظ الأهداف، حاول مرة ثانية");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Custom رجوع button */}
          {fromProfile && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#009966" />
              <Text style={styles.backButtonText}>رجوع</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.title}>حدد أهدافك الغذائية اليومية💪 </Text>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="السعرات الحرارية (kcal)"
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
            />
            <TextInput
              style={styles.input}
              placeholder="البروتين (g)"
              keyboardType="numeric"
              value={protein}
              onChangeText={setProtein}
            />
            <TextInput
              style={styles.input}
              placeholder="الكربوهيدرات (g)"
              keyboardType="numeric"
              value={carbs}
              onChangeText={setCarbs}
            />
            <TextInput
              style={styles.input}
              placeholder="الدهون (g)"
              keyboardType="numeric"
              value={fats}
              onChangeText={setFats}
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>حفظ الأهداف</Text>
            </TouchableOpacity>
          </View>
           <Text style={styles.greeting}>
              دخل أهدافك الغذائية،
              <Text style={{ fontWeight: "bold" }}> وإزهلني </Text>
              أرتب لك الوجبات 😎
            </Text>
            <Text style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 30, marginBottom: 10 }}>
  © 2025 Raghad Sultan Binshanar. All rights reserved.
</Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SetGoalsScreen;

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0c7c1f",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    textAlign: "right",
  },
  button: {
    backgroundColor: "#009966",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 18,
    marginLeft: 0,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: "#aaa",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  backButtonText: {
    color: "#009966",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
  },
    greeting: {
    fontSize: 18,
    fontWeight: "500",
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
});
