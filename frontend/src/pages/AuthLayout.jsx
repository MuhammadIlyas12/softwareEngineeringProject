import { Box, Card, Typography } from "@mui/material";

export default function AuthLayout({ title, children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg,#1e88e5 20%,#42a5f5 100%)",
      }}
    >
      <Card sx={{ p: 4, width: 380, boxShadow: 6 }}>
        <Typography variant="h5" textAlign="center" mb={2} fontWeight={600}>
          {title}
        </Typography>
        {children}
      </Card>
    </Box>
  );
}
