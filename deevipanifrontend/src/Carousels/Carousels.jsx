import "../../src/Carousels/Carousels.css"
import React, { useEffect, useState } from "react";
import Banner1 from "../../src/assets/b1.png"
import Banner2 from "../../src/assets/b2.png"
import Banner3 from "../../src/assets/b3.png"
function Carousels(){
  const images = [
  Banner1, Banner2,Banner3
];
const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 3000); // change every 3 sec

    return () => clearInterval(interval);
  }, []);
    return(
       <>
       <div className="carousel">
        
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, index) => (
          <div className="carousel-slide" key={index}>
            <img src={img} alt={`slide-${index}`} />
          </div>
        ))}
      </div>
    </div>
       </>
    )
}
export default Carousels