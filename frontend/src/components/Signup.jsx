import { useState } from "react";
import {
  TextField,
  Button,
  Stack,
  CircularProgress,
  Link,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import api from "../utils/api";
import { toast } from "react-toastify";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/register", form);
      toast.success("Account created – please log in");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account">
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            name="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="email"
            type="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="password"
            type="password"
            label="Password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
          <Link
            component={RouterLink}
            to="/login"
            underline="hover"
            textAlign="center"
          >
            Already have an account? Log in
          </Link>
        </Stack>
      </form>
    </AuthLayout>
  );
}
