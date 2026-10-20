import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: 'General Enquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A25828]">
            We&apos;re Here To Help
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#221C18]">
            Get In Touch With Our UK Team
          </h1>
          <p className="text-sm sm:text-base text-[#6B6159]">
            Have a question about fabric samples, doorway measurements, or order status? Our UK customer care team is here Monday to Saturday.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Contact Details & WhatsApp Button */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary WhatsApp Card */}
            <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-3xl p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#221C18]">
                    Chat on WhatsApp
                  </h3>
                  <span className="text-xs text-stone-600">Fast replies during support hours</span>
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Message our team for product videos, size checks and live help with your order.
              </p>
              <a
                href={`https://wa.me/${(settings.whatsapp || "").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <span>Open WhatsApp ({settings.whatsapp})</span>
              </a>
            </div>

            {/* Address & Hours Cards */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D5] space-y-6">
              <h3 className="font-serif font-bold text-lg text-[#221C18]">
                Customer Care Details
              </h3>

              <div className="space-y-4 text-xs text-[#524842]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#A25828] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-semibold mb-0.5">Workshop Address:</strong>
                    <span>{settings.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#A25828] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-semibold mb-0.5">Telephone:</strong>
                    <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="hover:text-[#A25828] underline">
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#A25828] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-semibold mb-0.5">Email Support:</strong>
                    <a href={`mailto:${settings.email}`} className="hover:text-[#A25828] underline">
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#A25828] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-semibold mb-0.5">Support Hours:</strong>
                    <span>{settings.businessHours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E0D5] shadow-xs">
              <h2 className="font-serif text-2xl font-bold text-[#221C18] mb-1">
                Send Us a Message
              </h2>
              <p className="text-xs text-stone-500 mb-6">
                Our support team typically replies within 2–4 working hours.
              </p>

              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-serif text-xl font-bold">Message Received!</h3>
                  <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                    Thank you, {formData.name}. We have logged your enquiry and a member of our customer care team will respond shortly to {formData.email}.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        orderNumber: '',
                        subject: 'General Enquiry',
                        message: '',
                      });
                    }}
                    className="text-xs font-bold text-[#A25828] underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. David Smith"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@domain.co.uk"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Telephone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+44 7923 119077"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Order Number (If applicable)
                      </label>
                      <input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                        placeholder="e.g. PC-UK-82914"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828] bg-white"
                    >
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Fabric Samples Request">Fabric Samples Request</option>
                      <option value="Delivery & Sizing Question">Delivery &amp; Sizing Question</option>
                      <option value="Order Tracking Update">Order Tracking Update</option>
                      <option value="Returns & Comfort Trial">Returns &amp; Comfort Trial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      How can we assist you? *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please include room dimensions, postcodes, or specific questions..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#A25828] hover:bg-[#8A461A] text-white py-3.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Plush Comfort</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
