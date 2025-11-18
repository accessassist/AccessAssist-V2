# AccessAssist — Detailed Setup & Guide

AccessAssist is a React Native application (Expo) that helps users find and review accessible places. This file documents everything needed to run, develop, and contribute to the project: frontend, backend, tech stack, configuration, and a recommended roadmap.

**Purpose:**
- **What:** Mobile app for finding and rating the accessibility of public spaces (physical, sensory, cognitive).
- **Who for:** People with disabilities, caretakers, accessibility auditors, and community contributors.
- **Why:** Centralize accessibility information and make it easy to discover and improve public accessibility.

**Repository layout (high level)**
- `App.tsx` — App entry (Expo/React Native)
- `src/` — Application source
  - `api/` — services to interact with external APIs (Firestore, Google Places)
  - `components/` — shared UI components
  - `config/` — Firebase configuration and environment helpers
  - `navigation/` — React Navigation setup
  - `screens/` — App screens (Home, Place, Profile, etc.)
  - `services/` — business logic and remote calls
  - `utils/` & `types/` — helpers and TypeScript types
- `android/` and `ios/` — native project folders (Expo-managed or ejected parts)
- `assets/` — fonts, images


Tech stack
- Frontend: React Native with Expo, TypeScript
- Navigation: React Navigation
- State & Context: React Context + local components
- Backend (BaaS): Firebase Authentication and Cloud Firestore
- Maps & Places: Google Places API / React Native Maps / Expo Location
- Other: Expo, Jest (if tests added), ESLint/Prettier (optional)

Requirements (developer machine)
- Node.js (LTS recommended, e.g., 18+ or 20+). Check with `node -v`.
- Yarn (recommended) or npm. Install `yarn` with `npm i -g yarn` if preferred.
- Expo CLI (global) for development workflows: `npm install -g expo-cli` or use `npx expo`.
- CocoaPods (macOS) for iOS native dependency install: `sudo gem install cocoapods` or `brew install cocoapods`.
- Xcode (for iOS simulator) and Android Studio (for Android emulator) if you plan to run natively.
- A Google Cloud API key (for Google Places / Maps) and Firebase project credentials.

Environment variables & secrets
- This project reads Firebase config from `src/config/firebase.ts` (check that file).
- Keep secrets out of source control. Use a `.env` (with a library like `react-native-dotenv`) or set environment config in your CI/provider.
- Common values you will need:
  - `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_APP_ID`, etc. (see `src/config/firebase.ts`)
  - `GOOGLE_PLACES_API_KEY` — for place autocomplete and details
**Important:**
- Do not commit sensitive keys to the repository.
- Create .env files to store API keys locally. 
(The .gitignore already excludes .env files, so you can manually create one safely.)
All the field needed for the project to run is in this folder. 
NOTE: You have to log in to AccessAssist Gmail to view this. DO NOT EVER expose this, or some random hacker will use this information to charge our sponsors! https://docs.google.com/document/d/19MpViMw4OhzgHKbcrxVnAAC7YvUFXk_UMi3R5Aytw0w/edit?tab=t.0 



Local setup (macOS, zsh)
1. Clone repository and switch to branch (if any):

```bash
git clone <repo-url>
cd AccessAssist-V2
```

2. Install JS dependencies (Yarn recommended):

```bash
yarn install
# or with npm
# npm install
```

3. Install iOS pods (if running on iOS native simulator and iOS folder exists):

```bash
cd ios
pod install
cd ..
```

4. Configure Firebase
- Create a Firebase project and Web app in the Firebase console.
- Copy the Firebase config values into `src/config/firebase.ts` or into your preferred env solution.

5. Configure Google API key
- Create/enable the Places API and Maps SDK in Google Cloud Console.
- Add `GOOGLE_PLACES_API_KEY` to your env/config.

6. Start the Expo dev server

```bash
yarn start
# or
# npx expo start
```

7. Run on device/simulator
- iOS simulator: press `i` in the Expo CLI or run `yarn ios` (if scripts present).
- Android emulator: press `a` in the Expo CLI or run `yarn android`.
- Physical device: scan the QR code from the Expo CLI and open in Expo Go.

Backend details (Firebase Firestore + Auth)
- Authentication: Email/password (Firebase Auth) — see `src/contexts/AuthContext.tsx`.
- Data: Cloud Firestore stores facilities, reviews, access tags, and user profiles. Look at `src/services/facilityService.ts` and `src/api/firestoreService.ts` for read/write patterns.
- Security: Ensure Firestore rules are configured for appropriate reads/writes and authenticated operations.

Important code locations
- Firestore helper: `src/api/firestoreService.ts`
- Facility logic: `src/services/facilityService.ts`
- Google Places: `src/services/googlePlacesService.ts`
- Auth context: `src/contexts/AuthContext.tsx`
- App navigation: `src/navigation/index.tsx` and `BottomTabNavigator.tsx`

Testing
- There are currently no explicit tests in the repo (add Jest + React Native Testing Library if needed).
- Suggested commands once tests are added:
  - `yarn test` — run unit tests
  - `yarn lint` — run ESLint

Building for production
- For Expo-managed apps, follow Expo build docs:
  - `eas build --platform ios` and `eas build --platform android` (EAS recommended)
- For classic builds you can run platform-specific commands after ejecting.

iOS notes (macOS) (most of the time, we deploy on iOS)
- Ensure Xcode command line tools are installed.
- If you see errors after `pod install`, run `pod repo update` then `pod install`.

Android notes
- Make sure Android SDK and an emulator/device are available.
- Set `ANDROID_HOME` / `ANDROID_SDK_ROOT` if needed, and add platform-tools to your `PATH`.


