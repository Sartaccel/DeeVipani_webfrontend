import { Link } from "react-router-dom";
import "../../src/Footer/Footer.css";
import FooterLogo from "../../src/assets/logo.png";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope 
} from "react-icons/fa";
function Footer() {
  return (<>
  
    <footer className="footer">
      <div className="footer-main">

        {/* Logo */}
        <div className="footerlogo">
          <img src={FooterLogo} alt="FooterLogo" />
        </div>

        {/* Website Links */}
        <div className="footer-section">
          <h3>Website</h3>
          <ul>
            <li><Link to="/HomeSecond">Product</Link></li>
            <li><Link to="/Combooffers">Combo Offer</Link></li>
            <li><Link to="/Contact">Contact Details</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="about-footer-heading">
    About Our Website
  </h3>

  <p className="about-footer-description">
    Our platform offers fresh groceries, household essentials,
    combo deals, and quality products at affordable prices.
    We aim to provide a smooth and secure shopping experience
    for every customer.
  </p>

  {/* <p className="about-footer-description">
    With fast delivery, easy payments, and trusted products,
    we make online shopping simple, convenient, and reliable.
  </p> */}

  <div className="about-footer-details">
    <p><FaMapMarkerAlt className="location-icon" /> Kanyakumari, Tamil Nadu

</p>
    <p><FaPhoneAlt className="footer-icon" /> +91 98765 43210</p>
    <p> <FaEnvelope className="footer-icon" /> support@yourstore.com</p>
  </div>
        </div>

      </div>

      {/* Bottom */}
      
    </footer>
    <div className="footer-bottom">
        <div className="copy-right">
            <p>Copyright © 2026 | deevipani.com</p>

        </div>
  

    <div className="social-icons">
    <a href="https://facebook.com" target="_blank" rel="noreferrer">
      <FaFacebookF />
    </a>

    <a href="https://www.instagram.com/deevipani_grocery?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer">
      <FaInstagram />
    </a>
  </div>
</div>
    </>
  );
}

export default Footer;