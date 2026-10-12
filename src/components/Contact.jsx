function Contact() {
  const hospital = {
    name: "SHRADDHA MULTISPECIALITY HOSPITAL",
    address: "Bhingloli Grampanchayat, near Vijay Stores, Bhingaloli, Maharashtra 415203",
    phone: "022-12345678",
    emergency: "9876500000",
    email: "shraddhahospital12@gmail.com",
    timing: "24x7 open",
    mapLink:
     "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3794.7945188700105!2d73.25629427517902!3d17.988294483005053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be9cde90d7ff533%3A0xec1481bd762c7d6c!2sShraddha%20Hospital!5e0!3m2!1sen!2sin!4v1791281287179!5m2!1sen!2sin",
  };

  return (
    <div className="contact-section">
      <div className="contact-info">
        <h3>{hospital.name}</h3>
        <p><b>Address:</b> {hospital.address}</p>
        <p><b>Phone:</b> {hospital.phone}</p>
        <p><b>Emergency:</b> {hospital.emergency}</p>
        <p><b>Email:</b> {hospital.email}</p>
        <p><b>Timing:</b> {hospital.timing}</p>
      </div>

      <iframe
        title="Hospital Location"
        src={hospital.mapLink}
        className="map-frame"
        loading="lazy"
      ></iframe>
    </div>
  );
}

export default Contact;