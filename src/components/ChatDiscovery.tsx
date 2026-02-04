import React, { useState, useEffect } from 'react';
import { Play, BookOpen, ChevronRight, Layout, MonitorPlay, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Lecture {
  lectureNumber: number;
  title: string;
  videoUrl: string;
}

interface Course {
  _id: string;
  title: string;
  category: string;
  lectures: Lecture[];
  thumbnail?: string;
  description?: string;
}

export function ChatDiscovery({ onStartSession }: { onStartSession?: () => void }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch Categories
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(err => console.error("Failed to fetch categories", err));
  }, []);

  // Fetch Courses
  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      fetch(`http://localhost:5000/api/videos/category/${encodeURIComponent(selectedCategory)}`)
        .then(res => res.json())
        .then(data => {
          setCourses(data);
          setActiveCourse(null);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [selectedCategory]);

  const getEmbedUrl = (url: string) => {
    // Handle https://youtu.be/ID
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    // Handle watch?v=ID
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  // Image Mapping for Categories
  const CATEGORY_IMAGES: Record<string, string> = {
    'Artificial Intelligence': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
    'Computer Science': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000',
    'Business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000',
    'Arts': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1000',
    'Music': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=1000',
    'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1000',
    'Marketing': 'https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80&w=1000',
    'Legal Studies': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1000',
    'Humanities': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1000',
    'Language': 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1000',
    'Career': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1000',
  };

  const getCourseImage = (course: Course) => {
    if (course.thumbnail) return course.thumbnail;
    if (CATEGORY_IMAGES[course.category]) return CATEGORY_IMAGES[course.category];
    return 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1000';
  };

  return (
    <div className="min-h-screen pt-24 pb-8 flex px-4 gap-6 max-w-[1600px] mx-auto">
      {/* Sidebar - Categories */}
      <aside className="w-64 shrink-0 hidden md:block">
        <div className="sticky top-24 space-y-8">
          <div>
            <h2 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Categories</h2>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${selectedCategory === cat ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  <span className="font-medium truncate">{cat}</span>
                  {selectedCategory === cat && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
              {categories.length === 0 && (
                <p className="text-slate-600 text-sm italic">No categories found via API.</p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl min-h-[600px] flex flex-col relative">

        {/* Default State: No Selection */}
        {!selectedCategory && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Layout className="w-10 h-10 text-violet-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Explore Video Courses</h2>
            <p className="text-slate-400 max-w-md">Select a category from the sidebar to browse our curated collection of educational videos.</p>
          </div>
        )}

        {/* Grid of Courses */}
        {selectedCategory && !activeCourse && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-violet-400">{selectedCategory}</span> Courses
            </h2>

            {loading ? (
              <div className="text-slate-400 italic">Loading courses...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <motion.div
                    key={course._id}
                    whileHover={{ y: -5 }}
                    onClick={() => { setActiveCourse(course); setActiveLecture(course.lectures[0] || null); }}
                    className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-violet-500/50 transition-colors group h-full flex flex-col"
                  >
                    <div className="aspect-video bg-slate-900 relative">
                      <img
                        src={getCourseImage(course)}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
                      <div className="mt-auto flex items-center gap-2 text-slate-500 text-xs">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.lectures.length} Lectures</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {courses.length === 0 && (
                  <div className="col-span-full text-center py-20 bg-slate-950/50 rounded-2xl border-2 border-dashed border-slate-800">
                    <p className="text-slate-500">No courses found in this category.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Video Player & Lecture List */}
        {activeCourse && activeLecture && (
          <div className="flex-1 flex flex-col md:flex-row h-full">
            {/* Left: Player */}
            <div className="flex-1 bg-black flex flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center gap-4 bg-slate-950">
                <button onClick={() => setActiveCourse(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-white font-bold text-sm md:text-lg">{activeLecture.title}</h3>
                  <p className="text-slate-500 text-xs">{activeCourse.title}</p>
                </div>
              </div>
              <div className="flex-1 relative bg-black">
                <iframe
                  src={getEmbedUrl(activeLecture.videoUrl)}
                  className="w-full h-full absolute inset-0"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Right: Playlist */}
            <div className="w-full md:w-80 bg-slate-950 border-l border-slate-800 flex flex-col z-20">
              <div className="p-4 border-b border-slate-800 font-bold text-white">
                Course Content
              </div>
              <div className="flex-1 overflow-y-auto">
                {activeCourse.lectures.map((lec, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveLecture(lec)}
                    className={`w-full text-left p-4 border-b border-slate-800 hover:bg-slate-900 transition-colors flex gap-3 ${activeLecture === lec ? 'bg-slate-900 border-l-4 border-l-violet-500' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 font-mono shrink-0">
                      {lec.lectureNumber || idx + 1}
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium mb-1 ${activeLecture === lec ? 'text-violet-400' : 'text-slate-300'}`}>
                        {lec.title}
                      </h4>
                      <p className="text-[10px] text-slate-500">Video Lesson</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
