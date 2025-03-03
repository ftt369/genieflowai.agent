import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bot, Search, Link2, Settings, Plus, Trash2, Power, Loader2, ArrowUpDown, BarChart2, Network, List } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { AgentConfigModal } from './AgentConfigModal';
import { Agent, AgentLink } from '../types/agent';
import { AgentNetwork } from './AgentNetwork';
import { AgentMetrics } from './AgentMetrics';

export function RightSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'network' | 'metrics' | 'settings'>('list');
  const [width, setWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfiguring, setIsConfiguring] = useState<number | null>(null);
  const [isLinking, setIsLinking] = useState<number | null>(null);
  const [links, setLinks] = useState<AgentLink[]>([
    { sourceId: 1, targetId: 2, type: 'data', status: 'active' }
  ]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<Agent[]>([
    { 
      id: 1, 
      name: 'Research Agent', 
      task: 'Analyze research papers', 
      isActive: true,
      status: 'running',
      type: 'research',
      linkedTo: [2],
      config: {
        memory: 512,
        speed: 75,
        accuracy: 90,
        interval: 5
      }
    },
    { 
      id: 2, 
      name: 'Code Agent', 
      task: 'Write and review code', 
      isActive: false,
      status: 'idle',
      type: 'code',
      config: {
        memory: 1024,
        speed: 60,
        accuracy: 85,
        interval: 3
      }
    },
    { 
      id: 3, 
      name: 'Data Agent', 
      task: 'Process and analyze data', 
      isActive: false,
      status: 'error',
      type: 'data',
      config: {
        memory: 2048,
        speed: 90,
        accuracy: 95,
        interval: 1
      }
    },
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.classList.add('resize-active');
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && sidebarRef.current) {
      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.max(280, Math.min(800, newWidth));
      setWidth(clampedWidth);
      window.dispatchEvent(new CustomEvent('sidebar-resize', { 
        detail: { width: clampedWidth, expanded: isExpanded } 
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.classList.remove('resize-active');
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const addNewAgent = () => {
    const newAgent: Agent = {
      id: agents.length + 1,
      name: `New Agent ${agents.length + 1}`,
      task: 'Configure this agent',
      isActive: false,
      status: 'idle',
      type: 'research',
      config: {
        memory: 512,
        speed: 50,
        accuracy: 75,
        interval: 5
      }
    };
    setAgents([...agents, newAgent]);
    setIsConfiguring(newAgent.id);
  };

  const toggleAgent = (id: number) => {
    setAgents(agents.map(agent => 
      agent.id === id ? { ...agent, isActive: !agent.isActive } : agent
    ));
  };

  const deleteAgent = (id: number) => {
    setAgents(agents.filter(agent => agent.id !== id));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(agents);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setAgents(items);
  };

  const handleAgentUpdate = (updatedAgent: Agent) => {
    setAgents(agents.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    ));
  };

  const handleLinkClick = (id: number) => {
    if (isLinking === null) {
      setIsLinking(id);
    } else if (isLinking !== id) {
      // Create a new link
      const newLink: AgentLink = {
        sourceId: isLinking,
        targetId: id,
        type: 'data',
        status: 'active'
      };
      
      // Update agent's linkedTo array
      setAgents(agents.map(agent => {
        if (agent.id === isLinking) {
          return {
            ...agent,
            linkedTo: [...(agent.linkedTo || []), id]
          };
        }
        return agent;
      }));

      // Add the link to links array
      setLinks([...links, newLink]);
      setIsLinking(null);
    }
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.task.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    // Emit resize event when toggling
    window.dispatchEvent(new CustomEvent('sidebar-resize', { 
      detail: { width: width, expanded: !isExpanded } 
    }));
  };

  return (
    <>
      <div 
        ref={sidebarRef}
        style={{ 
          width: isExpanded ? `${width}px` : '48px',
          transition: isDragging ? 'none' : 'width 300ms ease'
        }}
        className={`fixed right-0 top-0 h-screen bg-card/50 backdrop-blur-sm border-l border-input 
                  ${isDragging ? 'select-none' : ''} z-40`}
      >
        {/* Resize Handle */}
        {isExpanded && (
          <div
            className={`absolute left-0 top-0 w-1 h-full cursor-ew-resize group
                      hover:w-1.5 transition-all duration-150 ${isDragging ? 'w-1.5' : ''}`}
            onMouseDown={handleMouseDown}
          >
            <div className={`absolute inset-0 bg-primary/20 
                          group-hover:bg-primary/40 ${isDragging ? 'bg-primary/40' : ''}`} />
          </div>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={toggleExpanded}
          className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 
                   bg-card/50 backdrop-blur-sm border border-input rounded-l-md p-2 
                   hover:bg-accent transition-colors"
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {isExpanded && (
          <div className="h-full flex flex-col p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-card-foreground">Research & Agents</h2>
              <button
                onClick={addNewAgent}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="Add new agent"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-4 bg-background/50 p-1 rounded-md">
              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center justify-center flex-1 py-1.5 px-2 text-sm rounded-md transition-colors space-x-2
                          ${activeTab === 'list' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-accent text-muted-foreground'}`}
              >
                <List className="h-4 w-4" />
                <span>List</span>
              </button>
              <button
                onClick={() => setActiveTab('network')}
                className={`flex items-center justify-center flex-1 py-1.5 px-2 text-sm rounded-md transition-colors space-x-2
                          ${activeTab === 'network' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-accent text-muted-foreground'}`}
              >
                <Network className="h-4 w-4" />
                <span>Network</span>
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`flex items-center justify-center flex-1 py-1.5 px-2 text-sm rounded-md transition-colors space-x-2
                          ${activeTab === 'metrics' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-accent text-muted-foreground'}`}
              >
                <BarChart2 className="h-4 w-4" />
                <span>Metrics</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center justify-center flex-1 py-1.5 px-2 text-sm rounded-md transition-colors space-x-2
                          ${activeTab === 'settings' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-accent text-muted-foreground'}`}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>

            {/* Search Bar - only show for list view */}
            {activeTab === 'list' && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background/50 border border-input rounded-md 
                           text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 
                           focus:ring-primary transition-colors"
                />
              </div>
            )}

            {/* Content based on active tab */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'list' && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="agents">
                    {(provided: DroppableProvided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex-1 overflow-auto space-y-3"
                      >
                        {filteredAgents.map((agent, index) => (
                          <Draggable 
                            key={agent.id} 
                            draggableId={agent.id.toString()} 
                            index={index}
                          >
                            {(provided: DraggableProvided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group relative p-4 rounded-lg border transition-all duration-200
                                          ${agent.isActive 
                                            ? 'bg-primary/10 border-primary shadow-md' 
                                            : 'bg-background/50 border-input hover:border-primary hover:shadow-sm'}
                                          ${isLinking === agent.id ? 'ring-2 ring-primary' : ''}
                                          ${isLinking !== null && isLinking !== agent.id 
                                            ? 'cursor-pointer hover:ring-2 hover:ring-primary' 
                                            : ''}`}
                                onClick={() => isLinking !== null && handleLinkClick(agent.id)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-md bg-background/80 ${getStatusColor(agent.status)}`}>
                                      {agent.status === 'running' ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Bot className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="font-medium text-card-foreground">{agent.name}</h3>
                                      <p className="text-sm text-muted-foreground">{agent.task}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAgent(agent.id);
                                      }}
                                      className={`p-1.5 rounded-md transition-colors
                                                ${agent.isActive 
                                                  ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                                  : 'hover:bg-accent text-muted-foreground'}`}
                                    >
                                      <Power className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Agent Actions */}
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-input">
                                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    {agent.linkedTo && agent.linkedTo.length > 0 && (
                                      <div className="flex items-center space-x-1">
                                        <Link2 className="h-3 w-3" />
                                        <span>{agent.linkedTo.length} linked</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleLinkClick(agent.id);
                                      }}
                                      className={`p-1.5 rounded-md transition-colors
                                                ${isLinking === agent.id 
                                                  ? 'bg-primary/20 text-primary' 
                                                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}
                                    >
                                      <Link2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsConfiguring(agent.id);
                                      }}
                                      className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                                    >
                                      <Settings className="h-3.5 w-3.5" />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteAgent(agent.id);
                                      }}
                                      className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Link Indicator */}
                                {links.some(link => link.sourceId === agent.id || link.targetId === agent.id) && (
                                  <div className="absolute -right-2 -top-2 w-4 h-4 bg-primary rounded-full border-2 border-background" />
                                )}

                                {/* Drag Handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute -left-3 top-1/2 transform -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              {activeTab === 'network' && (
                <div className="h-full">
                  <AgentNetwork agents={agents} links={links} />
                </div>
              )}

              {activeTab === 'metrics' && (
                <div className="space-y-6 p-4 overflow-auto">
                  {agents.map(agent => (
                    <div key={agent.id} className="rounded-lg border border-input bg-background/50 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-md bg-background/80 ${getStatusColor(agent.status)}`}>
                            {agent.status === 'running' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{agent.name}</h3>
                            <p className="text-sm text-muted-foreground">{agent.task}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleAgent(agent.id)}
                          className={`p-2 rounded-md transition-colors
                                    ${agent.isActive 
                                      ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                      : 'hover:bg-accent text-muted-foreground'}`}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                      <AgentMetrics agent={agent} />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4 p-2">
                  <div className="rounded-lg border border-input bg-background/50 p-4">
                    <h3 className="font-medium mb-2">Global Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Default Memory Allocation</label>
                        <input
                          type="range"
                          min="128"
                          max="2048"
                          step="128"
                          defaultValue="512"
                          className="w-full mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Update Interval</label>
                        <input
                          type="range"
                          min="1"
                          max="60"
                          defaultValue="5"
                          className="w-full mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {isConfiguring !== null && (
        <AgentConfigModal
          agent={agents.find(a => a.id === isConfiguring) || null}
          onClose={() => setIsConfiguring(null)}
          onSave={handleAgentUpdate}
        />
      )}
    </>
  );
} 