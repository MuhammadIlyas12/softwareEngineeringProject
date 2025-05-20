import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

function AudioSearch() {
  const { user } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({
    query: "",
    license_type: "",
    creator: "",
    category: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [audioDetail, setAudioDetail] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveSearch = async () => {
    if (!user?.username || !form.query) {
      toast.warn("Please log in to save searches");
      return;
    }
    try {
      await api.post("/search_history", {
        username: user.username,
        query: form.query,
      });
      toast.success("Search saved!");
    } catch (err) {
      console.error("Save search error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to save search"
      );
    }
  };

  const handleSearch = async (query = form.query) => {
    if (!query) return toast.error("Please enter a search query");
    setLoading(true);
    try {
      const response = await api.get("/search_audio", {
        params: {
          q: query,
          license: form.license_type,
          creator: form.creator,
          category: form.category,
        },
      });
      setResults(response.data.results || []);
      await saveSearch();
      toast.success("Audio fetched successfully!");
    } catch (err) {
      console.error("Search error:", err);
      toast.error(
        err.response?.data?.error || err.message || "Failed to fetch audio"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAudioClick = async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/audio_detail/${id}`);
      setAudioDetail(response.data);
      setSelectedAudio(id);
      toast.success("Audio details fetched!");
    } catch (err) {
      console.error("Audio detail error:", err);
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Failed to fetch audio details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.query) {
      setForm({ ...form, query: location.state.query });
      handleSearch(location.state.query);
    }
  }, [location.state]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Audio Search
      </Typography>
      {user ? (
        <Typography sx={{ mb: 2 }}>
          Saving searches for: {user.username}
        </Typography>
      ) : (
        <Typography sx={{ mb: 2, color: "warning.main" }}>
          Log in to save your searches
        </Typography>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <TextField
            label="Search Query"
            name="query"
            value={form.query}
            onChange={handleChange}
            sx={{ flex: "1 1 300px" }}
            required
          />
          <FormControl sx={{ flex: "1 1 200px" }}>
            <InputLabel>License Type</InputLabel>
            <Select
              name="license_type"
              value={form.license_type}
              onChange={handleChange}
              label="License Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="commercial">Commercial</MenuItem>
              <MenuItem value="modification">Modification</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Creator"
            name="creator"
            value={form.creator}
            onChange={handleChange}
            sx={{ flex: "1 1 200px" }}
          />
          <FormControl sx={{ flex: "1 1 200px" }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={form.category}
              onChange={handleChange}
              label="Category"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="music">Music</MenuItem>
              <MenuItem value="sound_effect">Sound Effect</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Search"}
          </Button>
        </Box>
      </form>
      {loading && (
        <CircularProgress sx={{ display: "block", mx: "auto", my: 3 }} />
      )}
      <List>
        {results.map((audio) => (
          <ListItem
            key={audio.id}
            sx={{ borderBottom: "1px solid #ddd" }}
            onClick={() => handleAudioClick(audio.id)}
          >
            <ListItemText
              primary={audio.title}
              secondary={`By: ${audio.creator || "Unknown"} | Duration: ${
                audio.duration || "N/A"
              }s`}
            />
            {audio.url && (
              <AudioPlayer
                src={audio.url}
                autoPlay={false}
                style={{ width: "300px" }}
                onPlay={() => toast.info(`Playing ${audio.title}`)}
              />
            )}
          </ListItem>
        ))}
      </List>
      <Dialog open={!!selectedAudio} onClose={() => setSelectedAudio(null)}>
        <DialogTitle>Audio Details</DialogTitle>
        <DialogContent>
          {audioDetail && (
            <Box>
              <Typography variant="h6">{audioDetail.title}</Typography>
              <Typography>
                Creator: {audioDetail.creator || "Unknown"}
              </Typography>
              <Typography>
                License: {audioDetail.license || "Unknown"}
              </Typography>
              <Typography>
                Description: {audioDetail.description || "N/A"}
              </Typography>
              <Typography>
                Duration: {audioDetail.duration || "N/A"}s
              </Typography>
              <Typography>
                Genres: {audioDetail.genres?.join(", ") || "N/A"}
              </Typography>
              {audioDetail.url && (
                <AudioPlayer src={audioDetail.url} autoPlay={false} />
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default AudioSearch;
