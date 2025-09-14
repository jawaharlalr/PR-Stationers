// src/pages/Contact.jsx
export default function Contact() {
  const mapSrc =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3891.92288539771!2d80.1976467!3d12.8788326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525beef24085a9%3A0xfe97774adf756230!2sPR%20Stationers!5e0!3m2!1sen!2sin!4v1694351111111!5m2!1sen!2sin";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Contact Us</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Map */}
        <div className="w-full h-80 md:h-96">
          <iframe
            src={mapSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="PR Stationers Location"
            className="rounded-lg shadow-md"
          ></iframe>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700">PR Stationers</h2>
          <p className="text-gray-600">
            <span className="font-medium">Address:</span> Crusher Road, 102,
            Karanai Main Rd, Arasankalani, Sithalapakkam, Chennai, Tamil Nadu
            600130
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Phone:</span>{" "}
            <a href="tel:+919884609789" className="text-blue-600 hover:underline">
              9884609789
            </a>
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Timings:</span> Mon - Sat, 7:30 AM – 9:30 PM
          </p>

          {/* Get Directions */}
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=PR+Stationers,+Chennai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
}
