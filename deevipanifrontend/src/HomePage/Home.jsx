import "../../src/HomePage/Home.css";
import Navbar from "../Navbar/Navbar";
import { FaTruck, FaCertificate, FaTags, FaHeartbeat } from "react-icons/fa";
import { Link } from "react-router-dom";
import homeimage from "../../src/assets/homeimg.png"
import Carousels from "../Carousels/Carousels";
import Footer from "../Footer/Footer";
import { FaWhatsapp } from "react-icons/fa";

import Combooffers from "../Combooffers/Combooffers";
function Home() {
  return (
    <>
      <Navbar />
      <Carousels/>
      <div className="home">
        <div className="home-container">
          <a
  href="https://wa.me/916369564771"
  target="_blank"
  rel="noopener noreferrer"
  className="whatsapp-container"
>
  <span className="whatsapp-text">Chat with us</span>

  <div className="whatsapp-icon">
    <FaWhatsapp />
  </div>
</a>

          {/* LEFT CONTENT */}
          <div className="home-left left-div">
            <h2>Best Quality Products</h2>
            <h1>Fresh Groceries in 24 Hours</h1>
            <p>
              At DeeVipani, we bring the finest and freshest groceries right to your doorstep. From spices and staples to everyday essentials, our promise is simple  premium quality, delivered within 24 hours.<br/>

            Experience convenience, reliability, and freshness with every order. Shop online today and enjoy groceries at your fingertips
            </p>

            
            <Link to="/HomeSecond" className="home-btn">Explore Now</Link>
          </div>

          {/* RIGHT IMAGE */}
          <div className="home-right  right-div">
            <img src={homeimage} alt="hero" className="hero-image" />
          </div>

        </div>
        </div>
        
        {/* second div  */}
        <div className="features-container">
      
      <div className="feature-box">
        
        <p><FaTruck className="iconhome" />Free Shipping</p>
        <p>Enjoy free doorstep delivery.</p>
      </div>

      <div className="feature-box">
        
        <p><FaCertificate className="iconhome" />Quality Product</p>
        <p>Only the best for your family.</p>
      </div>

      <div className="feature-box">
        
        <p> <FaTags className="iconhome" />Everyday Deals</p>
        <p>Big savings on essentials you need daily.</p>
      </div>

      <div className="feature-box">
        
        <p className="pp"><FaHeartbeat className="iconhome" />Healthy Living</p>
        <p className="ppp">
          Fresh, natural, and wholesome groceries.
        </p>
      </div>

        </div>
      <Combooffers/>
      <Footer/>
    </>
  );
}

export default Home;