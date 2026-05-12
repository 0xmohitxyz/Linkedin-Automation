import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Bot, Calendar, LayoutDashboard } from 'lucide-react';
import CreatePost from './components/CreatePost';
import PostList from './components/PostList';

function Navigation() {
  const location = useLocation();
  return (
    <nav className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#16181d] md:h-screen fixed left-0 top-0 flex flex-row md:flex-col p-4 md:p-6 z-50 justify-between md:justify-start">
      <div className="flex items-center gap-3 md:mb-10">
        <div className="bg-linear-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
          <Bot className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white hidden md:block">
          Auto<span className="text-purple-400">Post</span>
        </h1>
      </div>

      <div className="flex flex-row md:flex-col gap-2">
        <Link 
          to="/" 
          className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-lg transition-all duration-200 ${location.pathname === '/' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium hidden md:block">Create Post</span>
        </Link>
        <Link 
          to="/posts" 
          className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-lg transition-all duration-200 ${location.pathname === '/posts' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
        >
          <Calendar size={20} />
          <span className="font-medium hidden md:block">Scheduled Posts</span>
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0f1115] text-gray-200 pt-18.25 md:pt-0">
        <Navigation />
        <main className="md:ml-64 flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <Routes>
              <Route path="/" element={<CreatePost />} />
              <Route path="/posts" element={<PostList />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
