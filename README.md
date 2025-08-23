# Home Poker Calculator App

A modern, responsive web application designed to help poker players track their home game sessions, manage player buy-ins, and calculate settlements efficiently.

## 🎯 Features

- **Game Setup**: Create new poker sessions with custom player names and buy-in amounts
- **Real-time Tracking**: Monitor ongoing games with live updates
- **Cash Out Management**: Handle player cash-outs during the game
- **Settlement Calculator**: Automatically calculate final settlements for all players
- **Game History**: View and manage past game sessions
- **Visitor Analytics**: Track app usage with visitor count and daily statistics
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/srikar8/Home-Poker-Calculator-App.git
   cd Home-Poker-Calculator-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Custom components with modern design
- **Styling**: CSS with responsive design principles
- **State Management**: React hooks and context

## 📱 Usage

### Starting a New Game
1. Click "New Game" on the home screen
2. Add player names and their buy-in amounts
3. Start the game session

### During the Game
- Track cash-outs as players leave
- Monitor current chip counts
- Add new players if needed

### Ending the Game
1. Click "End Game" when the session is complete
2. Review the final settlement calculations
3. Save the game summary for future reference

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── HomeScreen.tsx  # Main home screen
│   ├── NewGameSetup.tsx # Game setup interface
│   ├── GameInProgress.tsx # Active game tracking
│   └── SettlementScreen.tsx # Final calculations
├── styles/             # CSS styles
├── main.tsx           # Application entry point
└── App.tsx            # Main app component
```

## 🎨 Design Features

- Clean, intuitive user interface
- Mobile-first responsive design
- Smooth animations and transitions
- Accessible design principles
- Dark/light theme support

## 📊 Visitor Analytics

The app includes a built-in visitor tracking system that:

- **Tracks Total Visitors**: Counts unique visitors using localStorage
- **Daily Statistics**: Shows how many visitors used the app today
- **Session Management**: Prevents duplicate counting within the same browser session
- **Visual Indicators**: Displays badges for new visitors and first-time daily visitors
- **Detailed Stats**: Access comprehensive visitor statistics through the "View Stats" button
- **Reset Functionality**: Option to reset visitor data if needed

The visitor count is displayed prominently on the home screen and updates automatically when new users visit the app.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for poker enthusiasts
- Inspired by the need for better home game management tools

## 📞 Support

If you have any questions or need support, please open an issue on GitHub or contact the maintainers.

---

**Happy Poker Playing! 🃏**
  