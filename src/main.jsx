import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Check,
  ChevronRight,
  IndianRupee,
  Instagram,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import "./styles.css";

const PRODUCT = {
  id: "himachali-green-salt",
  name: "Himachali Green Salt",
  packSizes: [
    { id: "200g", label: "200 gram", price: 120, mrp: 150 },
    { id: "500g", label: "500 gram", price: 220, mrp: 250 }
  ],
  rating: "4.9",
  deliveryFee: 60,
  freeDeliveryAt: 999,
  image: "/images/pahadi-namak-hero.png",
};

const STORE_CONTACT = {
  whatsappNumber: "918559023422",
  displayPhone: "+91 85590 23422",
  instagramUrl: "https://www.instagram.com/p/DaBH0oHhrGC/?igsh=MTlsbTY0bXBjNWVmYw==",
};

const initialCheckout = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  pincode: "",
  notes: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildOwnerNotification(order) {
  return [
    "New Himachali Green Salt order",
    "",
    order.orderDetails,
    "",
    `Customer: ${order.name}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email || "Not provided"}`,
    `Address: ${order.address}`,
    `City: ${order.city}`,
    `Pincode: ${order.pincode}`,
    `Notes: ${order.notes || "None"}`,
  ].join("\n");
}

function App() {
  const [quantity, setQuantity] = useState(() => {
    const saved = Number(localStorage.getItem("salt-store-qty"));
    return Number.isFinite(saved) && saved > 0 ? saved : 1;
  });
  const [packSizeId, setPackSizeId] = useState(() => {
    const saved = localStorage.getItem("salt-store-pack-size");
    return PRODUCT.packSizes.some((packSize) => packSize.id === saved)
      ? saved
      : PRODUCT.packSizes[0].id;
  });
  const [checkout, setCheckout] = useState(initialCheckout);
  const [lastOrder, setLastOrder] = useState(null);
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const selectedPackSize =
    PRODUCT.packSizes.find((packSize) => packSize.id === packSizeId) || PRODUCT.packSizes[0];
  const subtotal = selectedPackSize.price * quantity;
  const delivery = subtotal >= PRODUCT.freeDeliveryAt ? 0 : PRODUCT.deliveryFee;
  const total = subtotal + delivery;

  const orderDetails = useMemo(
    () =>
      `${PRODUCT.name} (${selectedPackSize.label}) x ${quantity}\nSubtotal: ${formatCurrency(
        subtotal
      )}\nDelivery: ${formatCurrency(delivery)}\nTotal: ${formatCurrency(total)}`,
    [delivery, quantity, selectedPackSize.label, subtotal, total]
  );
  const ownerNotification = useMemo(
    () => (lastOrder ? buildOwnerNotification(lastOrder) : ""),
    [lastOrder]
  );
  const whatsappUrl = ownerNotification
    ? `https://wa.me/${STORE_CONTACT.whatsappNumber}?text=${encodeURIComponent(ownerNotification)}`
    : "";

  useEffect(() => {
    localStorage.setItem("salt-store-qty", String(quantity));
  }, [quantity]);

  useEffect(() => {
    localStorage.setItem("salt-store-pack-size", packSizeId);
  }, [packSizeId]);

  const updateCheckout = (event) => {
    const { name, value } = event.target;
    setCheckout((current) => ({ ...current, [name]: value }));
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    setStatus("submitting");
    setStatusMessage("");

    const submittedOrder = {
      ...checkout,
      quantity,
      packSize: selectedPackSize.label,
      total: formatCurrency(total),
      orderDetails,
    };

    try {
      const response = await fetch("/.netlify/functions/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submittedOrder),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Order submission failed");
      }

      setStatus("success");
      setStatusMessage(
        result.whatsapp?.sent
          ? "Order received. We will contact you to confirm delivery."
          : "Order received. WhatsApp auto-notification needs setup or failed, so use the WhatsApp fallback below."
      );
      setLastOrder(submittedOrder);
      setCheckout(initialCheckout);
    } catch (error) {
      setStatus("error");
      setStatusMessage(error.message || "Order could not be submitted. Please try again.");
    }
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Himachali Green Salt home">
          <span className="brand-mark">H</span>
          <span>Himachali Salt</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#benefits">Benefits</a>
          <a href="#checkout">Order</a>
        </nav>
        <a className="cart-pill" href="#checkout">
          <ShoppingBag size={18} />
          {quantity} item{quantity > 1 ? "s" : ""}
        </a>
      </header>

      <section className="hero" id="home">
        <img src={PRODUCT.image} alt="Jar and spoon of Himachali green salt" />
        <div className="hero-copy">
          <p className="eyebrow">Traditional green salt for everyday cooking</p>
          <h1>Himachali Green Salt</h1>
          <p>
            A distinctive Himachali seasoning blend with a savory herbal taste,
            packed fresh for kitchens, meal prep, restaurants, and daily tables.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#checkout">
              Order now <ChevronRight size={18} />
            </a>
            <a className="secondary-button" href="#product">View details</a>
            <a
              className="secondary-button"
              href={STORE_CONTACT.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={18} />
              Instagram reference
            </a>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Store highlights">
        <Feature icon={<Truck />} title="Fast dispatch" text="Orders prepared within 24 hours." />
        <Feature icon={<ShieldCheck />} title="Food grade" text="Clean packed and kitchen ready." />
        <Feature icon={<PackageCheck />} title="Single product" text="Simple stock, focused quality." />
      </section>

      <section className="product-section" id="product">
        <div className="section-copy">
          <p className="eyebrow">Featured product</p>
          <h2>Premium Himachali green salt for cooking and finishing</h2>
          <p>
            Use it for daily cooking, salads, marinades, pickles, raitas, snacks,
            and table seasoning. This starter store sells one product clearly,
            so customers can order quickly without confusion.
          </p>
          <ul className="check-list">
            <li><Check size={18} /> Traditional green salt seasoning</li>
            <li><Check size={18} /> Choose 200 gram, or 500 gram packs</li>
            <li><Check size={18} /> Cash-on-delivery friendly order flow</li>
          </ul>
        </div>

        <article className="product-card">
          <div>
            <p className="rating">{PRODUCT.rating} customer rating</p>
            <h3>{PRODUCT.name}</h3>
            <p>{selectedPackSize.label} pack</p>
          </div>
          <div className="price-row">
            <strong>{formatCurrency(selectedPackSize.price)}</strong>
            <span>{formatCurrency(selectedPackSize.mrp)}</span>
          </div>
          <PackSizePicker
            packSizes={PRODUCT.packSizes}
            selectedPackSize={packSizeId}
            setPackSize={setPackSizeId}
          />
          <QuantityPicker quantity={quantity} setQuantity={setQuantity} />
          <a className="primary-button full" href="#checkout">
            <ShoppingBag size={18} />
            Add to order
          </a>
        </article>
      </section>

      <section className="benefits" id="benefits">
        <h2>Why customers choose it</h2>
        <div className="benefit-grid">
          <Benefit title="Balanced taste" text="A clean salty finish for everyday Indian cooking." />
          <Benefit title="Herbal character" text="A green seasoned blend that stands out on the table and in jars." />
          <Benefit title="Simple ordering" text="Customers fill one checkout form and you receive the order." />
          <Benefit title="Ready to grow" text="Add more pack sizes, coupons, payments, or delivery zones later." />
        </div>
      </section>

      <section className="checkout-section" id="checkout">
        <div className="checkout-copy">
          <p className="eyebrow">Checkout</p>
          <h2>Place your order</h2>
          <p>
            Fill delivery details and submit. Each order sends an email notification
            and can automatically notify the store owner on WhatsApp after the
            WhatsApp Business API details are added in Netlify.
          </p>

          <div className="order-summary">
            <div>
              <span>{PRODUCT.name} ({selectedPackSize.label})</span>
              <strong>{quantity} x {formatCurrency(selectedPackSize.price)}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>{delivery === 0 ? "Free" : formatCurrency(delivery)}</strong>
            </div>
            <div className="total-row">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>
        </div>

        <form
          className="checkout-form"
          name="salt-orders"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={submitOrder}
        >
          <input type="hidden" name="form-name" value="salt-orders" />
          <input type="hidden" name="bot-field" />
          <label>
            Full name
            <input name="name" value={checkout.name} onChange={updateCheckout} required />
          </label>
          <label>
            Phone number
            <input name="phone" type="tel" value={checkout.phone} onChange={updateCheckout} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={checkout.email} onChange={updateCheckout} />
          </label>
          <label>
            Address
            <textarea name="address" value={checkout.address} onChange={updateCheckout} required />
          </label>
          <div className="form-grid">
            <label>
              City
              <input name="city" value={checkout.city} onChange={updateCheckout} required />
            </label>
            <label>
              Pincode
              <input name="pincode" value={checkout.pincode} onChange={updateCheckout} required />
            </label>
          </div>
          <label>
            Notes
            <textarea name="notes" value={checkout.notes} onChange={updateCheckout} />
          </label>
          <input type="hidden" name="quantity" value={quantity} />
          <input type="hidden" name="pack_size" value={selectedPackSize.label} />
          <input type="hidden" name="total" value={formatCurrency(total)} />
          <input type="hidden" name="order_details" value={orderDetails} />
          <input type="hidden" name="store_whatsapp" value={STORE_CONTACT.displayPhone} />
          <button className="primary-button full" type="submit" disabled={status === "submitting"}>
            <IndianRupee size={18} />
            {status === "submitting" ? "Submitting..." : "Submit order"}
          </button>
          {status === "success" && (
            <div className="form-status success">
              <p>{statusMessage}</p>
              <div className="notification-actions" aria-label="Owner notification actions">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle size={17} />
                  Send on WhatsApp
                </a>
              </div>
            </div>
          )}
          {status === "error" && (
            <p className="form-status error">{statusMessage}</p>
          )}
        </form>
      </section>

      <footer>
        <span>Himachali Salt Store</span>
        <span>
          <a href={`https://wa.me/${STORE_CONTACT.whatsappNumber}`}>{STORE_CONTACT.displayPhone}</a> |{" "}
          <a href={STORE_CONTACT.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
        </span>
      </footer>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature">
      {React.cloneElement(icon, { size: 22 })}
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

function Benefit({ title, text }) {
  return (
    <article className="benefit">
      <Sparkles size={19} />
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function QuantityPicker({ quantity, setQuantity }) {
  return (
    <div className="quantity-row" aria-label="Select quantity">
      <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
        <Minus size={18} />
      </button>
      <span>{quantity}</span>
      <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">
        <Plus size={18} />
      </button>
    </div>
  );
}

function PackSizePicker({ packSizes, selectedPackSize, setPackSize }) {
  return (
    <div className="pack-size-picker" aria-label="Select pack size">
      {packSizes.map((packSize) => (
        <button
          className={packSize.id === selectedPackSize ? "active" : ""}
          key={packSize.id}
          type="button"
          onClick={() => setPackSize(packSize.id)}
          aria-pressed={packSize.id === selectedPackSize}
        >
          <span>{packSize.label}</span>
          <strong>{formatCurrency(packSize.price)}</strong>
        </button>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
