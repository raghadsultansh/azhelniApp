import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  ScrollView,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const ProfileScreen = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleEditGoals = () => {
    navigation.navigate("SetGoals", { fromProfile: true });
  };

  const handleLogout = () => {
    Alert.alert("تأكيد", "هل أنت متأكد من تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "تسجيل الخروج", onPress: logout, style: "destructive" },
    ]);
  };

  const handleContactUs = () => {
    const subject = encodeURIComponent("Azhelni App - تواصل الدعم");
    const body = encodeURIComponent(
      `مرحباً،\n\nأنا المستخدم: ${userInfo?.email}\n\n`
    );
    const mailto = `mailto:raghadsultan104@gmail.com?subject=${subject}&body=${body}`;
    Linking.openURL(mailto);
  };

  const goals = userInfo?.goals || {};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40, alignItems: "center" }}
    >
      <View style={{ height: 40 }} />
      <Text style={styles.header}>الملف الشخصي</Text>

      <View style={styles.box}>
        <Text style={styles.label}>البريد الإلكتروني:</Text>
        <Text style={styles.value}>{userInfo?.email}</Text>
      </View>

      <Text style={styles.goalsHeader}>أهدافك الغذائية</Text>
      <View style={styles.goalsGrid}>
        <View style={[styles.goalCard, { backgroundColor: "#e9f5ee" }]}>
          <Ionicons name="flame" size={28} color="#ff9800" />
          <Text style={styles.goalLabel}>السعرات</Text>
          <Text style={styles.goalValue}>{goals.calorieGoal || 0} kcal</Text>
        </View>
        <View style={[styles.goalCard, { backgroundColor: "#e3f0ff" }]}>
          <MaterialCommunityIcons name="food-drumstick" size={28} color="#1976d2" />
          <Text style={styles.goalLabel}>بروتين</Text>
          <Text style={styles.goalValue}>{goals.proteinGoal || 0} g</Text>
        </View>
        <View style={[styles.goalCard, { backgroundColor: "#fff7e6" }]}>
          <MaterialCommunityIcons name="bread-slice" size={28} color="#fbc02d" />
          <Text style={styles.goalLabel}>كربوهيدرات</Text>
          <Text style={styles.goalValue}>{goals.carbGoal || 0} g</Text>
        </View>
        <View style={[styles.goalCard, { backgroundColor: "#fbe9e7" }]}>
          <MaterialCommunityIcons name="butterfly" size={28} color="#d84315" />
          <Text style={styles.goalLabel}>دهون</Text>
          <Text style={styles.goalValue}>{goals.fatGoal || 0} g</Text>
        </View>
      </View>

      <View style={styles.streakCard}>
        <Text style={styles.streakTitle}>Streak</Text>
        <Text style={styles.streakValue}>{userInfo?.streak || 0} days</Text>
        <Text style={styles.streakGoal}>Goal: 365 days</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleEditGoals}>
        <Ionicons name="create-outline" size={20} color="#fff" style={{ marginLeft: 6 }} />
        <Text style={styles.buttonText}>تعديل الأهداف</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#cc0000" }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginLeft: 6 }} />
        <Text style={styles.buttonText}>تسجيل الخروج</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactButton} onPress={handleContactUs}>
        <Ionicons name="chatbubble-ellipses-outline" size={22} color="#009966" />
        <Text style={styles.contactText}>تواصل معنا</Text>
      </TouchableOpacity>
      <Text style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 30, marginBottom: 10 }}>
        © 2025 Raghad Sultan Binshanar. All rights reserved.
      </Text>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
    color: "#009966",
  },
  box: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: "#f9f9f9",
    alignItems: "flex-end",
  },
  label: { fontWeight: "bold", marginBottom: 6, fontSize: 15, color: "#333" },
  value: { fontSize: 16, color: "#444" },
  goalsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    alignSelf: "flex-end",
    marginRight: 4,
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
    gap: 10,
  },
  goalCard: {
    width: "47%",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#aaa",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  goalLabel: {
    fontSize: 15,
    color: "#555",
    marginTop: 8,
    marginBottom: 2,
    fontWeight: "bold",
  },
  goalValue: {
    fontSize: 18,
    color: "#222",
    fontWeight: "bold",
    marginTop: 2,
  },
  button: {
    flexDirection: "row-reverse",
    backgroundColor: "#009966",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    width: "100%",
    elevation: 1,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  contactButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e9f5ee",
    borderRadius: 10,
    padding: 14,
    marginTop: 18,
    width: "100%",
    borderWidth: 1,
    borderColor: "#b2dfdb",
  },
  contactText: {
    color: "#009966",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  streakCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginVertical: 18,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#aaa",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0c7c1f",
    marginBottom: 6,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F5B945",
    marginBottom: 4,
  },
  streakGoal: {
    fontSize: 14,
    color: "#888",
  },
});
