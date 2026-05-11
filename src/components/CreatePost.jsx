import { useState } from 'react';
import axios from 'axios';
import { Sparkles, Calendar as CalendarIcon, Clock, Send, Loader2, Bot } from 'lucide-react';

export default function CreatePost() {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState('simulated');
  const [isScheduling, setIsScheduling] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setMessage('');
    try {
      const res = await axios.post('/api/generate-post', { topic });
      setContent(res.data.content);
    } catch (err) {
      console.error(err);
      setMessage('Failed to generate content. Please check API keys.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedule = async () => {
    if (!content) return;
    
    setIsScheduling(true);
    setMessage('');
    try {
      let scheduledTime = null;
      if (date && time) {
        scheduledTime = new Date(`${date}T${time}`).toISOString();
      }

      await axios.post('/api/schedule-post', {
        topic,
        content,
        scheduledTime,
        mode
      });

      setMessage(scheduledTime ? 'Post scheduled successfully!' : 'Post saved as draft!');
      setTopic('');
      setContent('');
      setDate('');
      setTime('');
    } catch (err) {
      console.error(err);
      setMessage('Failed to schedule post.');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Create New Post</h2>
        <p className="text-gray-400">Generate high-converting LinkedIn posts with AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input & Controls */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What do you want to post about?
            </label>
            <textarea
              className="w-full bg-[#1a1c23] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
              rows={4}
              placeholder="e.g., The impact of AI on modern fintech startups..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic}
              className="mt-4 w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <CalendarIcon size={18} className="text-purple-400" />
              Scheduling & Options
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date (Optional)</label>
                <input
                  type="date"
                  className="w-full bg-[#1a1c23] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Time</label>
                <input
                  type="time"
                  className="w-full bg-[#1a1c23] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Execution Mode</label>
              <select 
                className="w-full bg-[#1a1c23] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="simulated">Simulated (Log to console)</option>
                <option value="puppeteer">Puppeteer (Browser UI)</option>
                <option value="api">Official LinkedIn API (Free)</option>
              </select>
            </div>

            <button
              onClick={handleSchedule}
              disabled={isScheduling || !content}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScheduling ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              {date && time ? 'Schedule Post' : 'Save as Draft'}
            </button>

            {message && (
              <p className={`text-sm text-center ${message.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-purple-400" />
            Live Preview
          </h3>
          <div className="flex-1 bg-[#1a1c23] border border-white/10 rounded-xl p-4 flex flex-col">
            {content ? (
              <textarea
                className="w-full h-full bg-transparent text-gray-200 resize-none focus:outline-none leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3">
                <Bot size={48} className="opacity-20" />
                <p>Your AI generated post will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
