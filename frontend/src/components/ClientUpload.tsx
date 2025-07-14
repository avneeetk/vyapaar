import React, { useState, useCallback, useRef } from 'react';
import Papa from "papaparse";
import { Upload, FileSpreadsheet, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadMockClients } from '@/api';
import { Client } from '../types/client';

interface ClientUploadProps {
  onClientsUploaded: (clients: Client[]) => void;
  onClose?: () => void;
}

const ClientUpload: React.FC<ClientUploadProps> = ({ onClientsUploaded, onClose }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const clients = (results.data as any[]).map(row => ({
            id: row.id || String(Math.random()),
            name: row.name || "",
            company: row.company || "",
            email: row.email || "",
            status: row.status || "pending",
            urgency: row.urgency || "medium",
            lastInteraction: row.lastInteraction ? new Date(row.lastInteraction).toISOString() : new Date().toISOString(),
            type: row.type || "renewal",
            dueDate: row.dueDate ? new Date(row.dueDate).toISOString() : null,
            details: row.details || null,
            auto: row.auto === "true" || row.auto === true,
          }));
          await uploadMockClients(clients);
          onClientsUploaded(clients);
          setUploadStatus('success');
          setTimeout(() => {
            setIsUploading(false);
            onClose?.();
          }, 1500);
        } catch (error) {
          setIsUploading(false);
          setUploadStatus('error');
        }
      },
      error: (error) => {
        setIsUploading(false);
        setUploadStatus('error');
      }
    });
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };


  // Upload the hardcoded sample clients
  const handleSampleUpload = async () => {
    setIsUploading(true);
    try {
      await uploadMockClients(generateSampleClients());
      onClientsUploaded(generateSampleClients());
      setUploadStatus('success');
      setTimeout(() => {
        setIsUploading(false);
        onClose?.();
      }, 1500);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      setUploadStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {onClose && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-[#161616] font-['IBM_Plex_Sans']">
            Upload Clients
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#6F6F6F] hover:text-[#161616]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {uploadStatus === 'success' ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-[#24A148] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#161616] font-['IBM_Plex_Sans'] mb-2">
            Upload Successful!
          </h3>
          <p className="text-[#6F6F6F] font-['IBM_Plex_Sans']">
            Your clients have been uploaded and NAARAD is now managing follow-ups automatically.
          </p>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-medium text-[#161616] font-['IBM_Plex_Sans'] mb-2">
              Hand Over Your Client List
            </h2>
            <p className="text-[#6F6F6F] font-['IBM_Plex_Sans']">
              Upload your client data and let NAARAD handle all follow-ups automatically
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-[#0F62FE] bg-[#F0F7FF]' 
                : 'border-[#C6C6C6] hover:border-[#0F62FE]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="w-12 h-12 border-4 border-[#0F62FE] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[#6F6F6F] font-['IBM_Plex_Sans']">
                  Processing your client data...
                </p>
              </div>
            ) : (
              <>
                <FileSpreadsheet className="w-12 h-12 text-[#6F6F6F] mx-auto mb-4" />
                <p className="text-[#161616] font-medium font-['IBM_Plex_Sans'] mb-2">
                  Drop your CSV or Excel file here
                </p>
                <p className="text-sm text-[#6F6F6F] font-['IBM_Plex_Sans'] mb-4">
                  or click to browse files
                </p>
                <Button
                  onClick={handleBrowseClick}
                  className="bg-[#0F62FE] hover:bg-[#0043CE] text-white font-['IBM_Plex_Sans'] font-medium"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              </>
            )}
          </div>

          <div className="mt-6 text-xs text-[#6F6F6F] font-['IBM_Plex_Sans']">
            <p className="mb-2">Supported formats: CSV, Excel (.xlsx, .xls)</p>
            <p>Required columns: Name, Email. Optional: Phone, Company, Priority</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
};
export default ClientUpload;