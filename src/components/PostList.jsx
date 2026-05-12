import { useEffect, useState } from 'react';
import axios from 'axios';
import { format, isPast } from 'date-fns';
import { Calendar, Clock, CheckCircle2, Play, AlertCircle } from 'lucide-react';

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    let isMounted = true;
    
    const fetchPostsIfMounted = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/posts`);
        if (isMounted) setPosts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPostsIfMounted();
    // Poll every 10s to update status if something changes via cron
    const interval = setInterval(fetchPostsIfMounted, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleTrigger = async (id) => {
    try {
      await axios.post(`${API_URL}/api/trigger-post/${id}`);
      const res = await axios.get(`${API_URL}/api/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to trigger post manually');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'posted':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium"><CheckCircle2 size={14}/> Posted</span>;
      case 'scheduled':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium"><Clock size={14}/> Scheduled</span>;
      case 'failed':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium"><AlertCircle size={14}/> Failed</span>;
      default:
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20 text-xs font-medium">Draft</span>;
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading posts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Scheduled Posts</h2>
        <p className="text-gray-400">Manage and monitor your automated LinkedIn posts.</p>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post._id} className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                {getStatusBadge(post.status)}
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Mode: {post.mode}</span>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-1">Topic</h4>
                <p className="text-white font-medium">{post.topic}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400 line-clamp-2">{post.content}</p>
              </div>

              {post.scheduledTime && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar size={16} />
                  <span>{format(new Date(post.scheduledTime), 'PPp')}</span>
                  {post.status === 'scheduled' && isPast(new Date(post.scheduledTime)) && (
                    <span className="text-yellow-500 text-xs ml-2">(Overdue - Waiting for cron)</span>
                  )}
                </div>
              )}
            </div>

            <div className="md:w-auto w-full pt-2">
              {(post.status === 'scheduled' || post.status === 'draft' || post.status === 'failed') && (
                <button
                  onClick={() => handleTrigger(post._id)}
                  className="w-full md:w-auto bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10"
                  title="Trigger instantly via n8n webhook style endpoint"
                >
                  <Play size={16} />
                  Post Now
                </button>
              )}
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-20 glass-panel rounded-2xl">
            <Calendar className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-medium text-gray-300">No posts found</h3>
            <p className="text-gray-500 mt-2">Create your first post to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
