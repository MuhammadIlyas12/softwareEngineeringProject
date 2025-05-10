import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../utils/api";

function ImageSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDetail, setImageDetail] = useState(null);
  const [expandedFilters, setExpandedFilters] = useState({
    use: true,
    license: false,
    type: false,
    extension: false,
    aspectRatio: false,
    size: false,
  });

  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState([]);
  const [selectedImageSize, setSelectedImageSize] = useState([]);
  const [selectedUse, setSelectedUse] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return toast.error("Please enter a search query");
      const username = "currentUser"; // Fetch the username from state or localStorage
      await saveSearch(username, query);
    setLoading(true);
    try {
      const response = await api.get("/search_images", {
        params: {
          q: query,
          license: selectedLicenses.join(","),
          categories: selectedTypes.join(","),
          extension: selectedExtensions.join(","),
          aspect_ratio: selectedAspectRatio.join(","),
          image_size: selectedImageSize.join(","),
          use: selectedUse.join(","),
          page_size: 12,
          page: 1,
        },
      });
      setResults(response.data.results || []);
      toast.success("Images fetched successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch images");
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = async (username, query) => {
    try {
      const token = localStorage.getItem("token"); // Get token from localStorage
      await api.post(
        "/search_history",
        { username, query },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Search saved");
    } catch (err) {
      console.error("Error saving search", err);
    }
  };

  const handleImageClick = async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/image_detail/${id}`);
      setImageDetail(response.data);
      setSelectedImage(id);
      toast.success("Image details fetched!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch image details");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e, type) => {
    const { value, checked } = e.target;
    let updatedState;

    switch (type) {
      case "license":
        updatedState = checked
          ? [...selectedLicenses, value]
          : selectedLicenses.filter((item) => item !== value);
        setSelectedLicenses(updatedState);
        break;
      case "type":
        updatedState = checked
          ? [...selectedTypes, value]
          : selectedTypes.filter((item) => item !== value);
        setSelectedTypes(updatedState);
        break;
      case "extension":
        updatedState = checked
          ? [...selectedExtensions, value]
          : selectedExtensions.filter((item) => item !== value);
        setSelectedExtensions(updatedState);
        break;
      case "aspect_ratio":
        updatedState = checked
          ? [...selectedAspectRatio, value]
          : selectedAspectRatio.filter((item) => item !== value);
        setSelectedAspectRatio(updatedState);
        break;
      case "image_size":
        updatedState = checked
          ? [...selectedImageSize, value]
          : selectedImageSize.filter((item) => item !== value);
        setSelectedImageSize(updatedState);
        break;
      case "use":
        updatedState = checked
          ? [...selectedUse, value]
          : selectedUse.filter((item) => item !== value);
        setSelectedUse(updatedState);
        break;
      default:
        break;
    }
  };

  const toggleFilterSection = (section) => {
    setExpandedFilters({
      ...expandedFilters,
      [section]: !expandedFilters[section],
    });
  };

  const licenseColors = {
    CC0: "#4caf50",
    "CC BY": "#2196f3",
    "CC BY-SA": "#673ab7",
    "CC BY-NC": "#ff9800",
    "CC BY-ND": "#f44336",
    "CC BY-NC-SA": "#9c27b0",
    "CC BY-NC-ND": "#e91e63",
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          mb: 4,
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "primary.main",
            mb: 3,
            textAlign: "center",
          }}
        >
          Discover Amazing Images
        </Typography>

        <Paper
          component="form"
          onSubmit={handleSearch}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              label="Search for images..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SearchIcon />
                )
              }
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              Search
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={9}>
            {loading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  my: 4,
                }}
              >
                <CircularProgress size={60} thickness={4} />
              </Box>
            )}

            {!loading && results.length === 0 && (
              <Paper
                sx={{
                  p: 4,
                  textAlign: "center",
                  bgcolor: "background.paper",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  {query
                    ? "No results found. Try a different search."
                    : "Enter a search term to find images"}
                </Typography>
              </Paper>
            )}

            <Grid container spacing={3}>
              {results.map((image) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      boxShadow: 3,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => handleImageClick(image.id)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        image.thumbnail || "https://via.placeholder.com/300"
                      }
                      alt={image.title}
                      sx={{
                        objectFit: "cover",
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {image.title}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            mr: 1,
                            bgcolor: "primary.main",
                            fontSize: 12,
                          }}
                        >
                          {image.creator?.charAt(0) || "?"}
                        </Avatar>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {image.creator || "Unknown author"}
                        </Typography>
                      </Box>
                      {image.license && (
                        <Chip
                          label={image.license}
                          size="small"
                          sx={{
                            mt: 1,
                            bgcolor: licenseColors[image.license] || "grey.300",
                            color: "white",
                            fontSize: 10,
                            height: 20,
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Filters Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: 3,
                bgcolor: "background.paper",
                position: "sticky",
                top: 20,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <FilterIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Filters
                </Typography>
                {(selectedLicenses.length > 0 ||
                  selectedTypes.length > 0 ||
                  selectedExtensions.length > 0 ||
                  selectedAspectRatio.length > 0 ||
                  selectedImageSize.length > 0 ||
                  selectedUse.length > 0) && (
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedLicenses([]);
                      setSelectedTypes([]);
                      setSelectedExtensions([]);
                      setSelectedAspectRatio([]);
                      setSelectedImageSize([]);
                      setSelectedUse([]);
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    Clear all
                  </Button>
                )}
              </Box>

              {/* Use Filter */}
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                    p: 1,
                    borderRadius: 1,
                  }}
                  onClick={() => toggleFilterSection("use")}
                >
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    Usage Rights
                  </Typography>
                  {expandedFilters.use ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Box>
                <Collapse in={expandedFilters.use}>
                  <FormGroup sx={{ pl: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedUse.includes("Use commercially")}
                          onChange={(e) => handleFilterChange(e, "use")}
                          value="Use commercially"
                        />
                      }
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <span>Commercial use</span>
                          <Tooltip title="Allowed for business purposes">
                            <InfoIcon
                              fontSize="small"
                              sx={{ ml: 1, color: "text.secondary" }}
                            />
                          </Tooltip>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedUse.includes("Modify or adapt")}
                          onChange={(e) => handleFilterChange(e, "use")}
                          value="Modify or adapt"
                        />
                      }
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <span>Modification</span>
                          <Tooltip title="Allowed to modify or adapt">
                            <InfoIcon
                              fontSize="small"
                              sx={{ ml: 1, color: "text.secondary" }}
                            />
                          </Tooltip>
                        </Box>
                      }
                    />
                  </FormGroup>
                </Collapse>
              </Box>
              <Divider sx={{ my: 1 }} />

              {/* License Filter */}
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                    p: 1,
                    borderRadius: 1,
                  }}
                  onClick={() => toggleFilterSection("license")}
                >
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    Licenses
                  </Typography>
                  {expandedFilters.license ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Box>
                <Collapse in={expandedFilters.license}>
                  <FormGroup sx={{ pl: 2 }}>
                    {Object.entries({
                      CC0: "Public Domain",
                      "CC BY": "Attribution",
                      "CC BY-SA": "Attribution-ShareAlike",
                      "CC BY-NC": "Attribution-NonCommercial",
                      "CC BY-ND": "Attribution-NoDerivs",
                      "CC BY-NC-SA": "Attribution-NonCommercial-ShareAlike",
                      "CC BY-NC-ND": "Attribution-NonCommercial-NoDerivs",
                    }).map(([value, label]) => (
                      <FormControlLabel
                        key={value}
                        control={
                          <Checkbox
                            size="small"
                            checked={selectedLicenses.includes(value)}
                            onChange={(e) => handleFilterChange(e, "license")}
                            value={value}
                            sx={{
                              color: licenseColors[value] || "default",
                              "&.Mui-checked": {
                                color: licenseColors[value] || "default",
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <span>{label}</span>
                            <Tooltip
                              title={`Creative Commons ${label} License`}
                            >
                              <InfoIcon
                                fontSize="small"
                                sx={{ ml: 1, color: "text.secondary" }}
                              />
                            </Tooltip>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </Collapse>
              </Box>
              <Divider sx={{ my: 1 }} />

              {/* Image Type Filter */}
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                    p: 1,
                    borderRadius: 1,
                  }}
                  onClick={() => toggleFilterSection("type")}
                >
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    Image Types
                  </Typography>
                  {expandedFilters.type ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Box>
                <Collapse in={expandedFilters.type}>
                  <FormGroup sx={{ pl: 2 }}>
                    {["Photographs", "Illustrations", "Digitized Artworks"].map(
                      (type) => (
                        <FormControlLabel
                          key={type}
                          control={
                            <Checkbox
                              size="small"
                              checked={selectedTypes.includes(type)}
                              onChange={(e) => handleFilterChange(e, "type")}
                              value={type}
                            />
                          }
                          label={type}
                        />
                      )
                    )}
                  </FormGroup>
                </Collapse>
              </Box>
              <Divider sx={{ my: 1 }} />

              {/* Extension Filter */}
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                    p: 1,
                    borderRadius: 1,
                  }}
                  onClick={() => toggleFilterSection("extension")}
                >
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    File Formats
                  </Typography>
                  {expandedFilters.extension ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Box>
                <Collapse in={expandedFilters.extension}>
                  <FormGroup sx={{ pl: 2 }}>
                    {["JPEG", "PNG", "GIF", "SVG"].map((ext) => (
                      <FormControlLabel
                        key={ext}
                        control={
                          <Checkbox
                            size="small"
                            checked={selectedExtensions.includes(ext)}
                            onChange={(e) => handleFilterChange(e, "extension")}
                            value={ext}
                          />
                        }
                        label={ext}
                      />
                    ))}
                  </FormGroup>
                </Collapse>
              </Box>
              <Divider sx={{ my: 1 }} />

              {/* Aspect Ratio Filter */}
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                    p: 1,
                    borderRadius: 1,
                  }}
                  onClick={() => toggleFilterSection("aspectRatio")}
                >
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    Aspect Ratios
                  </Typography>
                  {expandedFilters.aspectRatio ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Box>
                <Collapse in={expandedFilters.aspectRatio}>
                  <FormGroup sx={{ pl: 2 }}>
                    {["Tall", "Wide", "Square"].map((ratio) => (
                      <FormControlLabel
                        key={ratio}
                        control={
                          <Checkbox
                            size="small"
                            checked={selectedAspectRatio.includes(ratio)}
                            onChange={(e) =>
                              handleFilterChange(e, "aspect_ratio")
                            }
                            value={ratio}
                          />
                        }
                        label={ratio}
                      />
                    ))}
                  </FormGroup>
                </Collapse>
              </Box>
              <Divider sx={{ my: 1 }} />

              {/* Image Size Filter */}
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                    p: 1,
                    borderRadius: 1,
                  }}
                  onClick={() => toggleFilterSection("size")}
                >
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    Image Sizes
                  </Typography>
                  {expandedFilters.size ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Box>
                <Collapse in={expandedFilters.size}>
                  <FormGroup sx={{ pl: 2 }}>
                    {["Small", "Medium", "Large"].map((size) => (
                      <FormControlLabel
                        key={size}
                        control={
                          <Checkbox
                            size="small"
                            checked={selectedImageSize.includes(size)}
                            onChange={(e) =>
                              handleFilterChange(e, "image_size")
                            }
                            value={size}
                          />
                        }
                        label={size}
                      />
                    ))}
                  </FormGroup>
                </Collapse>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Image Detail Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Typography variant="h6">Image Details</Typography>
          <IconButton
            onClick={() => setSelectedImage(null)}
            sx={{ color: "primary.contrastText" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {imageDetail && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 1, borderRadius: 2 }}>
                  <img
                    src={imageDetail.url}
                    alt={imageDetail.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 8,
                      maxHeight: "60vh",
                      objectFit: "contain",
                    }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  {imageDetail.title}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Chip
                    label={imageDetail.license || "Unknown license"}
                    size="medium"
                    sx={{
                      bgcolor: licenseColors[imageDetail.license] || "grey.300",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Creator
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {imageDetail.creator || "Unknown"}
                  </Typography>
                </Box>

                {imageDetail.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Description
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {imageDetail.description}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Source
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {imageDetail.provider || "Unknown"}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  href={imageDetail.url}
                  target="_blank"
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  Download Image
                </Button>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ImageSearch;
