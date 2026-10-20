import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { parseWooCommerceCsv, WooParseResult } from '../../utils/wooCommerceParser';
import { Product } from '../../types';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Database,
  Image as ImageIcon,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Info,
} from 'lucide-react';

interface WooCommerceProductImporterProps {
  onClose: () => void;
}

export const WooCommerceProductImporter: React.FC<WooCommerceProductImporterProps> = ({
  onClose,
}) => {
  const { categories, importProductsCSV } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<WooParseResult | null>(null);
  const [previewTab, setPreviewTab] = useState<'products' | 'categories' | 'diagnostics'>('products');
  const [replaceAll, setReplaceAll] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState<{
    success: boolean;
    importedCount: number;
    updatedCount: number;
    message: string;
  } | null>(null);

  // Handle local CSV file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      const parsed = parseWooCommerceCsv(content, categories);
      setParseResult(parsed);
      setImportReport(null);
    };
    reader.readAsText(file);
  };

  // Handle manual textarea change
  const handleTextChange = (text: string) => {
    setCsvText(text);
    setFileName(null);
    if (text.trim().length > 10) {
      const parsed = parseWooCommerceCsv(text, categories);
      setParseResult(parsed);
    } else {
      setParseResult(null);
    }
    setImportReport(null);
  };

  // Commit import to persistent database
  const handleCommitImport = () => {
    if (!csvText.trim()) return;

    setIsImporting(true);
    try {
      const res = importProductsCSV(csvText, replaceAll);

      if (res.success) {
        setImportReport({
          success: true,
          importedCount: res.count,
          updatedCount: res.updatedCount || 0,
          message: replaceAll
            ? `Successfully imported all ${res.count} products into the persistent database.`
            : `Successfully synced ${res.count} products (${res.addedCount || 0} new, ${res.updatedCount || 0} updated) with zero duplicates.`,
        });
      } else {
        setImportReport({
          success: false,
          importedCount: 0,
          updatedCount: 0,
          message: res.error || 'Failed to import CSV.',
        });
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-[#FAF8F5] w-full max-w-5xl rounded-3xl shadow-2xl border border-[#E8E0D5] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-[#E8E0D5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#A25828]/10 text-[#A25828] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                WooCommerce 19-Product CSV Importer &amp; Validator
              </h2>
              <p className="text-xs text-stone-500">
                Preserves exact prices &amp; names, removes Hostinger metadata, extracts galleries, and maps to 9 SEO category silos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-2 rounded-xl text-lg font-bold transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Success Banner */}
          {importReport && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                importReport.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {importReport.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-sm">
                  {importReport.success ? 'Import Complete' : 'Import Error'}
                </p>
                <p className="mt-1">{importReport.message}</p>
                {importReport.success && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-semibold text-[11px]">
                      {importReport.importedCount} Products Active in Database
                    </span>
                    <button
                      onClick={onClose}
                      className="bg-emerald-800 text-white px-3 py-1 rounded-md font-semibold text-[11px] hover:bg-emerald-900 cursor-pointer"
                    >
                      Done &amp; View Products
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D5C7B7] hover:border-[#A25828] bg-white rounded-2xl p-6 text-center cursor-pointer transition-colors group flex flex-col items-center justify-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] text-[#A25828] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-stone-800">
                {fileName ? `File: ${fileName}` : 'Upload WooCommerce Product CSV'}
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                Drop your 19-product CSV file here or click to browse
              </p>
            </div>

            {/* Paste Box */}
            <div className="bg-white rounded-2xl p-4 border border-[#E8E0D5] flex flex-col">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Or Paste WooCommerce CSV Text</span>
                {csvText && (
                  <button
                    onClick={() => handleTextChange('')}
                    className="text-stone-400 hover:text-stone-600 text-[10px] normal-case"
                  >
                    Clear
                  </button>
                )}
              </label>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Paste CSV rows here: ID, Type, SKU, Name, Regular price, Sale price, Categories, Images..."
                className="flex-1 w-full text-[11px] font-mono p-3 rounded-xl border border-[#D5C7B7] focus:border-[#A25828] outline-none resize-none"
              />
            </div>
          </div>

          {/* Pre-Import Validation & Diagnostics */}
          {parseResult && (
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E0D5]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Validation Diagnostics
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      parseResult.totalParsed === 19
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {parseResult.totalParsed} Products Detected
                    {parseResult.totalParsed === 19 && ' (Target Count Verified ✓)'}
                  </span>
                </div>

                {/* Sub tabs */}
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setPreviewTab('products')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      previewTab === 'products'
                        ? 'bg-[#A25828] text-white'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Product Preview ({parseResult.totalParsed})
                  </button>
                  <button
                    onClick={() => setPreviewTab('categories')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      previewTab === 'categories'
                        ? 'bg-[#A25828] text-white'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Category Mapping
                  </button>
                  <button
                    onClick={() => setPreviewTab('diagnostics')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      previewTab === 'diagnostics'
                        ? 'bg-[#A25828] text-white'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Images &amp; Warnings ({parseResult.warnings.length + parseResult.missingImages.length})
                  </button>
                </div>
              </div>

              {/* Tab 1: Products Preview */}
              {previewTab === 'products' && (
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-xs text-left text-stone-700">
                    <thead className="bg-[#FAF8F5] text-stone-500 uppercase tracking-wider text-[10px] sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Target Category</th>
                        <th className="py-2.5 px-3">Regular Price</th>
                        <th className="py-2.5 px-3">Sale Price</th>
                        <th className="py-2.5 px-3">Images</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {parseResult.products.map((p, idx) => {
                        const cat = categories.find((c) => c.id === p.categoryId);
                        return (
                          <tr key={p.id || idx} className="hover:bg-stone-50">
                            <td className="py-2.5 px-3 font-mono text-[11px] text-stone-400">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-stone-900 max-w-xs truncate">
                              {p.name}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500">
                              {p.sku}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-medium">
                                {cat?.name || 'Sofas'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-stone-900">
                              £{p.price.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-[#A25828] font-semibold">
                              {p.salePrice ? `£${p.salePrice.toFixed(2)}` : '—'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="flex items-center gap-1 text-[11px] text-stone-600">
                                <ImageIcon className="w-3.5 h-3.5 text-[#A25828]" />
                                {p.images.length} {p.images.length > 1 ? 'gallery' : ''}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Category Mapping */}
              {previewTab === 'categories' && (
                <div className="space-y-3">
                  <p className="text-xs text-stone-600">
                    Products are automatically grouped into the 9 dedicated SEO categories:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {categories.map((cat) => {
                      const count = parseResult.products.filter((p) => p.categoryId === cat.id).length;
                      return (
                        <div
                          key={cat.id}
                          className="p-3 rounded-xl border border-stone-200 bg-[#FAF8F5] flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-xs text-stone-900">{cat.name}</p>
                            <p className="text-[10px] font-mono text-stone-500">/category/{cat.slug}</p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              count > 0 ? 'bg-[#A25828] text-white' : 'bg-stone-200 text-stone-500'
                            }`}
                          >
                            {count} items
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Diagnostics */}
              {previewTab === 'diagnostics' && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {parseResult.missingImages.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Missing Images Detected ({parseResult.missingImages.length} products)
                      </p>
                      <p className="text-[11px]">
                        The following products did not have accessible image URLs in the CSV. High-fidelity vector fallbacks have been assigned:
                      </p>
                      <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                        {parseResult.missingImages.map((name, i) => (
                          <li key={i}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parseResult.warnings.length > 0 && (
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-stone-800">
                        <Info className="w-4 h-4 text-stone-500" />
                        Parser Warnings ({parseResult.warnings.length})
                      </p>
                      <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                        {parseResult.warnings.map((warn, i) => (
                          <li key={i}>{warn}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parseResult.missingImages.length === 0 && parseResult.warnings.length === 0 && (
                    <div className="p-4 text-center text-xs text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                      Zero issues detected. All product names, prices, categories, and image records are verified.
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E8E0D5]">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 select-none">
                  <input
                    type="checkbox"
                    checked={replaceAll}
                    onChange={(e) => setReplaceAll(e.target.checked)}
                    className="rounded text-[#A25828] focus:ring-[#A25828]"
                  />
                  <span>
                    Replace all existing sample products (recommended for clean 19-product catalogue)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCommitImport}
                    disabled={isImporting || parseResult.totalParsed === 0}
                    className="bg-[#A25828] hover:bg-[#8A461A] disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Importing to Database...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5" />
                        <span>Commit {parseResult.totalParsed} Products to Store Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
