import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);

  const pages = [
    { label: "Home", to: "/home" },
    { label: "History", to: "/history" },
    { label: "Contacts", to: "/contacts" },
  ];

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Stack direction="row" alignItems="center" sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            Media App
          </Typography>
          <IconButton
            color="inherit"
            sx={{ display: { sm: "none" } }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <MenuIcon />
          </IconButton>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          {pages.map((p) => (
            <Button key={p.to} color="inherit" component={Link} to={p.to}>
              {p.label}
            </Button>
          ))}
          {user && (
            <Button
              color="inherit"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </Button>
          )}
        </Stack>
      </Toolbar>

      <Menu anchorEl={anchorEl} open={open} onClose={close}>
        {pages.map((p) => (
          <MenuItem key={p.to} component={Link} to={p.to} onClick={close}>
            {p.label}
          </MenuItem>
        ))}
        {user && (
          <MenuItem
            onClick={() => {
              close();
              logout();
              navigate("/login");
            }}
          >
            Logout
          </MenuItem>
        )}
      </Menu>
    </AppBar>
  );
}
