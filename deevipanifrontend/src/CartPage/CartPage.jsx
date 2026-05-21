import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import atta from "../assets/atta.png";
import "./CartPage.css";
import NextNavbar from "../NextNavbar/NextNavbar";
import api from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
function CartPage({ onContinueShopping, onCheckout }) {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  const [cartItems,       setCartItems]       = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError,   setCheckoutError]   = useState(null);
  const [orderSuccess,    setOrderSuccess]    = useState(false);

  useEffect(() => { loadCart(); }, []);

  // ── FETCH CART ───────────────────────────────────────────────
  const loadCart = async () => {
    try {
      const response = await api.get("/cart");
      const formatted = response.data.map((c) => {

        // COMBO ITEM
        if (c.type === "COMBO") {
          return {
            cartId:        c.id,
            productId:     c.combo?.id,
            variantId:     null,
            type:          "COMBO",
            name:          c.combo?.comboName,
            price:         c.price,
            discountPrice: null,
            imageUrl:      c.combo?.imageUrl,
            brand:         "Combo Offer",
            quantity:      null,
            weight:        null,
            qty:           c.quantity,
          };
        }

        // PRODUCT ITEM — capture variantId from response
        return {
  cartId:        c.id,
  productId:     c.product?.id,
  variantId:     c.variantId ?? c.variant?.id ?? c.variant?.variantId ?? null,
  variantName:   c.variant?.variantName ?? c.variantName ?? null,
  type:          "PRODUCT",
  name:          c.product?.name,

  // ✅ If variant selected use variant price directly
  price:
    c.variant?.price ??
    c.product?.price,

  // ✅ Product discount only for normal products
  discountPrice:
    c.variant
      ? null
      : c.product?.discountPrice,

  imageUrl:      c.product?.imageUrl,
  brand:         c.product?.brand,
  quantity:      c.variant?.variantName ?? c.product?.quantity,
  weight:        c.product?.weight,
  qty:           c.quantity,
};
      });

      setCartItems(formatted);
    } catch (err) {
      toast.error("Failed to load cart");
    }
  };

  // ── UPDATE QUANTITY ──────────────────────────────────────────
  const onUpdateCart = async (item, qty) => {
    if (qty <= 0) {
      onRemoveFromCart(item);
      return;
    }

    try {
      if (item.type === "COMBO") {
        await api.put(`/cart/combo/${item.productId}?qty=${qty}`);
      } else {
        // Include variantId so the backend updates the right cart line
        const params = new URLSearchParams({ qty });
        if (item.variantId) params.append("variantId", item.variantId);
        const url = item.variantId
  ? `/cart/${item.productId}?qty=${qty}&variantId=${item.variantId}`
  : `/cart/${item.productId}?qty=${qty}`;

await api.put(url);
      }

      setCartItems((prev) =>
        prev.map((i) => i.cartId === item.cartId ? { ...i, qty } : i)
      );
    } catch (err) {
      toast.error("Failed to update cart");
    }
  };

  // ── REMOVE ITEM ──────────────────────────────────────────────
  const onRemoveFromCart = async (item) => {
    try {
      if (item.type === "COMBO") {
        await api.delete(`/cart/combo/${item.productId}`);
      } 
      else {

  const url = item.variantId
  ? `/cart/${item.productId}?variantId=${item.variantId}`
  : `/cart/${item.productId}`;

await api.delete(url);
}

      setCartItems((prev) => prev.filter((i) => i.cartId !== item.cartId));
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  // ── LOAD RAZORPAY SCRIPT ─────────────────────────────────────
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id      = "razorpay-script";
      script.src     = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload  = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ── PROCEED TO CHECKOUT (check contact first) ─────────────────
  const proceedCheckout = async () => {

  try {

    const res = await api.get("/contacts");

    if (!res.data || res.data.length === 0) {

      navigate("/contact");
      return;
    }

    // ✅ USE FIRST SAVED CONTACT
    const contact = res.data[0];

    handleCheckout(contact);

  } catch (err) {

    console.error(err);

    navigate("/contact");
  }
};
  // ── CHECKOUT WITH RAZORPAY ───────────────────────────────────
  const handleCheckout = async (contact) => {
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setCheckoutError("Failed to load payment gateway. Please try again.");
        setCheckoutLoading(false);
        return;
      }

      const orderPayload = {

  // ✅ CONTACT DETAILS
  fullName: contact.fullName,
  phone:    contact.phone,
  email:    contact.email,
  address:  contact.address,
  city:     contact.city,
  state:    contact.state,
  zipCode:  contact.zipCode,
  country:  contact.country,

  // ✅ CART DETAILS
  items: cartItems.map((item) => ({
    productId:     item.productId,
    variantId:     item.variantId ?? null,
    name:          item.name,
    price:         item.price,
    discountPrice: item.discountPrice,
    quantity:      item.qty,
  })),

  totalMRP:       mrpTotal,
  totalDiscount:  saved,
  deliveryCharge: delivery,
  totalAmount:    total,
};

      const orderRes = await api.post(
  "/order/create",
  orderPayload
);

      const razorpayOrderId =
  orderRes.data.razorpayOrderId;

const amountInPaise =
  Number(orderRes.data.amount);

const currency =
  orderRes.data.currency;

console.log("Order Response:", orderRes.data);
console.log("Razorpay Order ID:", razorpayOrderId);
console.log("Amount:", amountInPaise);
console.log("Currency:", currency);

     const options = {
  key: process.env.REACT_APP_RAZORPAY_KEY,
  amount: amountInPaise,
  currency,
  name: "Your Store",
  description: "Order Payment",
  order_id: razorpayOrderId,

  handler: async function (response) {

  console.log("Payment Success:", response);

  try {

    const verifyRes = await api.post(
      "/payment/verify",
      {
        razorpay_order_id:
          response.razorpay_order_id,

        razorpay_payment_id:
          response.razorpay_payment_id,

        razorpay_signature:
          response.razorpay_signature
      }
    );

    console.log("Verify Response:", verifyRes.data);
if (verifyRes.data.status === "success") {

  toast.success("Payment Verified Successfully ✅");

  // Reload latest cart from backend
  await loadCart();

  // Clear frontend cart instantly
  setCartItems([]);

  setCheckoutLoading(false);

  // Redirect user
  navigate("/HomeSecond");

} else {

      toast.error(
  verifyRes.data.message || "Payment Failed ❌"
);

      setCheckoutLoading(false);
    }

  } catch (error) {

    console.log(error);

    toast.error("Payment Verification Failed ❌");

    setCheckoutLoading(false);
  }
}
};

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setCheckoutError(
          response.error?.description || "Payment failed. Please try again."
        );
        setCheckoutLoading(false);
      });
      rzp.open();
      setCheckoutLoading(false);
    } catch (err) {
      console.error("Checkout failed:", err);
      setCheckoutError(
        err.response?.data?.message || "Failed to initiate payment. Please try again."
      );
      setCheckoutLoading(false);
    }
  };

  // ── TOTALS ───────────────────────────────────────────────────
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);

  // MRP total = full (non-discounted) price × qty
  const mrpTotal = cartItems.reduce(
    (s, i) => s + (i.price ?? 0) * i.qty,
    0
  );

  // Discounted total = effective price (discountPrice if exists, else price) × qty
  const discountedTotal = cartItems.reduce(
    (s, i) => s + ((i.discountPrice ?? i.price) ?? 0) * i.qty,
    0
  );

  const saved    = mrpTotal - discountedTotal; // actual savings
  const delivery = 0;
  const total    = discountedTotal + delivery;

  const fmt = (n) => "₹" + (n ?? 0).toLocaleString("en-IN");

  // ── ORDER SUCCESS ─────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <>
        <NextNavbar />
        <div className="cp-page">
          <div className="cp-empty">
            <div style={{ fontSize: 64 }}>🎉</div>
            <p className="cp-empty-title">Order placed successfully!</p>
            <p className="cp-empty-sub">
              Thank you for your purchase. Your order is being processed.
            </p>
            <button className="cp-continue-btn" onClick={() => navigate("/Homepage")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── EMPTY CART ────────────────────────────────────────────────
  if (!cartItems.length) {
    return (
      <>
        <NextNavbar />
        <div className="cp-page">
          <div className="cp-empty">
            <FaShoppingCart className="cp-empty-icon" />
            <p className="cp-empty-title">Your cart is empty</p>
            <p className="cp-empty-sub">
              Add items from the product page to get started.
            </p>
            <button className="cp-continue-btn" onClick={() => navigate("/HomeSecond")}>
              Continue shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── MAIN PAGE ─────────────────────────────────────────────────
  return (
    <>
      <NextNavbar />
      <div className="cp-page">

        <h1 className="cp-title">Your cart</h1>
        <p className="cp-count">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>

        <div className="cp-layout">

          {/* ── ITEMS ─────────────────────────────────────── */}
          <div className="cp-items">
            {cartItems.map((item) => {
              const mrpPrice    = item.price;
              const salePrice   = item.discountPrice;
              const hasDiscount = salePrice != null && mrpPrice != null && salePrice < mrpPrice;
              const linePrice   = hasDiscount ? salePrice : mrpPrice;

              return (
                <div className="cp-item" key={item.cartId}>

                  {/* IMAGE */}
                  <img
                    className="cp-img"
                    src={item.imageUrl || atta}
                    alt={item.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = atta; }}
                  />

                  {/* BODY */}
                  <div className="cp-item-body">
                    {item.brand && <p className="cp-item-brand">{item.brand}</p>}
                    <p className="cp-item-name">{item.name}</p>
                    {item.variantName && (
                      <p className="cp-item-variant">{item.variantName}</p>
                    )}
                    {!item.variantName && (item.quantity || item.weight) && (
                      <p className="cp-item-variant">{item.quantity || item.weight}</p>
                    )}

                    {/* PRICE */}
                    <div className="cp-price-row">
                      <span className="cp-price">
                        {linePrice != null ? fmt(linePrice) : "—"}
                      </span>
                      {hasDiscount && (
                        <span className="cp-mrp">{fmt(mrpPrice)}</span>
                      )}
                    </div>

                    {/* QTY */}
                    <div className="cp-qty-row">
                      <button
                        className="cp-qty-btn"
                        onClick={() => onUpdateCart(item, item.qty - 1)}
                      >
                        −
                      </button>
                      <span className="cp-qty-num">{item.qty}</span>
                      <button
                        className="cp-qty-btn"
                        onClick={() => onUpdateCart(item, item.qty + 1)}
                      >
                        +
                      </button>
                      <button
                        className="cp-remove-btn"
                        onClick={() => onRemoveFromCart(item)}
                      >
                        <FaTrash size={12} /> Remove
                      </button>
                    </div>
                  </div>

                  {/* ITEM TOTAL */}
                  <div className="cp-item-total">
                    {fmt((linePrice ?? 0) * item.qty)}
                  </div>

                </div>
              );
            })}
          </div>

          {/* ── SUMMARY ───────────────────────────────────── */}
          <div className="cp-summary">
            <p className="cp-summary-title">Order summary</p>

            <div className="cp-sum-row">
              <span>Subtotal (MRP)</span>
              <span>{fmt(mrpTotal)}</span>
            </div>

            {saved > 0 && (
              <div className="cp-sum-row cp-sum-saved">
                <span>Discount</span>
                <span>− {fmt(saved)}</span>
              </div>
            )}

            <div className="cp-sum-row">
              <span>Delivery</span>
              <span className={delivery === 0 ? "cp-free" : ""}>
                {delivery === 0 ? "Free" : fmt(delivery)}
              </span>
            </div>

            <div className="cp-sum-row cp-sum-total">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>

            {checkoutError && (
              <div className="cp-checkout-error">
                {checkoutError}
                <button
                  style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
                  onClick={() => setCheckoutError(null)}
                >
                  ✕
                </button>
              </div>
            )}

            <button
              className="cp-checkout-btn"
              onClick={proceedCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? "Please wait…" : "Proceed to checkout"}
            </button>

            <button
              className="cp-continue-btn"
              onClick={() => navigate("/HomeSecond")}
            >
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CartPage;