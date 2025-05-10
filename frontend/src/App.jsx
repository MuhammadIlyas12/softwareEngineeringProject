import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import AuthProvider from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";

import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ImageSearch from "./components/ImageSearch";
import AudioSearch from "./components/AudioSearch";
import ContactList from "./components/ContactList";
import SearchHistory from "./components/SearchHistory";

import Navbar from "./components/Navbar";
import theme from "./styles/theme";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route index element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* <Route element={<RequireAuth />}> */}
              <Route path="/home" element={<Home />} />
              <Route path="/images" element={<ImageSearch />} />
              <Route path="/audio" element={<AudioSearch />} />
              <Route path="/contacts" element={<ContactList />} />
              <Route path="/history" element={<SearchHistory />} />
            {/* </Route> */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
