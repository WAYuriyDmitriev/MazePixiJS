import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MenuPage, GamePage, EditorPage } from './pages';
import './App.css';

function App() {
  return (
    <BrowserRouter basename="/MazePixiJS">
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;