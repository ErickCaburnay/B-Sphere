"use client";

import { CheckCircle, Clock, Layers, TrendingUp } from "lucide-react";

const projects = [
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Community Health Center",
    description:
      "Established a fully equipped health center providing 24/7 medical assistance to residents.",
    status: "finished",
    delay: 100,
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Ongoing: Barangay Hall Expansion",
    description:
      "Currently expanding the barangay hall to include more offices and improve service delivery.",
    status: "ongoing",
    delay: 200,
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Ongoing: Waste Management Program",
    description:
      "Implementation of scheduled waste collection and eco-friendly disposal initiatives in all zones.",
    status: "ongoing",
    delay: 300,
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Road Improvement (2024)",
    description:
      "Upgraded 3 major roads with concrete pavement, reducing commute time and improving accessibility.",
    status: "future",
    delay: 400,
  },
];

const BrgyProjects = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-tr from-green-600 to-blue-700 text-white">
      <div className="container mx-auto">
        <div className="text-center mb-12" data-aos="fade-up">
          <span className="text-green-200 font-medium uppercase tracking-widest">
            Barangay Projects
          </span>
          <h2 className="text-4xl font-bold mt-2 mb-4">Our Impact & Progress</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Take a look at the key accomplishments and ongoing initiatives shaping our community’s future.
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex justify-center gap-6 mb-12" data-aos="fade-up" data-aos-delay="50">
          <span className="flex items-center gap-2 text-sm text-white">
            <span className="w-3 h-3 rounded-full bg-green-600 inline-block"></span> Finished
          </span>
          <span className="flex items-center gap-2 text-sm text-white">
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Ongoing
          </span>
          <span className="flex items-center gap-2 text-sm text-white">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Future Plan
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {projects.map((project, idx) => {
            const statusColor = {
              finished: "bg-green-600",
              ongoing: "bg-yellow-500",
              future: "bg-blue-500",
            }[project.status];

            const statusLabel = {
              finished: "Finished Project",
              ongoing: "Ongoing",
              future: "Future Plan",
            }[project.status];

            return (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 shadow-lg border border-white/20"
                data-aos="fade-up"
                data-aos-delay={project.delay}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${statusColor}`}>
                    {project.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">{project.title}</h3>
                    <span className="text-xs opacity-80 italic">{statusLabel}</span>
                  </div>
                </div>
                <p className="opacity-80 text-sm">{project.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrgyProjects;
