// src/components/FileBrowser.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Folder,
  File,
  Search,
  Link,
  ChevronRight,
  ChevronDown,
  Loader2,
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  modified: number;
  permissions: string;
  path: string;
  children?: FileItem[];
  expanded?: boolean;
}

interface FileItemProps {
  file: FileItem;
  level: number;
  onToggle: (file: FileItem) => void;
  onRecognize: (file: FileItem) => void;
  onHardLink: (file: FileItem) => void;
}

const FileItemComponent: React.FC<FileItemProps> = ({
  file,
  level,
  onToggle,
  onRecognize,
  onHardLink,
}) => {
  const paddingLeft = `${level * 16}px`;

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div>
      <div
        className="flex items-center px-4 py-2.5 hover:bg-slate-50 group"
        style={{ paddingLeft }}
      >
        <div
          className="flex-1 flex items-center cursor-pointer"
          onClick={() => file.type === 'folder' && onToggle(file)}
        >
          <span className="w-5 flex items-center">
            {file.type === 'folder' && (
              file.expanded ?
                <ChevronDown className="h-4 w-4 text-slate-400" /> :
                <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </span>
          {file.type === 'folder' ?
            <Folder className="h-4 w-4 text-blue-500 mr-2" /> :
            <File className="h-4 w-4 text-slate-400 mr-2" />
          }
          <span className="text-sm text-slate-700">{file.name}</span>
          <span className="ml-4 text-xs text-slate-400">
            {formatSize(file.size)} · {formatDate(file.modified)}
          </span>
        </div>

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-slate-600 hover:text-slate-900"
            onClick={() => onRecognize(file)}
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-slate-600 hover:text-slate-900"
            onClick={() => onHardLink(file)}
          >
            <Link className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {file.type === 'folder' && file.expanded && file.children && (
        <div className="border-l border-slate-200 ml-6">
          {file.children.map(child => (
            <FileItemComponent
              key={child.id}
              file={child}
              level={level + 1}
              onToggle={onToggle}
              onRecognize={onRecognize}
              onHardLink={onHardLink}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileBrowser: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('/');

  const loadDirectory = async (path: string) => {
    try {
      setLoading(true);
      console.log('Requesting path:', path); // 打印请求路径
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      console.log('Response status:', response.status); // 打印响应状态码
      if (!response.ok) throw new Error('Failed to fetch directory contents');
      const data = await response.json();
      console.log('API Response data:', data); // 打印完整响应数据
      const files = Array.isArray(data.files) ? data.files : [];
      console.log('Processed files:', files); // 打印处理后的文件数组
      return files;
    } catch (err) {
      console.error('Load directory error:', err); // 打印详细错误信息
      setError(err instanceof Error ? err.message : 'Failed to load directory');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory(currentPath).then(data => {
      console.log('Setting files:', data);
      setFiles(data);
    });
  }, [currentPath]);

  const handleToggle = async (file: FileItem) => {
    if (file.type === 'folder') {
      const updatedFiles = [...files];
      const targetFile = findFile(updatedFiles, file.id);

      if (targetFile) {
        if (!targetFile.expanded) {
          const children = await loadDirectory(file.path);
          targetFile.children = children;
        }
        targetFile.expanded = !targetFile.expanded;
        setFiles(updatedFiles);
      }
    }
  };

  const findFile = (fileList: FileItem[], id: string): FileItem | null => {
    for (const file of fileList) {
      if (file.id === id) return file;
      if (file.children) {
        const found = findFile(file.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleRecognize = (file: FileItem) => {
    console.log('Recognize:', file.path);
  };

  const handleHardLink = (file: FileItem) => {
    console.log('Hard link:', file.path);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-medium text-slate-800">
          文件浏览器
          <span className="ml-2 text-sm font-normal text-slate-500">{currentPath}</span>
        </CardTitle>
      </CardHeader>
      <div className="p-1">
        {loading && (
          <div className="flex items-center justify-center p-4 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            加载中...
          </div>
        )}
        {error && (
          <div className="p-4 text-red-500">错误: {error}</div>
        )}
        {!loading && !error && Array.isArray(files) && files.map(file => (
          <FileItemComponent
            key={file.id}
            file={file}
            level={0}
            onToggle={handleToggle}
            onRecognize={handleRecognize}
            onHardLink={handleHardLink}
          />
        ))}
      </div>
    </Card>
  );
};

export default FileBrowser;