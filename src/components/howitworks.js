'use client';

import { Users, FileText, ShieldCheck } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Resident Registration',
    description:
      'Residents create and update their digital profiles with personal and family details for accurate barangay records.',
    icon: <Users size={64} className="text-blue-300" />,
    bgColor: 'bg-blue-50',
    aos: 'fade-right',
    reverse: false,
  },
  {
    number: '02',
    title: 'Submit Requests',
    description:
      'Residents submit various service requests and update info that require barangay approval.',
    icon: <FileText size={64} className="text-green-300" />,
    bgColor: 'bg-green-50',
    aos: 'fade-left',
    reverse: true,
  },
  {
    number: '03',
    title: 'Admin Review & Approval',
    description:
      'Barangay admins review requests and send notifications on approval, rejection, or need for more info.',
    icon: <ShieldCheck size={64} className="text-purple-300" />,
    bgColor: 'bg-purple-50',
    aos: 'fade-right',
    reverse: false,
  },
  {
    number: '04',
    title: 'Document Issuance & Records',
    description:
      'Generate official documents digitally and maintain up-to-date records accessible to residents and staff.',
    icon: <FileText size={64} className="text-amber-300" />,
    bgColor: 'bg-amber-50',
    aos: 'fade-left',
    reverse: true,
  },
];

export default function HowItWorksSection() {
  return (
    <section
      className="py-20 px-6"
      id="how-it-works"
      style={{ backgroundImage: "url('/images/.webp')" }}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-blue-600 font-medium">Process</span>
          <h2 className="text-3xl font-bold mt-2 mb-6">How It Works</h2>
          <p className="text-lg text-gray-600">
            Manage your barangay records, requests, and notifications seamlessly.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-100 hidden md:block"></div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row ${
                  step.reverse ? 'md:flex-row-reverse' : ''
                } items-center`}
                data-aos={step.aos}
              >
                <div
                  className={`md:w-1/2 ${
                    step.reverse ? 'md:pl-12' : 'md:pr-12 md:text-right'
                  }`}
                >
                  <span className="text-blue-600 font-bold text-lg">{step.number}</span>
                  <h3 className="text-xl font-semibold my-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>

                <div className="hidden md:grid w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center z-10 text-white text-xl">
                  {index + 1}
                </div>

                <div
                  className={`md:w-1/2 mt-6 md:mt-0 ${
                    step.reverse ? 'md:pr-12' : 'md:pl-12'
                  }`}
                >
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className={`h-40 ${step.bgColor} flex items-center justify-center`}>
                      {step.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
