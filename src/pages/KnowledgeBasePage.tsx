import React from 'react';
import { KnowledgeBaseManager } from '@/components/KnowledgeBaseManager';
import PageContainer from '@/components/layout/PageContainer';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Link } from 'react-router-dom';
import { Home, Database } from 'lucide-react';

const KnowledgeBasePage: React.FC = () => {
  return (
    <PageContainer>
      <div className="mb-6">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <div className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span>Knowledge Base</span>
            </div>
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>
      
      <KnowledgeBaseManager />
    </PageContainer>
  );
};

export default KnowledgeBasePage; 