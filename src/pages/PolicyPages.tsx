import React from 'react';
import { useStore } from '../context/StoreContext';

interface PolicyPageProps {
  type: 'privacy' | 'terms' | 'cookies';
}

export const PolicyPages: React.FC<PolicyPageProps> = ({ type }) => {
  const { settings, setRoute } = useStore();

  const titles = {
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions of Sale',
    cookies: 'Cookie & Tracking Policy',
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl p-8 sm:p-14 border border-[#E8E0D5] shadow-xs">
        <span className="text-xs font-bold uppercase tracking-widest text-[#A25828]">
          Legal &amp; Compliance (United Kingdom)
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#221C18] mt-2 mb-8">
          {titles[type]}
        </h1>

        <div className="prose prose-stone text-xs sm:text-sm text-[#4A3E37] leading-relaxed space-y-6">
          {type === 'privacy' && (
            <>
              <p>
                <strong>Last Updated:</strong> October 2026. Plush Comfort (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting and respecting your privacy in full compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
              </p>
              <h3 className="font-bold text-base text-[#221C18]">1. Data Controller Information</h3>
              <p>
                The data controller for Plush Comfort is located at {settings.address}. If you have any inquiries regarding your personal data, you may email us at {settings.email} or telephone our team on {settings.phone}.
              </p>
              <h3 className="font-bold text-base text-[#221C18]">2. Information We Collect</h3>
              <p>
                When you browse our website, create a customer account, or purchase furniture, we collect information necessary to process and fulfil your order:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Contact details including your full name, email address, and UK mobile number.</li>
                <li>Delivery address details including postcode and access instructions.</li>
                <li>Payment transaction tokens processed securely via our encrypted gateways (Stripe, Klarna). We never store raw credit card numbers on our servers.</li>
              </ul>
              <h3 className="font-bold text-base text-[#221C18]">3. How Your Information Is Used</h3>
              <p>
                Your personal details are used strictly to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Bench-craft, schedule, and deliver your furniture into your room of choice via our two-man logistics teams.</li>
                <li>Send transactional receipts, courier dispatch tracking links, and delivery time slot text messages.</li>
                <li>Manage product warranties, 30-day comfort trial collections, and customer care inquiries.</li>
              </ul>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                <strong>Last Updated:</strong> October 2026. These Terms and Conditions govern all purchases of furniture from Plush Comfort under the Consumer Rights Act 2015 and Consumer Contracts Regulations.
              </p>
              <h3 className="font-bold text-base text-[#221C18]">1. Contract Formation &amp; Pricing</h3>
              <p>
                All prices are stated in British Pounds Sterling (&pound;) and include UK VAT at the prevailing rate. Your order constitutes an offer to purchase, which is accepted upon our issuance of an Order Confirmation email and allocated workshop production slot.
              </p>
              <h3 className="font-bold text-base text-[#221C18]">2. Handcrafted Tolerances</h3>
              <p>
                Because sofas and beds are made with natural timber and woven fabrics, slight variations in dimensions (&plusmn;2cm) and fabric batch shading are hallmarks of authentic artisanal production.
              </p>
              <h3 className="font-bold text-base text-[#221C18]">3. Delivery Access Responsibilities</h3>
              <p>
                It is the customer&apos;s responsibility to ensure that ordered furniture pieces will safely navigate through entrance doorways, hallways, stairwells, and bedroom turns. If delivery cannot be completed due to inadequate doorway clearance, restocking and transport return fees may apply.
              </p>
            </>
          )}

          {type === 'cookies' && (
            <>
              <p>
                <strong>Last Updated:</strong> October 2026. This policy explains how Plush Comfort uses cookies and similar storage technologies on our website.
              </p>
              <h3 className="font-bold text-base text-[#221C18]">1. Essential Cookies</h3>
              <p>
                These cookies are strictly necessary to enable core site functionality, including remembering your shopping basket items, preserving secure session authentication, and recording cookie consent preferences.
              </p>
              <h3 className="font-bold text-base text-[#221C18]">2. First-Party Analytics</h3>
              <p>
                We operate internal, privacy-centric first-party analytics to understand top search queries, popular categories, and checkout completion rates so we can optimize our British furniture catalog without selling your information to third-party data brokers.
              </p>
            </>
          )}
        </div>

        <div className="pt-8 mt-8 border-t border-[#E8E0D5]">
          <button
            onClick={() => setRoute({ name: 'home' })}
            className="text-xs font-semibold text-[#A25828] hover:underline"
          >
            &larr; Back to Plush Comfort Home
          </button>
        </div>
      </div>
    </div>
  );
};
