import React, { useContext, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as Progress from "react-native-progress";
import { format } from "date-fns"; 
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const HomeScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  
  const [todayMacros, setTodayMacros] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [progressLoading, setProgressLoading] = useState(true);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messageTimer = useRef(null);

  
  const fetchTodayProgress = async () => {
    if (!userInfo?.uid) return;
    setProgressLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const res = await api.get(`/api/meals/history?uid=${userInfo.uid}&date=${today}`);
      if (res.data && res.data.totalMacros) {
        setTodayMacros({
          calories: res.data.totalMacros.calories || 0,
          protein: res.data.totalMacros.protein || 0,
          carbs: res.data.totalMacros.carbs || 0,
          fat: res.data.totalMacros.fat || 0,
        });
      } else {
        setTodayMacros({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    } catch (err) {
      setTodayMacros({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    } finally {
      setProgressLoading(false);
    }
  };

  
  const fetchGeneratedMeals = async () => {
    if (!userInfo?.uid) return;
    const today = format(new Date(), "yyyy-MM-dd");
    try {
      const res = await api.get(`/api/meals/generated?uid=${userInfo.uid}&date=${today}`);
      if (res.data && res.data.meals) {
        setMeals(res.data.meals);
      }
    } catch (err) {
      setMeals([]);
    }
  };

  
  useFocusEffect(
    React.useCallback(() => {
      fetchTodayProgress();
      fetchGeneratedMeals();
    }, [userInfo?.uid])
  );

  const generateMeals = async () => {
    if (!userInfo?.goals) {
      Alert.alert("خطأ", "لم يتم تحديد الأهداف الغذائية بعد");
      return;
    }

    const body = {
      uid: userInfo.uid, 
      calorieGoal: userInfo.goals.calorieGoal,
      proteinGoal: userInfo.goals.proteinGoal,
      carbGoal: userInfo.goals.carbGoal,
      fatGoal: userInfo.goals.fatGoal,
    };

    try {
      setLoading(true);
      const res = await api.post("/api/meals/generate", body);
      setMeals(res.data.meals);
    } catch (err) {
      console.log("❌ Meal error:", err?.response?.data || err.message);
      Alert.alert("خطأ", "فشل توليد الوجبات");
    } finally {
      setLoading(false);
    }
  };

  const goals = userInfo?.goals || {
    calorieGoal: 0,
    proteinGoal: 0,
    carbGoal: 0,
    fatGoal: 0,
  };

  
  const percent = (val, goal) => (goal > 0 ? Math.min(val / goal, 1) : 0);

  
  const getFeedbackMessages = () => {
    if (progressLoading) return ["جاري التحميل..."];
    const messages = [];
    if (todayMacros.calories > goals.calorieGoal && goals.calorieGoal > 0)
      messages.push("⚠️ لقد تجاوزت هدف السعرات اليوم! حاول تقليل الكمية.");
    if (todayMacros.fat > goals.fatGoal && goals.fatGoal > 0)
      messages.push("⚠️ لقد تجاوزت هدف الدهون اليوم! انتبه للدهون.");
    if (todayMacros.carbs > goals.carbGoal && goals.carbGoal > 0)
      messages.push("⚠️ لقد تجاوزت هدف الكربوهيدرات اليوم! انتبه للكربوهيدرات.");
    if (todayMacros.protein >= goals.proteinGoal && goals.proteinGoal > 0)
      messages.push("🎉 ممتاز! وصلت لهدف البروتين اليوم!");
    if (
      messages.length === 0 &&
      todayMacros.calories > 0
    )
      messages.push("استمر! أنت على الطريق الصحيح.");
    if (messages.length === 0)
      messages.push("ابدأ بتسجيل وجباتك اليوم!");
    return messages;
  };

  const feedbackMessages = getFeedbackMessages();

  
  useEffect(() => {
    if (feedbackMessages.length > 1) {
      messageTimer.current = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % feedbackMessages.length);
      }, 5000); 
      return () => clearInterval(messageTimer.current);
    } else {
      setCurrentMessageIndex(0);
      if (messageTimer.current) clearInterval(messageTimer.current);
    }
  }, [feedbackMessages.length, progressLoading]);

  
  const isWarning = feedbackMessages[currentMessageIndex]?.includes("⚠️");
  const isCongrats = feedbackMessages[currentMessageIndex]?.includes("🎉");

  const renderMeal = ({ item }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() => navigation.navigate("MealDetails", { meal: item })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.mealImage} />
      <Text style={styles.mealTitle}>{item.title}</Text>
      <View style={styles.macrosRow}>
        <Text style={styles.macroText}>Calories: {item.nutrition?.calories || 0}</Text>
        <Text style={styles.macroText}>Protein: {item.nutrition?.protein || 0}g</Text>
        <Text style={styles.macroText}>Carbs: {item.nutrition?.carbohydrates || 0}g</Text>
        <Text style={styles.macroText}>Fat: {item.nutrition?.fat || 0}g</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <TouchableOpacity onPress={fetchTodayProgress}>
            <Text style={[styles.progressLink, { textAlign: "left" }]}>تحديث</Text>
          </TouchableOpacity>
          <Text style={[styles.progressTitle, { textAlign: "right", flex: 1 }]}>تقدمك اليوم</Text>
        </View>

        <Text style={[styles.calorieText, { textAlign: "center" }]}>
          🔥 {todayMacros.calories} / {goals.calorieGoal?.toLocaleString()} سعر حراري
        </Text>

        <View style={styles.progressCircles}>
          <View style={styles.circleItem}>
            <Progress.Circle
              size={50}
              progress={percent(todayMacros.fat, goals.fatGoal)}
              thickness={5}
              color="#F5B945"
              unfilledColor="#eee"
              showsText={false}
              borderWidth={0}
            />
            <View style={styles.circleIconWrapper}>
            </View>
            <Text style={[styles.circleLabel, { textAlign: "center" }]}>
              دهون {Math.round(percent(todayMacros.fat, goals.fatGoal) * 100)}%
            </Text>
          </View>
          <View style={styles.circleItem}>
            <Progress.Circle
              size={50}
              progress={percent(todayMacros.protein, goals.proteinGoal)}
              thickness={5}
              color="#58A5F0"
              unfilledColor="#eee"
              showsText={false}
              borderWidth={0}
            />
            <View style={styles.circleIconWrapper}>
            </View>
            <Text style={[styles.circleLabel, { textAlign: "center" }]}>
              بروتين {Math.round(percent(todayMacros.protein, goals.proteinGoal) * 100)}%
            </Text>
          </View>
          <View style={styles.circleItem}>
            <Progress.Circle
              size={50}
              progress={percent(todayMacros.carbs, goals.carbGoal)}
              thickness={5}
              color="#9370DB"
              unfilledColor="#eee"
              showsText={false}
              borderWidth={0}
            />
            <View style={styles.circleIconWrapper}>
            </View>
            <Text style={[styles.circleLabel, { textAlign: "center" }]}>
              كربوهيدرات {Math.round(percent(todayMacros.carbs, goals.carbGoal) * 100)}%
            </Text>
          </View>
        </View>

        <View style={[styles.feedback, { flexDirection: "row-reverse" }]}>
          <View
            style={[
              styles.chatBubble,
              {
                alignSelf: "flex-end",
                backgroundColor: isWarning
                  ? "#ffeaea"
                  : isCongrats
                  ? "#e9f5ee"
                  : "#e9f5ee",
              },
            ]}
          >
            <Text
              style={[
                styles.chatText,
                {
                  textAlign: "right",
                  color: isWarning ? "#c00" : "#222",
                  fontWeight: isWarning ? "bold" : "400",
                },
              ]}
            >
              {feedbackMessages[currentMessageIndex]}
            </Text>
          </View>
        </View>
      </View>

      {meals.length === 0 && (
        <TouchableOpacity style={styles.button} onPress={generateMeals}>
          <Text style={styles.buttonText}>
            {loading ? "جاري التوليد..." : "توليد خطة وجبات"}
          </Text>
        </TouchableOpacity>
      )}

      {meals.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>الوجبات المقترحة:</Text>
          <FlatList
            data={meals}
            renderItem={renderMeal}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            contentContainerStyle={{ paddingTop: 20 }}
            ListEmptyComponent={
              !loading && (
                <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
                  لا توجد وجبات حالياً
                </Text>
              )
            }
          />
          <TouchableOpacity style={styles.button} onPress={generateMeals}>
            <Text style={styles.buttonText}>
              {loading ? "جاري التوليد..." : "هل تريد خيارات أخرى؟"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 30, marginBottom: 10 }}>
        © 2025 Raghad Sultan Binshanar. All rights reserved.
      </Text>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fefefe",
    paddingHorizontal: 20,
    paddingTop: 40, 
  },
  progressCard: {
    backgroundColor: "#fff",
    padding: 24, 
    borderRadius: 20, 
    marginTop: 20,
    marginBottom: 24, 
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    shadowOpacity: 0.12,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  progressTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
  },
  progressLink: {
    color: "#007AFF",
    fontSize: 15,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  calorieText: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 14,
    color: "#009966",
  },
  progressCircles: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 14,
    gap: 12,
  },
  circleItem: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    width: 60, 
    height: 60, 
    position: "relative",
  },
  circleLabel: {
    marginTop: 7,
    fontSize: 13,
    color: "#444",
    fontWeight: "500",
  },
  circleIconWrapper: {
    position: "absolute",
    top: 14, 
    left: 14,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    backgroundColor: "#f7f7fa",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  chatBubble: {
    backgroundColor: "#e9f5ee",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: "90%",
  },
  chatText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "400",
  },
  button: {
    backgroundColor: "#009966",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 26,
    shadowColor: "#009966",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  mealCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
    shadowColor: "#aaa",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  mealImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 6,
    gap: 8,
  },
  macroText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "bold",
  },
  mealImageWrapper: {
    position: "relative",
    width: "100%",
    height: 180,
    backgroundColor: "transparent", 
  },
  overlayTag: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  overlayText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "right",
    fontWeight: "500",
  },
  mealContent: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  mealInfoRow: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 2,
  },
  mealInfo: {
    fontSize: 14,
    color: "#666",
    textAlign: "right", 
    flex: 1,
    writingDirection: "rtl",
  },
  sectionHeader: {
    fontSize: 25,
    fontWeight: "700",
    marginTop: 34,
    marginBottom: 14,
    textAlign: "center",
    color: "#222",
  },
});
