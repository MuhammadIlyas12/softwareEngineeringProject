import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import api from "../utils/api";

function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/contacts");
      console.log("Contacts response:", response.data);
      setContacts(response.data.contacts || []);
      toast.success("Contacts fetched!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/create_contact", form);
      fetchContacts();
      setForm({ firstName: "", lastName: "", email: "" });
      toast.success("Contact created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create contact");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setEditId(contact.id);
    setForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/update_contact/${editId}`, form);
      fetchContacts();
      setEditId(null);
      setForm({ firstName: "", lastName: "", email: "" });
      toast.success("Contact updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update contact");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/delete_contact/${id}`);
      fetchContacts();
      toast.success("Contact deleted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete contact");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Contact List
      </Typography>
      <form onSubmit={editId ? handleUpdate : handleCreate}>
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField
            label="First Name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
          <TextField
            label="Last Name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? (
              <CircularProgress size={24} />
            ) : editId ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </Box>
      </form>
      {loading && (
        <CircularProgress sx={{ display: "block", mx: "auto", my: 3 }} />
      )}
      <List>
        {contacts.length === 0 ? (
          <Typography>No contacts found</Typography>
        ) : (
          contacts.map((contact) => (
            <ListItem
              key={contact.id}
              sx={{
                bgcolor: "background.paper",
                mb: 1,
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <ListItemText
                primary={`${contact.firstName} ${contact.lastName}`}
                secondary={contact.email}
              />
              <IconButton onClick={() => handleEdit(contact)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(contact.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}

export default ContactList;
