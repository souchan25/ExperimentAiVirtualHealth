import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, ExternalLink, Filter, ChevronRight, X, HeartPulse, Info } from 'lucide-react';
import { knowledgeService } from '../../api/service';

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Emergency', 'Injury', 'Illness', 'General'];

  useEffect(() => {
    fetchArticles();
  }, [category]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await knowledgeService.searchArticles(search, category === 'All' ? '' : category);
      setArticles(data);
    } catch (err) {
      console.error("Failed to fetch articles", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-gray-900 font-outfit tracking-tight">First-Aid Guide</h1>
            <p className="text-gray-500 font-medium">Search our expert-reviewed medical knowledge base.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cpsu-green transition-colors" />
            <input 
              type="text" 
              placeholder="Search for symptoms, injuries, or treatment..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-cpsu-green/10 focus:border-cpsu-green outline-none transition-all font-medium text-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                category === cat || (cat === 'All' && !category)
                  ? 'bg-cpsu-green text-white shadow-lg shadow-cpsu-green/20' 
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-3xl border border-gray-100 animate-pulse" />
            ))
          ) : articles.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4">
               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">No guides found</h2>
              <p className="text-gray-500">Try adjusting your search or category filters.</p>
            </div>
          ) : (
            articles.map(article => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    article.category === 'Emergency' ? 'bg-red-50 text-red-600' : 'bg-cpsu-green/10 text-cpsu-green'
                  }`}>
                    {article.category}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-cpsu-green transition-colors" />
                </div>
                <h3 className="text-xl font-black text-gray-900 font-outfit mb-3 group-hover:text-cpsu-green transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6">
                  {article.content}
                </p>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                  <HeartPulse className="w-4 h-4 text-gray-300" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medical Guide</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>

              <div className="p-8 md:p-12 overflow-y-auto">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 text-xs font-black uppercase tracking-widest ${
                  selectedArticle.category === 'Emergency' ? 'bg-red-50 text-red-600' : 'bg-cpsu-green/10 text-cpsu-green'
                }`}>
                   <Info className="w-4 h-4" />
                   {selectedArticle.category}
                </div>
                <h2 className="text-4xl font-black text-gray-900 font-outfit mb-8 leading-tight">
                  {selectedArticle.title}
                </h2>
                <div className="prose prose-cpsu max-w-none">
                  <div className="text-gray-600 leading-relaxed space-y-6 text-lg">
                    {selectedArticle.content.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
                
                {selectedArticle.tags && (
                  <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                    {selectedArticle.tags.split(',').map(tag => (
                      <span key={tag} className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold ring-1 ring-gray-100">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-8 md:px-12 bg-gray-50 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expert Reviewed • UPDATED {new Date(selectedArticle.created_at).toLocaleDateString()}</p>
                <button className="flex items-center gap-2 text-cpsu-green font-black text-sm uppercase tracking-widest hover:underline">
                  Print Guide <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeBase;
