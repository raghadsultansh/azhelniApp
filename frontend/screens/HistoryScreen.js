import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker"; 

const HistoryScreen = () => {
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/api/meals/history/all?uid=${userInfo.uid}`);
      const fullHistory = res.data.history || [];
      const meals = fullHistory.flatMap((entry) =>
        (entry.meals || []).map((meal) => ({ ...meal, date: entry.date }))
      );
      setHistory(meals);
      setFilteredMeals(meals);
    } catch (err) {
      console.log("Error loading meal history:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchHistory();
    }, [userInfo])
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredMeals(history);
    } else {
      const lower = text.toLowerCase();
      const filtered = history.filter((meal) =>
        meal.title.toLowerCase().includes(lower)
      );
      setFilteredMeals(filtered);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const dateStr = date.toISOString().slice(0, 10);
      const filtered = history.filter((meal) => meal.date === dateStr);
      setFilteredMeals(filtered);
    }
  };

  const renderMeal = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("MealDetails", { meal: item, fromHistory: true })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={1}>
          📅 {item.date?.slice(0, 10)} | ⏱ {item.readyInMinutes} د | 🍽 {item.servings} حصة
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{ height: 40 }} /> {/* Spacer to move search bar down */}
      <View style={styles.searchRow}>
        <TouchableOpacity
          style={styles.dateFilter}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color="#009966" />
          <Text style={styles.dateFilterText}>
            {selectedDate
              ? selectedDate.toLocaleDateString("ar-EG")
              : "تصفية بالتاريخ"}
          </Text>
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#777" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن وجبة"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color="#777" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#009966" size="large" />
      ) : (
        <FlatList
          data={filteredMeals}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMeal}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={<Text style={styles.empty}>لا يوجد سجل وجبات بعد</Text>}
        />
      )}
      <Text style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 30, marginBottom: 10 }}>
  © 2025 Raghad Sultan Binshanar. All rights reserved.
</Text>
    </View>
  
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  searchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  dateFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9f5ee",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 8,
  },
  dateFilterText: {
    marginLeft: 6,
    color: "#009966",
    fontWeight: "bold",
    fontSize: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
    fontSize: 16,
  },
});