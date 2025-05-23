import * as Notifications from 'expo-notifications';

export const scheduleMealReminders = async () => {
  const { status } = await Notifications.requestPermissionsAsync();

  // Breakfast at 8:00 AM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "تذكير وجبة الإفطار",
      body: "لا تنس تناول وجبة الإفطار!",
    },
    trigger: {
      hour: 8,
      minute: 0,
      repeats: true,
    },
  });

  // Lunch at 1:00 PM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "تذكير وجبة الغداء",
      body: "حان وقت الغداء!",
    },
    trigger: {
      hour: 17,
      minute: 0,
      repeats: true,
    },
  });

  // Dinner at 7:00 PM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "تذكير وجبة العشاء",
      body: "لا تنس وجبة العشاء!",
    },
    trigger: {
      hour: 19,
      minute: 0,
      repeats: true,
    },
  });
};