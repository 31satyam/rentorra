// IMPORTANT: Change this to your computer's IP address
// Windows: Open cmd and type 'ipconfig' -> find IPv4 Address
// Mac: System Preferences -> Network -> find IP address
export const API_URL = 'http://localhost:8001'; // REPLACE WITH YOUR IP

// If using emulator on same machine:
// Android emulator: http://10.0.2.2:8000
// iOS simulator: http://127.0.0.1:8000

export const STORAGE_KEYS = {
  TOKEN: 'userToken',
  ROLE: 'userRole',
  USER: 'userData',
} as const;