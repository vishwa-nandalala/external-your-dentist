"use client";

const ServicesSection = () => {
  const services = [
    {
      title: 'Your Trusted Dentists, Just Around The Corner',
      description: 'Explore top-quality dental clinics near you, where expert care and convenience meet. Begin your journey to a healthier, brighter...',
      stat: '173+',
      statLabel: 'Leading Dental Clinics Across Australia'
    },
    {
      title: 'Comprehensive Dental Services Near You',
      description: 'Find top-rated dentists near you with ease. Start your journey to a healthier, more radiant smile today, with trusted...',
      stat: '355+',
      statLabel: 'Top Rated Dentists All Around You'
    },
    {
      title: 'Find Expert Dental Care',
      description: 'Find expert dental clinics offering a wide range of expert services just around the corner. Start your path to a healthier, more...',
      stat: '220+',
      statLabel: 'Years of Combined Experience'
    }
  ];

  return (
    <section className="bg-[#F4FAFA]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-12">
        <div className="text-left mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#163A5F] mb-3 sm:mb-4">
            Your Trusted Dental Partners
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#163A5F]/70 mt-2">
            Discover exceptional dental care tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 hover:shadow-xl transition-shadow duration-300 border border-[#DDEEEE] hover:border-[#19A7A0] flex flex-col"
            >
              <div className="flex-1">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#163A5F] mb-2 leading-tight">
                  {service.title}
                </h3>

                <p className="text-[#163A5F]/70 mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-2 pt-4 border-t border-[#DDEEEE]">
                <div className="flex items-baseline">
                  <span className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-bold text-[#19A7A0]">
                    {service.stat}
                  </span>
                </div>

                {service.statLabel && (
                  <p className="text-[#163A5F] font-medium mt-2 text-sm md:text-base">
                    {service.statLabel}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;