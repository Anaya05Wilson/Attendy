const STORAGE_KEY = "attendy-data-v1";

// Default shape for your app data
const defaultData = {
  subjects: [],       // [{ code, name }]
  timetable: {},      // { Monday: [...], Tuesday: [...], ... }
  attendance: {},     // we'll use this later
};

export function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw);

    // Ensure all keys exist
    return {
      ...defaultData,
      ...parsed,
    };
  } catch (e) {
    console.error("Error loading data", e);
    return { ...defaultData };
  }
}

export function saveAppData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving data", e);
  }
}
