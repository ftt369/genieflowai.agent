import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Database, 
  FileText, 
  Upload,
  X, 
  Plus, 
  Search,
  Folder, 
  FolderPlus, 
  File, 
  FileUp,
  Settings
} from 'lucide-react';
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KnowledgeBase, KnowledgeDocument } from '@/types/knowledgeBase';

export const KnowledgeBaseManager: React.FC = () => {
  const {
    knowledgeBases,
    activeKnowledgeBaseId,
    createKnowledgeBase,
    updateKnowledgeBase, 
    deleteKnowledgeBase, 
    setActiveKnowledgeBase,
    getActiveKnowledgeBase,
    addDocument,
    removeDocument
  } = useKnowledgeBaseStore();

  const [newKbName, setNewKbName] = useState('');
  const [newKbDescription, setNewKbDescription] = useState('');
  const [newKbCategory, setNewKbCategory] = useState('General');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const activeKb = getActiveKnowledgeBase();
  const filteredKbs = knowledgeBases.filter(kb => 
    kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kb.metadata.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateKnowledgeBase = () => {
    if (!newKbName.trim()) return;
    
    createKnowledgeBase(
      newKbName.trim(), 
      newKbDescription.trim() || `Knowledge base for ${newKbName}`, 
      newKbCategory
    );
    
      setNewKbName('');
      setNewKbDescription('');
    setNewKbCategory('General');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeKb || !e.target.files?.length) return;
    
    const file = e.target.files[0];
    
    // Read file content
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (!event.target?.result) return;
      
      const content = event.target.result.toString();
      
      // Determine file type
      let type: 'text' | 'pdf' | 'code' = 'text';
      if (file.name.endsWith('.pdf')) {
        type = 'pdf';
      } else if (['.js', '.ts', '.py', '.java', '.c', '.cpp', '.html', '.css'].some(ext => file.name.endsWith(ext))) {
        type = 'code';
      }
      
      // Create document object
      const document: Omit<KnowledgeDocument, 'id'> = {
        name: file.name,
        type,
        source: 'upload',
        content,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          size: file.size,
          tags: [],
          category: activeKb.metadata.category
        }
      };

      await addDocument(activeKb.id, document);
    };

    reader.readAsText(file);
    
    // Clear the input
    e.target.value = '';
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Knowledge Base Manager</h1>
        <p className="text-muted-foreground">Create and manage knowledge bases for your assistant modes.</p>
        </div>

      <Tabs defaultValue="browse">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="browse">Browse Knowledge Bases</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search knowledge bases..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
        </div>
      </div>

          {filteredKbs.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Knowledge Bases</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                You haven't created any knowledge bases yet. Create one to start adding documents.
              </p>
              <Button variant="outline" onClick={() => document.getElementById('create-tab')?.click()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Knowledge Base
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKbs.map(kb => (
                <Card 
                  key={kb.id}
                  className={`cursor-pointer transition-all ${kb.id === activeKnowledgeBaseId ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                  onClick={() => setActiveKnowledgeBase(kb.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{kb.name}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete knowledge base "${kb.name}"?`)) {
                            deleteKnowledgeBase(kb.id);
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                  </div>
                    <CardDescription>{kb.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{kb.metadata.category}</span>
                      <span>{kb.documents.length} documents</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="w-full flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveKnowledgeBase(kb.id);
                          handleUploadButtonClick();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Add Files
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveKnowledgeBase(kb.id);
                          // Open settings dialog in a real implementation
                          alert(`Settings for ${kb.name}`);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
                  </div>
                )}
        </TabsContent>

        <TabsContent value="create" id="create-tab">
          <Card>
            <CardHeader>
              <CardTitle>Create New Knowledge Base</CardTitle>
              <CardDescription>
                Create a new knowledge base to organize your documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="Knowledge Base Name" 
                  value={newKbName}
                  onChange={(e) => setNewKbName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  placeholder="A brief description of the knowledge base"
                  value={newKbDescription}
                  onChange={(e) => setNewKbDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  className="w-full p-2 rounded-md border"
                  value={newKbCategory}
                  onChange={(e) => setNewKbCategory(e.target.value)}
                >
                  <option value="General">General</option>
                  <option value="Legal">Legal</option>
                  <option value="Medical">Medical</option>
                  <option value="Technical">Technical</option>
                  <option value="Financial">Financial</option>
                  <option value="Academic">Academic</option>
                  <option value="Business">Business</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCreateKnowledgeBase}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Knowledge Base
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {activeKb && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Documents in {activeKb.name}</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleUploadButtonClick}>
                <FileUp className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept=".txt,.pdf,.md,.js,.ts,.py,.java,.c,.cpp,.html,.css,.json"
              />
            </div>
          </div>

          {activeKb.documents.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Documents</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                This knowledge base doesn't have any documents yet. Upload files to get started.
              </p>
              <Button variant="outline" onClick={handleUploadButtonClick}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 border rounded-lg divide-y">
              {activeKb.documents.map(doc => (
                <div key={doc.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-muted rounded mr-3">
                      <File className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(doc.metadata.size / 1024)} KB • {new Date(doc.metadata.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground"
                    onClick={() => {
                      if (confirm(`Remove document "${doc.name}"?`)) {
                        removeDocument(activeKb.id, doc.id);
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 