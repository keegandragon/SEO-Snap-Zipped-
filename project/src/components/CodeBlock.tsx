import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'typescript',
  title
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden bg-gray-900 my-4">
      {title && (
        <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
          <span className="text-gray-200 text-sm font-mono">{title}</span>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
      <Highlight
        theme={themes.nightOwl}
        code={code.trim()}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className="p-4 overflow-auto" style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className="text-gray-500 mr-4 select-none">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

export default CodeBlock;