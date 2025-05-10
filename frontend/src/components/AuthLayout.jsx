// src/pages/AuthLayout.jsx  (adjust the path to suit your project)

import PropTypes from "prop-types";
import { Box, Card, Typography } from "@mui/material";

/**
 * AuthLayout
 * ----------
 * A simple wrapper that
 *  • fills the viewport with a soft gradient background
 *  • centers a Card containing whatever children you pass
 *
 * Props
 *  • title   – string shown at the top of the card
 *  • children – form or any other JSX to render inside the card
 */
export default function AuthLayout({ title, children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #1e88e5 20%, #42a5f5 100%)",
        p: 2, // small padding for very narrow screens
      }}
    >
      <Card
        elevation={6}
        sx={{
          width: { xs: "100%", sm: 380 },
          maxWidth: "100%",
          p: 4,
          borderRadius: 3,
        }}
      >
        {title && (
          <Typography
            variant="h5"
            fontWeight={600}
            textAlign="center"
            mb={2}
            gutterBottom
          >
            {title}
          </Typography>
        )}
        {children}
      </Card>
    </Box>
  );
}

AuthLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};
