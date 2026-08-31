"use client";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Why is Oral Health Important? - 5 Key Reasons",
    excerpt: "Read 5 reasons why oral health is important for your overall wellbeing.",
    date: "03 Dec 2024",
    imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "The Evolution of Dentistry in Australia: From Basic Care to Advanced Technology",
    excerpt: "Dentistry in Australia has evolved significantly over the years, mirroring the advancements in technology, research, and patient care that have...",
    date: "22 Oct 2024",
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Can Bad Oral Hygiene Cause Health Problems?",
    excerpt: "Good oral hygiene is more than having a bright smile. It is crucial for keeping your overall health in check.",
    date: "25 Feb 2025",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPQJwTSiG3UTxu6GKG01EZq9inGC9Djx-8-w&s",
  },
  {
    id: 4,
    title: "What Constitutes Good Oral Health and How It Impacts Your Overall Well-Being?",
    excerpt: "Good Oral Health",
    date: "06 Jan 2025",
    imageUrl: "https://images.ctfassets.net/wp1lcwdav1p1/26cD4zZ5vts5kSx7hcCVmJ/1dbbe3be4d820ee9ccda24ccbc10a60d/GettyImages-1372506124.jpg?w=1500&h=680&q=60&fit=fill&f=faces&fm=jpg&fl=progressive",
  },
  {
    id: 5,
    title: "How Does Poor Oral Health Impact On General Health?",
    excerpt: "Oral health is not just about having a bright smile",
    date: "25 Feb 2025",
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "What Causes Poor Oral Health?",
    excerpt: "Oral health is an important aspect of general health.",
    date: "07 Jan 2025",
    imageUrl: "https://www.colgate.com/content/dam/cloud/cp-sites/oral-care/oral-care-center/global/article/898905.jpg",
  },
];

const BlogSection = () => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
            Discover Our Latest Blogs!
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-2">
            Explore everything you need to know with our latest blog posts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col group cursor-pointer bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="w-full h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
              </div>
              <div className="flex flex-col flex-grow p-3 sm:p-4 md:p-6">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-tight mb-2 sm:mb-3">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {post.date}
                  </span>
                  <button className="flex items-center text-orange-600 hover:text-orange-600 text-xs sm:text-sm font-medium transition-colors duration-200">
                    View Details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
