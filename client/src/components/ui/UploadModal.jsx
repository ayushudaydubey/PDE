import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { Upload } from 'lucide-react';

const UploadModal = ({ isOpen, onClose, onUpload, isLoading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload File">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Select a CSV or Excel file to upload company data.</p>

        <div className="flex items-center gap-2">
          <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => onUpload(e.target.files[0])} />
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onUpload()} isLoading={isLoading} className="ml-2">
            <Upload className="w-4 h-4 mr-2" /> Upload
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadModal;
