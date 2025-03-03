import React, { useState, useEffect } from 'react';
import {
  Book,
  Upload,
  Search,
  Plus,
  Settings,
  ShoppingBag,
  FileText,
  Tag,
  Download,
  Trash2,
  Edit,
} from 'lucide-react';
import { useKnowledgeBaseStore } from '../store/knowledgeBaseStore';
import { DocumentType, KnowledgeDocument } from '../types/knowledgeBase';

export default function KnowledgeBaseManager() {
  const {
    knowledgeBases,
    activeKnowledgeBaseId,
    marketplaceItems,
    searchResults,
    isLoading,
    error,
    createKnowledgeBase,
    setActiveKnowledgeBase,
    addDocument,
    searchDocuments,
    fetchMarketplaceItems,
    purchaseMarketplaceItem,
    importKnowledgeBase,
  } = useKnowledgeBaseStore();

  const [showNewKbModal, setShowNewKbModal] = useState(false);
  const [newKbName, setNewKbName] = useState('');
  const [newKbDescription, setNewKbDescription] = useState('');
  const [newKbCategory, setNewKbCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{
    types: DocumentType[];
    tags: string[];
  }>({
    types: [],
    tags: [],
  });
  const [showMarketplace, setShowMarketplace] = useState(false);

  useEffect(() => {
    fetchMarketplaceItems();
  }, []);

  const handleCreateKnowledgeBase = () => {
    if (newKbName.trim()) {
      createKnowledgeBase(newKbName, newKbDescription, newKbCategory);
      setShowNewKbModal(false);
      setNewKbName('');
      setNewKbDescription('');
      setNewKbCategory('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeKnowledgeBaseId) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const document: Omit<KnowledgeDocument, 'id'> = {
        name: file.name,
        type: file.type as DocumentType,
        source: 'upload',
        content,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          size: file.size,
          tags: [],
        },
      };

      await addDocument(activeKnowledgeBaseId, document);
    };

    reader.readAsText(file);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchDocuments(searchQuery, selectedFilters);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-[#2C2C2C] border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Knowledge Bases
          </h2>
          <button
            onClick={() => setShowNewKbModal(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {knowledgeBases.map((kb) => (
            <button
              key={kb.id}
              onClick={() => setActiveKnowledgeBase(kb.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                kb.id === activeKnowledgeBaseId
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Book size={18} />
              <span className="truncate">{kb.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowMarketplace(true)}
          className="flex items-center gap-2 w-full px-4 py-2 mt-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ShoppingBag size={18} />
          <span>Marketplace</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {showMarketplace ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Knowledge Base Marketplace
              </h2>
              <button
                onClick={() => setShowMarketplace(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Back
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaceItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#2C2C2C] rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>⭐ {item.stats.rating}</span>
                    <span>↓ {item.stats.downloads}</span>
                    <span>📝 {item.stats.reviews}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm">
                      <span className="text-gray-900 dark:text-white font-medium">
                        ${item.pricing.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {item.pricing.type === 'subscription'
                          ? `/${item.pricing.interval}`
                          : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => purchaseMarketplaceItem(item.id)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Purchase
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            {activeKnowledgeBaseId ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search documents..."
                          className="w-full px-4 py-2 bg-gray-100 dark:bg-[#3C3C3C] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Search size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload size={18} />
                    </label>
                    <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                      <Settings size={20} />
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 dark:text-red-400 py-8">
                    {error}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white dark:bg-[#2C2C2C] rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <FileText className="text-gray-400" size={20} />
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {doc.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {doc.metadata.size} bytes
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-1 text-gray-500 hover:text-blue-500 transition-colors">
                              <Edit size={16} />
                            </button>
                            <button className="p-1 text-gray-500 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 dark:bg-[#3C3C3C] rounded-full p-4 inline-flex mb-4">
                      <FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      No documents found
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Upload documents or import from the marketplace
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 dark:bg-[#3C3C3C] rounded-full p-4 inline-flex mb-4">
                  <Book className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  No knowledge base selected
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create a new knowledge base or select one from the sidebar
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Knowledge Base Modal */}
      {showNewKbModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-xl p-6 w-96">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Knowledge Base
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newKbName}
                  onChange={(e) => setNewKbName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#3C3C3C] rounded-lg"
                  placeholder="Enter knowledge base name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newKbDescription}
                  onChange={(e) => setNewKbDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#3C3C3C] rounded-lg"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newKbCategory}
                  onChange={(e) => setNewKbCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#3C3C3C] rounded-lg"
                  placeholder="e.g., Legal, Technical, Medical"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNewKbModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3C3C3C] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKnowledgeBase}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 