import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Minus, 
  Search, 
  AlertCircle, 
  TrendingUp, 
  History, 
  Loader2, 
  Save, 
  X, 
  ArrowLeft, 
  Filter,
  PlusCircle,
  MinusCircle,
  Archive,
  BarChart3,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { inventoryService } from '../../api/service';
import { motion, AnimatePresence } from 'framer-motion';

const StaffInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Forms
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    category: 'Medicine',
    description: '',
    current_stock: 0,
    min_stock_level: 10,
    unit: 'pcs'
  });
  
  const [transactionForm, setTransactionForm] = useState({
    transaction_type: 'addition',
    quantity: 1,
    source: 'Manual',
    notes: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.createItem(newItemForm);
      setShowAddModal(false);
      fetchItems();
      setNewItemForm({ name: '', category: 'Medicine', description: '', current_stock: 0, min_stock_level: 10, unit: 'pcs' });
    } catch (err) {
      alert("Failed to add inventory item.");
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.createTransaction({
        item_id: selectedItem.id,
        ...transactionForm
      });
      setShowTransactionModal(false);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.detail || "Transaction failed.");
    }
  };

  const categories = ['All', 'Medicine', 'Supplies', 'Equipment'];
  const filteredItems = items.filter(item => 
    (filterCategory === 'All' || item.category === filterCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = items.filter(i => i.current_stock <= i.min_stock_level).length;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6">
          <Link to="/staff" className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-cpsu-green">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-cpsu-green/10 text-cpsu-green text-[10px] font-black uppercase tracking-widest rounded-full">Pharmacy Logistics</span>
              <div className="w-1.5 h-1.5 rounded-full bg-cpsu-gold animate-pulse" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 font-outfit tracking-tight">Clinical Inventory</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Medical Supply chain & Medication Management</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-8 py-5 bg-cpsu-green text-white font-black uppercase tracking-widest text-[10px] rounded-[1.8rem] shadow-2xl shadow-cpsu-green/20 hover:bg-black transition-all active:scale-95 group"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Provision New Asset
        </button>
      </div>

      {/* Metrics & Filter Bar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-center">
        <div className="xl:col-span-2 relative group">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cpsu-green transition-colors" />
          <input 
            type="text" 
            placeholder="Query inventory database..."
            className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-cpsu-green/5 focus:border-cpsu-green/20 font-bold text-sm transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex p-1.5 bg-white rounded-[1.8rem] border border-gray-100 shadow-sm overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex-1 px-6 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filterCategory === cat ? 'bg-cpsu-green text-white shadow-lg shadow-cpsu-green/10' : 'text-gray-400 hover:text-cpsu-green hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={`px-8 py-4 rounded-[1.8rem] border flex items-center gap-4 shadow-sm transition-all ${
          lowStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-cpsu-green/5 border-cpsu-green/10'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
            lowStockCount > 0 ? 'bg-red-600 text-white' : 'bg-cpsu-green text-white'
          }`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-[9px] font-black uppercase tracking-widest ${lowStockCount > 0 ? 'text-red-600' : 'text-cpsu-green'}`}>
              Alert Status
            </p>
            <p className="text-2xl font-black text-gray-900 font-outfit leading-none">
              {lowStockCount} <span className="text-xs text-gray-400">Low Stock</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="p-32 text-center bg-white rounded-[3rem] border border-gray-100">
          <Loader2 className="w-12 h-12 text-cpsu-green animate-spin mx-auto mb-6" />
          <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Stock Data...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-32 text-center bg-white rounded-[3rem] border border-gray-100">
          <Archive className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-gray-900 font-outfit mb-2">Storage Unit Empty</h3>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No assets found matching your current query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredItems.map((item, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={item.id} 
                className={`bg-white rounded-[2.8rem] border-2 p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden ${
                  item.current_stock <= item.min_stock_level ? 'border-red-100' : 'border-transparent'
                }`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${
                  item.category === 'Medicine' ? 'bg-blue-600' : 'bg-purple-600'
                }`} />
                
                <div className="flex justify-between items-start mb-8 relative">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6 ${
                    item.category === 'Medicine' ? 'bg-blue-50 text-blue-600' :
                    item.category === 'Supplies' ? 'bg-purple-50 text-purple-600' :
                    'bg-cpsu-gold/10 text-cpsu-gold'
                  }`}>
                    <Package className="w-7 h-7" />
                  </div>
                  
                  <div className="flex bg-gray-50 p-1 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                    <button 
                      onClick={() => { setSelectedItem(item); setTransactionForm({...transactionForm, transaction_type: 'addition'}); setShowTransactionModal(true); }}
                      className="p-3 text-cpsu-green hover:bg-white hover:shadow-sm rounded-lg transition-all"
                      title="Stock Increment"
                    >
                      <PlusCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => { setSelectedItem(item); setTransactionForm({...transactionForm, transaction_type: 'deduction'}); setShowTransactionModal(true); }}
                      className="p-3 text-red-500 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                      title="Stock Drawdown"
                    >
                      <MinusCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.category}</span>
                  <h3 className="text-2xl font-black text-gray-900 font-outfit mt-1 tracking-tight">{item.name}</h3>
                  <p className="text-sm text-gray-400 font-medium mt-2 leading-relaxed line-clamp-2">{item.description || 'System-grade medical asset.'}</p>
                </div>
                
                <div className="flex items-end justify-between pt-6 border-t border-gray-50 relative">
                  <div>
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${
                      item.current_stock <= item.min_stock_level ? 'text-red-600 animate-pulse' : 'text-gray-400'
                    }`}>
                      {item.current_stock <= item.min_stock_level ? 'REPLENISHMENT REQUIRED' : 'ON-HAND INVENTORY'}
                    </p>
                    <p className={`text-4xl font-black font-outfit flex items-baseline gap-2 ${
                      item.current_stock <= item.min_stock_level ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {item.current_stock}
                      <span className="text-sm font-black text-gray-300 uppercase tracking-widest">{item.unit}</span>
                    </p>
                  </div>
                  <button className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 hover:bg-cpsu-green hover:text-white transition-all shadow-sm">
                    <History className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Transaction Modal (Add/Remove Stock) */}
      <AnimatePresence>
        {showTransactionModal && selectedItem && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-xl p-12 shadow-2xl relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 bg-cpsu-green/10 rounded-full blur-3xl opacity-50" />
              
              <div className="relative">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-black text-white rounded-3xl flex items-center justify-center shadow-xl">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 font-outfit leading-none mb-1">Asset Allocation</h2>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">{selectedItem.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowTransactionModal(false)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all text-gray-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleTransaction} className="space-y-8">
                  <div className="flex p-2 bg-gray-50 rounded-[2.2rem] border border-gray-100 shadow-inner">
                    {['addition', 'deduction'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTransactionForm({...transactionForm, transaction_type: type})}
                        className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all capitalize ${
                          transactionForm.transaction_type === type 
                          ? (type === 'addition' ? 'bg-cpsu-green text-white shadow-xl shadow-cpsu-green/20' : 'bg-red-600 text-white shadow-xl shadow-red-600/20')
                          : 'text-gray-400 hover:bg-white hover:text-gray-600'
                        }`}
                      >
                        {type === 'addition' ? 'Restock / Increase' : 'Withdrawal / Decrease'}
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Change Quantity</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          required
                          min="1"
                          className="w-full p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] outline-none text-4xl font-black font-outfit text-center focus:bg-white focus:ring-4 focus:ring-cpsu-green/5 transition-all shadow-inner"
                          value={transactionForm.quantity}
                          onChange={e => setTransactionForm({...transactionForm, quantity: Math.max(1, parseInt(e.target.value))})}
                        />
                         <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">{selectedItem.unit}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transaction Source</label>
                      <div className="space-y-2">
                        {['Restock', 'Prescription', 'Manual'].map(src => (
                          <button
                            key={src}
                            type="button"
                            onClick={() => setTransactionForm({...transactionForm, source: src})}
                            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                              transactionForm.source === src 
                              ? 'bg-black text-white border-black shadow-lg shadow-gray-200' 
                              : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            {src}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-dashed border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Projected Stock Level</p>
                      <p className="text-3xl font-black text-gray-900 font-outfit flex items-baseline gap-2">
                        {selectedItem.current_stock}
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                        <span className={transactionForm.transaction_type === 'addition' ? 'text-cpsu-green' : 'text-red-600'}>
                          {transactionForm.transaction_type === 'addition' ? selectedItem.current_stock + transactionForm.quantity :
                           Math.max(0, selectedItem.current_stock - transactionForm.quantity)}
                        </span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-cpsu-gold">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className={`w-full py-6 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-[2.2rem] shadow-2xl transition-all active:scale-95 ${
                      transactionForm.transaction_type === 'addition' ? 'bg-cpsu-green hover:bg-black shadow-cpsu-green/20' : 'bg-red-600 hover:bg-black shadow-red-600/20'
                    }`}
                  >
                    Commit Transaction
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl p-12 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-cpsu-green text-white rounded-2xl flex items-center justify-center">
                    <Archive className="w-7 h-7" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 font-outfit tracking-tight">Provision Asset</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-gray-50 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-6">
                <div className="grid grid-cols-2 gap-6 text-left">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Internal Asset Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white font-bold"
                      value={newItemForm.name}
                      onChange={e => setNewItemForm({...newItemForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Classification</label>
                    <select 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white font-bold"
                      value={newItemForm.category}
                      onChange={e => setNewItemForm({...newItemForm, category: e.target.value})}
                    >
                      <option value="Medicine">Pharmacological</option>
                      <option value="Supplies">Clinical Supplies</option>
                      <option value="Equipment">Medical Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Metric Unit</label>
                    <input 
                      type="text" 
                      placeholder="e.g. PCS, BTL, PKT"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
                      value={newItemForm.unit}
                      onChange={e => setNewItemForm({...newItemForm, unit: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Inaugural Stock</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
                      value={newItemForm.current_stock}
                      onChange={e => setNewItemForm({...newItemForm, current_stock: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Critical Minimum</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
                      value={newItemForm.min_stock_level}
                      onChange={e => setNewItemForm({...newItemForm, min_stock_level: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Asset Description</label>
                  <textarea 
                    className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none h-32 focus:bg-white font-medium"
                    value={newItemForm.description}
                    onChange={e => setNewItemForm({...newItemForm, description: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full py-6 bg-cpsu-green text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[2rem] shadow-2xl shadow-cpsu-green/20 hover:bg-black transition-all"
                >
                  Confirm Asset Provisioning
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffInventory;
