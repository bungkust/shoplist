# Shoplist 🛒

A smart, voice-enabled shopping list application designed to make your grocery runs efficient and organized. Built with React, TypeScript, and Supabase.

## ✨ Features

- **🎙️ Smart Voice Input**: Add items effortlessly using voice commands. The app intelligently parses quantity and units (e.g., saying "Dua kilo beras" automatically adds 2 kg of Rice). Supports both Indonesian 🇮🇩 and English 🇺🇸.
- **📝 Multiple Lists**: Create and manage separate shopping lists for different occasions or stores.
- **☁️ Real-time Sync**: Your lists are synced across all your devices instantly using Supabase.
- **📊 History Tracking**: Keep track of your past purchases and spending.
- **⚖️ Price Comparison**: Compare item prices to ensure you get the best deal.
- **📱 Mobile First**: Optimized for mobile devices with a responsive design and Capacitor integration for native app capabilities.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Ionic Framework](https://ionicframework.com/) (for components/icons)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **Mobile Runtime**: [Capacitor](https://capacitorjs.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bungkust/shoplist.git
   cd shoplist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📱 Building for Mobile

This project uses Capacitor to build for iOS and Android.

1. **Build the web assets**
   ```bash
   npm run build
   ```

2. **Sync with Capacitor**
   ```bash
   npx cap sync
   ```

3. **Open in Android Studio or Xcode**
   ```bash
   npx cap open android
   # or
   npx cap open ios
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
