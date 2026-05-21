import React, { useState, useEffect } from "react";
import "./Contact.css";
import lgoo from "../assets/logo.png";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Contact() {

  const navigate = useNavigate();

  // GET LOGGED USER
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // USER ID
  const userId = storedUser?.id;

  // CONTACT ID
  const [contactId, setContactId] = useState(null);

  // FORM
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: storedUser?.email || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  // =========================
  // FETCH CONTACT
  // =========================
  useEffect(() => {

    if (userId) {
      fetchContact();
    }

  }, [userId]);

  const fetchContact = async () => {

    try {

      const res = await api.get("/contacts");

      // IF CONTACT EXISTS
      if (res.data && res.data.length > 0) {

        const contact = res.data[0];

        setContactId(contact.id);

        setForm({
          fullName: contact.fullName || "",
          phone: contact.phone || "",
          email: contact.email || "",
          address: contact.address || "",
          city: contact.city || "",
          state: contact.state || "",
          zipCode: contact.zipCode || "",
          country: contact.country || "",
        });
      }

    } catch (err) {

      console.error("Fetch failed:", err);
    }
  };

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // SAVE / UPDATE CONTACT
  // =========================
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      // UPDATE CONTACT
      if (contactId) {

        await api.put(
  `/contacts/${contactId}`,
  form
);

        alert("Contact updated successfully!");

      } else {

        // CREATE CONTACT
        const res = await api.post(
  `/contacts`,
  form
);

        setContactId(res.data.id);

        alert("Contact saved successfully!");
      }

      // GO TO PAYMENT PAGE
      navigate("/CartPage", {
  state: {
    startPayment: true
  }
});

    } catch (err) {

      console.error("Save failed:", err);

      alert("Failed to save contact");
    }
  };

  // =========================
  // DELETE CONTACT
  // =========================
  const handleDelete = async () => {

    if (!contactId) return;

    try {

      await api.delete(
  `/contacts/${contactId}`
);

      alert("Contact deleted successfully!");

      // RESET FORM
      setContactId(null);

      setForm({
        fullName: "",
        phone: "",
        email: storedUser?.email || "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
      });

    } catch (err) {

      console.error("Delete failed:", err);

      alert("Failed to delete contact");
    }
  };

  return (
    <div className="contact-page">

      {/* LEFT SIDE */}
      <div className="contact-left">

        <img
          src={lgoo}
          alt="Dee Vipani Logo"
          className="contact-logo"
        />

        <p className="contact-tagline">
          Groceries at your fingertips
        </p>

      </div>

      {/* RIGHT SIDE */}
      <div className="contact-right">

        <div className="contact-card">

          <h2 className="contact-title">
            Contact Details
          </h2>

          <form onSubmit={handleSubmit}>

            {/* ROW 1 */}
            <div className="form-row">

              <div className="form-group">

                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* EMAIL */}
            <div className="form-group">

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
              />

            </div>

            {/* ADDRESS */}
            <div className="form-group">

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                required
              />

            </div>

            {/* ROW 2 */}
            <div className="form-row">

              <div className="form-group">

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* ROW 3 */}
            <div className="form-row">

              <div className="form-group">

                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip Code"
                  value={form.zipCode}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={form.country}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* BUTTONS */}
            <div className="contact-actions">

              <button
                type="submit"
                className="contact-btn"
              >
                {contactId
                  ? "Update & Continue"
                  : "Save & Continue"}
              </button>

              {contactId && (

                <button
                  type="button"
                  className="contact-btn delete-btn"
                  onClick={handleDelete}
                >
                  Delete
                </button>

              )}

            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;