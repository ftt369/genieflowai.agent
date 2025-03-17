declare module 'prismjs' {
  const Prism: {
    highlightAll: () => void;
    highlight: (text: string, grammar: any, language: string) => string;
    highlightElement: (element: HTMLElement) => void;
    languages: Record<string, any>;
  };
  export default Prism;
}

declare module 'prismjs/components/*' {
  // This is a wildcard module declaration
}

declare module 'prismjs/themes/*' {
  // This is a wildcard module declaration for themes
} 