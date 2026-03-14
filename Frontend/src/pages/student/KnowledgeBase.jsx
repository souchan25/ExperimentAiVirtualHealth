import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, ExternalLink, Filter, ChevronRight, X, HeartPulse, Info } from 'lucide-react';
import { knowledgeService } from '../../api/service';

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [clinicalResults, setClinicalResults] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clinicalLoading, setClinicalLoading] = useState(false);

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

  const fetchClinicalData = async (query) => {
    if (!query || query.length < 2) {
      setClinicalResults([]);
      return;
    }
    
    try {
      setClinicalLoading(true);
      // NLM Clinical Tables API endpoint
      const response = await fetch(`https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${encodeURIComponent(query)}&maxList=6`);
      const data = await response.json();
      
      // format: [total_count, ids, null, names_array]
      if (data && data[3]) {
        const formatted = data[3].map((item, index) => ({
          id: data[1][index],
          title: item[0],
          isClinical: true,
          category: 'Clinical Info',
          content: `Official clinical information for ${item[0]}. Click to learn more from authoritative sources.`
        }));
        setClinicalResults(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch clinical data", err);
    } finally {
      setClinicalLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles();
    if (search) fetchClinicalData(search);
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
        <div className="space-y-12">
          {/* Local First Aid Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-cpsu-green rounded-full" />
              <h2 className="text-2xl font-black text-gray-900 font-outfit">First-Aid Guides</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                 Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-3xl border border-gray-100 animate-pulse" />
                ))
                ) : articles.length === 0 ? (
                <div className="col-span-full py-10 text-center space-y-4 bg-white rounded-3xl border border-dashed border-gray-100">
                  <BookOpen className="w-10 h-10 text-gray-200 mx-auto" />
                  <p className="text-gray-400 font-medium text-sm">No local first-aid guides found. Check clinical knowledge below.</p>
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
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Local Medical Guide</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Clinical Results Section (Only shown on search) */}
          {search && (
            <div className="space-y-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h2 className="text-2xl font-black text-gray-900 font-outfit">Clinical Knowledge (NIH Library)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clinicalLoading ? (
                   Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-48 bg-white rounded-3xl border border-gray-100 animate-pulse" />
                  ))
                ) : clinicalResults.length === 0 ? (
                  <div className="col-span-full py-10 text-center space-y-4 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <Info className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-gray-400 font-medium text-sm">No clinical listings found for "{search}"</p>
                  </div>
                ) : (
                  clinicalResults.map(result => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-gradient-to-br from-white to-blue-50/30 rounded-3xl border border-blue-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                      onClick={() => window.open(`https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v:project=medlineplus&v:sources=medlineplus-bundle&query=${encodeURIComponent(result.title)}`, '_blank')}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-600">
                          Clinical Info
                        </div>
                        <ExternalLink className="w-5 h-5 text-blue-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 font-outfit mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {result.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        Find detailed medical clinical information and patient education about {result.title} from MedlinePlus.
                      </p>
                      <div className="flex items-center gap-2 pt-4 border-t border-blue-50">
                        <Info className="w-4 h-4 text-blue-300" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Official NIH Data</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
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
