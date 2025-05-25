'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'Paano kumuha ng Barangay ID?',
    answer:
      'Magdala ng isang valid ID, 1x1 o 2x2 ID picture, at pumunta sa Barangay Hall. Mag-fill out ng application form at maghintay ng verification mula sa staff. Minsan may maliit na bayad depende sa barangay.',
  },
  {
    question: 'Paano kumuha ng Barangay Clearance?',
    answer:
      'Pumunta sa Barangay Hall at dalhin ang isang valid ID. Sabihin sa staff ang dahilan kung bakit kailangan mo ng Barangay Clearance (hal. trabaho, school, o business). May bayad ito na karaniwang ₱50-₱100.',
  },
  {
    question: 'Pwede bang kumuha ng Barangay Certificate online?',
    answer:
      'Depende ito sa barangay. May ilang barangay na may online system para sa request ng certificate. Tingnan ang official Facebook page o website ng inyong barangay kung meron silang ganitong serbisyo.',
  },
  {
    question: 'Ano ang requirements para sa Indigency Certificate?',
    answer:
      'Dalhin ang isang valid ID, proof of residency (hal. water/electric bill), at sabihin sa staff ang layunin ng certificate. Karaniwan itong ibinibigay ng libre o may minimal na bayad.',
  },
  {
    question: 'Paano magpa-blotter ng insidente?',
    answer:
      'Pumunta agad sa Barangay Hall at sabihin sa tanod o opisyal ang detalye ng insidente. Ihanda ang mga impormasyon gaya ng oras, lugar, at taong sangkot. Magsusulat ka ng salaysay para sa opisyal na record.',
  },
];

export default function BarangayFaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-6 bg-gray-50" id="faq">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12" data-aos="fade-up">
          <span className="text-blue-600 font-medium">FAQs</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Mga Madalas Itanong</h2>
          <p className="text-gray-600 text-lg">
            Narito ang mga kasagutan sa mga karaniwang tanong ng mga residente sa barangay.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg overflow-hidden"
              data-aos="fade-up"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none"
              >
                <span className="font-medium text-gray-800">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-700">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
