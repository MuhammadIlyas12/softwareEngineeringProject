import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

function SearchHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const response = await api.get("/search_history", {
        params: { username: user.username },
      });
      setHistory(response.data.history || []);
      toast.success("Search history fetched!");
    } catch (err) {
      console.error("Fetch history error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to fetch history"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteSearch = async (searchId, e) => {
    e.stopPropagation(); // Prevent triggering the rerun search
    if (!user?.username) return;
    setLoading(true);
    try {
      await api.delete(`/search_history/${searchId}`, {
        params: { username: user.username },
      });
      toast.success("Search deleted!");
      // Re-fetch the history after deletion
      fetchHistory();
    } catch (err) {
      console.error("Delete search error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to delete search"
      );
    } finally {
      setLoading(false);
    }
  };

  const rerunSearch = (query) => {
    navigate("/audio", { state: { query } });
  };

  useEffect(() => {
    if (user?.username) {
      fetchHistory();
    }
  }, [user]);

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Search History
        </Typography>
        <Typography color="warning.main">
          Please log in to view your search history
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Search History
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Showing history for: {user.username}
      </Typography>
      {loading && (
        <CircularProgress sx={{ display: "block", mx: "auto", my: 3 }} />
      )}
      <List>
        {history.length === 0 ? (
          <Typography>No search history found</Typography>
        ) : (
          history.map((search) => (
            <ListItem
              key={search.id}
              sx={{
                bgcolor: "background.paper",
                mb: 1,
                borderRadius: 1,
                boxShadow: 1,
              }}
              onClick={() => rerunSearch(search.query)}
              button
            >
              <ListItemText
                primary={search.query}
                secondary={`Searched on: ${new Date(
                  search.timestamp
                ).toLocaleString()}`}
              />
              <IconButton onClick={(e) => deleteSearch(search.id, e)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}

export default SearchHistory;
