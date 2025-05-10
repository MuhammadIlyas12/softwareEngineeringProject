import {
  Container,
  Stack,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("images");

  const handleSearch = () => {
    if (!query.trim()) return;
    const path = type === "images" ? "/images" : "/audio";
    navigate(path, { state: { query } });
  };

  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h4" fontWeight={600}>
          Hey, {user}! 👋
        </Typography>

        <Paper sx={{ p: 3, width: "100%", maxWidth: 600 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <TextField
              select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              sx={{ width: { xs: "100%", sm: 140 } }}
            >
              <MenuItem value="images">Images</MenuItem>
              <MenuItem value="audio">Audio</MenuItem>
            </TextField>
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
