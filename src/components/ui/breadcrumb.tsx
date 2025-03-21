import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItemProps {
  children: React.ReactNode;
  isLast?: boolean;
}

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ 
  children, 
  isLast = false 
}) => {
  return (
    <li className="flex items-center">
      {children}
      {!isLast && (
        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
      )}
    </li>
  );
};

interface BreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

const BreadcrumbComponent: React.FC<BreadcrumbProps> = ({ 
  children, 
  className = ''
}) => {
  // Clone children to add isLast prop to the last child
  const childrenArray = React.Children.toArray(children);
  
  const enhancedChildren = childrenArray.map((child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        isLast: index === childrenArray.length - 1,
      });
    }
    return child;
  });

  return (
    <nav className={`mb-6 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center">
        {enhancedChildren}
      </ol>
    </nav>
  );
};

// Create compound component
export const Breadcrumb = Object.assign(BreadcrumbComponent, {
  Item: BreadcrumbItem,
}); 