import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import api from "../utils/api";

function OpenverseRegister() {
  const [form, setForm] = useState({ name: "", description: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/register_openverse", form);
      setResult(response.data.data);
      toast.success("Application registered! Check email to verify.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Openverse API Registration
      </Typography>
      <Box
        sx={{
          maxWidth: 500,
          bgcolor: "white",
          p: 3,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <form onSubmit={handleSubmit}>
          <TextField
            label="Application Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Register"}
          </Button>
        </form>
      </Box>
      {result && (
        <Box
          sx={{ mt: 3, p: 2, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}
        >
          <Typography variant="h6">Registration Details</Typography>
          <Typography>Name: {result.name}</Typography>
          <Typography>Client ID: {result.client_id}</Typography>
          <Typography>Client Secret: {result.client_secret}</Typography>
          <Typography color="warning.main">
            Store these in your .env file and verify the email to activate.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default OpenverseRegister;
