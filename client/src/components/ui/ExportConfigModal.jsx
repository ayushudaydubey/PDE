import React, { useState } from 'react';
import { Download, CheckSquare, Square, FileSpreadsheet, FileText } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ALL_COLUMNS = [
  { id: 'Company Name', label: 'Company Name', category: 'Company Profile' },
  { id: 'Website', label: 'Website', category: 'Company Profile' },
  { id: 'Industry', label: 'Industry', category: 'Company Profile' },
  { id: 'Email', label: 'Email', category: 'Contact Details' },
  { id: 'Phone', label: 'Phone', category: 'Contact Details' },
  { id: 'City', label: 'City', category: 'Location' },
  { id: 'Country', label: 'Country', category: 'Location' },
  { id: 'Tags', label: 'Tags', category: 'Metadata' },
  { id: 'Description', label: 'Description', category: 'Metadata' },
  { id: 'Employee Contacts', label: 'Employee Contacts', category: 'Contact Details' },
  { id: 'Social Media Links', label: 'Social Media Links', category: 'Metadata' },
  { id: 'Source', label: 'Source', category: 'Metadata' },
];

const ExportConfigModal = ({ isOpen, onClose, onConfirm, isExporting, defaultFormat = 'xlsx' }) => {
  const [selectedColumns, setSelectedColumns] = useState(
    ALL_COLUMNS.map((col) => col.id)
  );
  const [format, setFormat] = useState(defaultFormat);

  // Group columns by category
  const categories = ALL_COLUMNS.reduce((acc, col) => {
    if (!acc[col.category]) {
      acc[col.category] = [];
    }
    acc[col.category].push(col);
    return acc;
  }, {});

  const handleToggleColumn = (id) => {
    if (selectedColumns.includes(id)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== id));
    } else {
      setSelectedColumns([...selectedColumns, id]);
    }
  };

  const handleToggleCategory = (category, columnsInCategory) => {
    const ids = columnsInCategory.map((col) => col.id);
    const allSelected = ids.every((id) => selectedColumns.includes(id));

    if (allSelected) {
      // Deselect all in this category
      setSelectedColumns(selectedColumns.filter((id) => !ids.includes(id)));
    } else {
      // Select all in this category
      const newSelected = [...selectedColumns];
      ids.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedColumns(newSelected);
    }
  };

  const handleSelectAll = () => {
    setSelectedColumns(ALL_COLUMNS.map((col) => col.id));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleConfirm = () => {
    onConfirm(selectedColumns, format);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Export Dataset" className="max-w-2xl">
      <div className="space-y-6">
        {/* Step 1: Format Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">1. Select Export Format</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormat('xlsx')}
              className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                format === 'xlsx'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${format === 'xlsx' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold text-sm">Excel Spreadsheet</span>
                  <span className="block text-xs text-gray-500">Best for complex data viewing</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                format === 'xlsx' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
              }`}>
                {format === 'xlsx' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                format === 'csv'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${format === 'csv' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold text-sm">CSV File</span>
                  <span className="block text-xs text-gray-500">Universal comma-separated format</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                format === 'csv' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
              }`}>
                {format === 'csv' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Column Selection */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-2">
            <label className="block text-sm font-semibold text-gray-700">2. Select Columns to Export</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                Select All
              </button>
              <span className="text-gray-300 text-xs">|</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-1">
            {Object.entries(categories).map(([category, columns]) => {
              const allInCategorySelected = columns.every((col) => selectedColumns.includes(col.id));
              const someInCategorySelected = columns.some((col) => selectedColumns.includes(col.id));

              return (
                <div key={category} className="space-y-2.5">
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="text-xs font-bold text-gray-700 tracking-wide uppercase">{category}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(category, columns)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider transition"
                    >
                      {allInCategorySelected ? 'Deselect Category' : 'Select Category'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                    {columns.map((col) => {
                      const isChecked = selectedColumns.includes(col.id);
                      return (
                        <label
                          key={col.id}
                          className={`flex items-center space-x-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-indigo-100 bg-indigo-50/20 text-gray-900'
                              : 'border-gray-100 hover:bg-gray-50 text-gray-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleColumn(col.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                          />
                          <span className={`text-sm font-medium ${isChecked ? 'text-gray-900' : 'text-gray-600'}`}>
                            {col.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 shrink-0 bg-white">
          <div className="text-xs text-gray-500 font-medium self-start sm:self-center">
            Selected <span className="font-bold text-indigo-600">{selectedColumns.length}</span> of{' '}
            <span className="font-bold text-gray-700">{ALL_COLUMNS.length}</span> columns
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
              onClick={handleConfirm}
              disabled={selectedColumns.length === 0 || isExporting}
              isLoading={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Dataset
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExportConfigModal;
