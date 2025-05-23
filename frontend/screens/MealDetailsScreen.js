import React, { useContext } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, ScrollView } from "react-native";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { Ionicons } from "@expo/vector-icons";

const MealDetailsScreen = ({ route, navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const { meal, fromHistory } = route.params;

  const handleMarkAsEaten = async () => {
    try {
      
      const today = new Date().toISOString().slice(0, 10);
      const res = await api.get(`/api/meals/history/all?uid=${userInfo.uid}`);
      const todayMeals = (res.data.history || [])
        .filter(entry => entry.date === today)
        .flatMap(entry => entry.meals || []);
      const alreadyLogged = todayMeals.some(m => m.id === meal.id);

      if (alreadyLogged) {
        Alert.alert(
          "تنبيه",
          "لقد سجلت هذه الوجبة اليوم بالفعل. هل تريد تسجيلها مرة أخرى؟",
          [
            { text: "إلغاء", style: "cancel" },
            {
              text: "تأكيد",
              onPress: () => actuallySaveMeal(),
            },
          ]
        );
      } else {
        actuallySaveMeal();
      }
    } catch (err) {
      actuallySaveMeal();
    }
  };

  const actuallySaveMeal = async () => {
    try {
      await api.post("/api/meals/history", {
        uid: userInfo.uid,
        date: new Date().toISOString().slice(0, 10),
        meals: [meal],
        totalMacros: meal.nutrition
          ? {
              calories: meal.nutrition.calories || 0,
              protein: meal.nutrition.protein || 0,
              carbs: meal.nutrition.carbohydrates || 0,
              fat: meal.nutrition.fat || 0,
            }
          : { calories: 0, protein: 0, carbs: 0, fat: 0 },
        goals: userInfo.goals, 
      });

      Alert.alert("تم", "تم تسجيل الوجبة في التاريخ");
      navigation.goBack();
    } catch (err) {
      console.log("Log meal error:", err);
      Alert.alert("خطأ", "فشل تسجيل الوجبة");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#009966" />
        <Text style={styles.backButtonText}>رجوع</Text>
      </TouchableOpacity>
      <Image source={{ uri: meal.image }} style={styles.image} />
      <Text style={styles.title}>{meal.title}</Text>
      <Text style={styles.detail}>مدة التحضير: {meal.readyInMinutes} دقيقة</Text>
      <Text style={styles.detail}>عدد الحصص: {meal.servings}</Text>
      <Text style={styles.section}>المكونات:</Text>

      <FlatList
        data={meal.ingredients}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.ingredient}>• {item.name} ({item.amount})</Text>
        )}
      />

      {meal.instructions ? (
        <>
          <Text style={styles.section}>طريقة التحضير:</Text>
          <Text style={styles.instructions}>{meal.instructions}</Text>
        </>
      ) : null}

      {!fromHistory && (
        <TouchableOpacity style={styles.button} onPress={handleMarkAsEaten}>
          <Text style={styles.buttonText}>تم تناول الوجبة</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default MealDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30, 
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
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
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  section: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  ingredient: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#006644",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  instructions: {
    fontSize: 15,
    color: "#444",
    marginTop: 8,
    lineHeight: 22,
    textAlign: "right",
  },
});
