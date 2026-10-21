'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { MessageCircle, Upload, X, Check, ArrowLeft, Image as ImageIcon, Info } from 'lucide-react';

interface ApparelOption {
  id: string;
  name: string;
  fabric: string;
  silhouette: string;
  icon: (props: { selected: boolean }) => React.JSX.Element;
}

// Crisp inline SVG garment illustrations
function OversizedTeeIcon({ selected }: { selected: boolean }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 transition-transform duration-200">
      <path
        d="M32 20 C38 27 62 27 68 20 L86 28 L80 44 L70 41 L70 82 C70 84 68 86 66 86 L34 86 C32 86 30 84 30 82 L30 41 L20 44 L14 28 L32 20 Z"
        className={`${selected ? 'fill-[#C9A45C]/15 stroke-[#C9A45C]' : 'fill-[#F4F3ED] stroke-[#0B0B0D]'} stroke-[2.2] stroke-linejoin-round transition-colors`}
      />
      <path
        d="M38 21 C41 28 59 28 62 21"
        className={`${selected ? 'stroke-[#C9A45C]' : 'stroke-[#0B0B0D]'} stroke-[2] stroke-linecap-round transition-colors`}
        fill="none"
      />
      <line x1="26" y1="23" x2="22" y2="39" className={`${selected ? 'stroke-[#C9A45C]/40' : 'stroke-[#0B0B0D]/30'} stroke-[1.2]`} />
      <line x1="74" y1="23" x2="78" y2="39" className={`${selected ? 'stroke-[#C9A45C]/40' : 'stroke-[#0B0B0D]/30'} stroke-[1.2]`} />
      <line x1="30" y1="80" x2="70" y2="80" className={`${selected ? 'stroke-[#C9A45C]/30' : 'stroke-[#0B0B0D]/20'} stroke-[1]`} />
    </svg>
  );
}

function ClassicTeeIcon({ selected }: { selected: boolean }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 transition-transform duration-200">
      <path
        d="M35 20 C40 26 60 26 65 20 L82 26 L77 39 L68 36 L68 82 C68 84 66 86 64 86 L36 86 C34 86 32 84 32 82 L32 36 L23 39 L18 26 L35 20 Z"
        className={`${selected ? 'fill-[#C9A45C]/15 stroke-[#C9A45C]' : 'fill-[#F4F3ED] stroke-[#0B0B0D]'} stroke-[2.2] stroke-linejoin-round transition-colors`}
      />
      <path
        d="M39 21 C42 27 58 27 61 21"
        className={`${selected ? 'stroke-[#C9A45C]' : 'stroke-[#0B0B0D]'} stroke-[2] stroke-linecap-round transition-colors`}
        fill="none"
      />
      <line x1="28" y1="22" x2="26" y2="35" className={`${selected ? 'stroke-[#C9A45C]/40' : 'stroke-[#0B0B0D]/30'} stroke-[1.2]`} />
      <line x1="72" y1="22" x2="74" y2="35" className={`${selected ? 'stroke-[#C9A45C]/40' : 'stroke-[#0B0B0D]/30'} stroke-[1.2]`} />
      <line x1="32" y1="80" x2="68" y2="80" className={`${selected ? 'stroke-[#C9A45C]/30' : 'stroke-[#0B0B0D]/20'} stroke-[1]`} />
    </svg>
  );
}

function HoodieIcon({ selected }: { selected: boolean }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 transition-transform duration-200">
      <path
        d="M32 24 L14 36 L19 54 L28 48 L28 82 C28 84 30 86 32 86 L68 86 C70 86 72 84 72 82 L72 48 L81 54 L86 36 L68 24 Z"
        className={`${selected ? 'fill-[#C9A45C]/15 stroke-[#C9A45C]' : 'fill-[#F4F3ED] stroke-[#0B0B0D]'} stroke-[2.2] stroke-linejoin-round transition-colors`}
      />
      <path
        d="M34 25 C34 11 44 8 50 8 C56 8 66 11 66 25 C66 31 59 34 50 34 C41 34 34 31 34 25 Z"
        className={`${selected ? 'fill-[#C9A45C]/25 stroke-[#C9A45C]' : 'fill-[#E7E5DD] stroke-[#0B0B0D]'} stroke-[2] stroke-linejoin-round transition-colors`}
      />
      <path
        d="M42 22 C44 16 56 16 58 22 C58 27 54 30 50 30 C46 30 42 27 42 22 Z"
        className="fill-[#0B0B0D]/10 stroke-[#0B0B0D]/30 stroke-[1.2]"
      />
      <path d="M47 31 L46 42" className={`${selected ? 'stroke-[#C9A45C]' : 'stroke-[#0B0B0D]'} stroke-[1.5] stroke-linecap-round`} />
      <path d="M53 31 L54 42" className={`${selected ? 'stroke-[#C9A45C]' : 'stroke-[#0B0B0D]'} stroke-[1.5] stroke-linecap-round`} />
      <path
        d="M36 62 L42 56 L58 56 L64 62 L62 76 L38 76 Z"
        className={`${selected ? 'stroke-[#C9A45C]' : 'stroke-[#0B0B0D]'} fill-none stroke-[1.8] stroke-linejoin-round transition-colors`}
      />
      <line x1="28" y1="80" x2="72" y2="80" className={`${selected ? 'stroke-[#C9A45C]/30' : 'stroke-[#0B0B0D]/25'} stroke-[1]`} />
    </svg>
  );
}

const APPAREL_OPTIONS: ApparelOption[] = [
  {
    id: 'oversized_tee',
    name: 'Oversized Tee',
    fabric: '240 GSM French Terry Cotton',
    silhouette: 'Drop-shoulder boxy cut',
    icon: OversizedTeeIcon,
  },
  {
    id: 'classic_tee',
    name: 'Classic Tee',
    fabric: '100% Combed Cotton',
    silhouette: 'Regular crewneck drape',
    icon: ClassicTeeIcon,
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    fabric: '380 GSM Brushed Fleece',
    silhouette: 'Lined hood with pocket',
    icon: HoodieIcon,
  },
];

// Configured LYVEN WhatsApp Business contact (configurable via NEXT_PUBLIC_WHATSAPP_NUMBER)
const LYVEN_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6300107759';

export default function CustomDesignPage() {
  const [selectedProduct, setSelectedProduct] = useState<ApparelOption>(APPAREL_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate supported formats
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Unsupported file format. Please select a PNG, JPG, or WebP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size limit (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('Image exceeds the 10 MB limit. Please select a smaller file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setReferenceFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setReferenceFile(null);
    setFilePreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate safely encoded WhatsApp enquiry URL
  const generateWhatsAppUrl = () => {
    if (!LYVEN_WHATSAPP_NUMBER) return '';

    const lines = [
      'Hello LYVEN! I would like to enquire about a custom apparel design.',
      '',
      `Product: ${selectedProduct.name} (${selectedProduct.fabric})`,
    ];

    if (description.trim()) {
      lines.push('', `My idea: ${description.trim()}`);
    }

    if (referenceFile) {
      lines.push('', `Reference image: Attached "${referenceFile.name}" (I will send this file in our WhatsApp chat).`);
    }

    lines.push('', 'Please help me discuss the design, preview and pricing.');

    const message = lines.join('\n');
    return `https://wa.me/91${LYVEN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const whatsappUrl = generateWhatsAppUrl();

  const handleContinueOnWhatsApp = async () => {
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('apparelId', selectedProduct.id);
      fd.append('apparelName', selectedProduct.name);
      fd.append('fabric', selectedProduct.fabric);
      fd.append('description', description);
      if (referenceFile) {
        fd.append('file', referenceFile);
      }

      const res = await fetch('/api/custom-design/enquire', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      const targetUrl = data?.whatsappUrl || whatsappUrl;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error saving enquiry:', err);
      // Fallback to opening WhatsApp directly so customer experience is not interrupted
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF8F3] text-[#0B0B0D] min-h-screen py-5 sm:py-10 px-3.5 sm:px-6 pb-28 sm:pb-12 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-3.5 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6E7B] hover:text-[#0B0B0D] transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C] rounded-md px-1 py-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
        </div>

        {/* ─── 1. Label, 2. Heading, 3. Explanatory sentence ──────────────── */}
        <header className="mb-5 sm:mb-8 text-center sm:text-left">
          <span className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A45C] font-bold mb-1 sm:mb-1.5">
            LYVEN CUSTOM STUDIO
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B0B0D] font-sans">
            Make it yours.
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#6B6E7B] leading-relaxed">
            Choose an apparel type to start your custom T-shirt or hoodie design. Share your idea with us on WhatsApp, and we&apos;ll help bring it to life.
          </p>
        </header>

        {/* ─── 4. Compact Garment Selector ─────────────────────────────────── */}
        <section aria-label="Apparel selection" className="mb-5 sm:mb-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {APPAREL_OPTIONS.map((apparel) => {
              const isSelected = selectedProduct.id === apparel.id;
              const IconComponent = apparel.icon;
              return (
                <button
                  key={apparel.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedProduct(apparel)}
                  className={`text-center p-2 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-200 border flex flex-col items-center justify-between relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C] ${
                    isSelected
                      ? 'bg-white border-[#C9A45C] ring-2 ring-[#C9A45C]/30 shadow-xs'
                      : 'bg-white/85 border-[#E7E5DD] hover:border-[#C9A45C]/50 hover:bg-white shadow-xs'
                  }`}
                >
                  {/* Selection Check Indicator */}
                  <div className="w-full flex justify-end mb-0.5 sm:mb-1">
                    <div
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-[#C9A45C] border-[#C9A45C] text-[#0B0B0D]'
                          : 'border-[#E7E5DD] bg-white group-hover:border-[#C9A45C]'
                      }`}
                    >
                      {isSelected && <Check className="w-2 sm:w-2.5 h-2 sm:h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* SVG Garment Illustration */}
                  <div className="my-1 flex items-center justify-center">
                    <IconComponent selected={isSelected} />
                  </div>

                  {/* Garment Details */}
                  <div className="mt-1 w-full min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B0B0D] font-sans truncate">
                      {apparel.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-[#6B6E7B] mt-0.5 font-sans truncate">
                      {apparel.fabric}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Garment Confirmation */}
          <div className="mt-2.5 px-1 flex items-center justify-between text-xs font-mono">
            <span className="text-[#6B6E7B]">
              Selected for customization:{' '}
              <strong className="text-[#0B0B0D] font-bold">{selectedProduct.name}</strong>
            </span>
            <span className="text-[11px] text-[#C9A45C] font-semibold hidden sm:inline">
              {selectedProduct.fabric}
            </span>
          </div>
        </section>

        {/* ─── 5. Combined Description & Attachment Card ──────────────────── */}
        <section aria-labelledby="custom-form-heading" className="mb-6">
          <div className="bg-white rounded-2xl border border-[#E7E5DD] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <h2 id="custom-form-heading" className="text-sm font-bold text-[#0B0B0D] font-sans">
                Tell us what you have in mind
              </h2>
              <span className="text-[11px] text-[#A1A1AA] font-mono">Optional</span>
            </div>

            {/* Description Field (reduced height ~110-120px on desktop) */}
            <div className="rounded-xl border border-[#E7E5DD] p-2.5 sm:p-3 bg-[#FAF8F3]/60 focus-within:bg-white focus-within:border-[#C9A45C] focus-within:ring-1 focus-within:ring-[#C9A45C]/30 transition-all mb-3.5">
              <textarea
                id="design-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your design concept, preferred colors, graphic placement or specific ideas..."
                className="w-full bg-transparent resize-none text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none font-sans leading-relaxed h-24 sm:h-[115px]"
              />
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />

            {/* Attachment Button or Preview Row */}
            {!referenceFile ? (
              <div>
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E7E5DD] hover:border-[#C9A45C] bg-[#FAF8F3] hover:bg-[#F4F3ED] cursor-pointer text-xs font-medium text-[#0B0B0D] transition-all group focus-within:ring-2 focus-within:ring-[#C9A45C]"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C9A45C] group-hover:scale-110 transition-transform" />
                  <span>Attach reference image</span>
                  <span className="text-[10px] text-[#A1A1AA] font-mono hidden sm:inline">(PNG, JPG, WebP up to 10MB)</span>
                </label>

                {fileError && (
                  <p className="text-xs text-red-600 mt-2 font-sans font-medium" role="alert">
                    {fileError}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="rounded-xl border border-[#E7E5DD] bg-[#FAF8F3] p-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {filePreview ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-[#E7E5DD] shrink-0">
                        <img src={filePreview} alt="Reference thumbnail" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white border border-[#E7E5DD] shrink-0 flex items-center justify-center text-[#6B6E7B]">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#0B0B0D] truncate max-w-[180px] sm:max-w-xs font-sans">
                        {referenceFile.name}
                      </p>
                      <p className="text-[10px] text-[#6B6E7B] font-mono">
                        {(referenceFile.size / (1024 * 1024)).toFixed(2)} MB · <span className="text-[#15803D] font-medium">Ready to share</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <label
                      htmlFor="file-upload"
                      className="px-2.5 py-1 rounded-lg border border-[#E7E5DD] hover:border-[#C9A45C] text-[11px] font-medium text-[#0B0B0D] hover:bg-white cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#C9A45C]"
                    >
                      Change
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      aria-label="Remove attached reference image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Clear customer instruction for WhatsApp image sharing */}
                <div className="mt-2.5 p-2 rounded-xl bg-amber-50/80 border border-[#C9A45C]/30 flex items-start gap-2 text-[11px] text-[#5A5D6B] font-sans leading-tight">
                  <Info className="w-3.5 h-3.5 text-[#C9A45C] shrink-0 mt-0.5" />
                  <span>
                    When WhatsApp opens, tap the <strong>+</strong> or paperclip icon in the chat to share <strong>{referenceFile.name}</strong> directly with our studio.
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── 6. Single Compact WhatsApp Action Button ─────────────────────── */}
        <div>
          {whatsappUrl ? (
            <button
              type="button"
              onClick={handleContinueOnWhatsApp}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] disabled:opacity-75 text-white font-bold text-sm tracking-wide transition-all shadow-[0_4px_16px_rgba(37,211,102,0.3)] hover:scale-[1.01] active:scale-[0.99] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{submitting ? 'Connecting to LYVEN Studio...' : 'Continue on WhatsApp'}</span>
            </button>
          ) : (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">
              WhatsApp support number not configured.
            </div>
          )}
          <p className="text-center text-[11px] text-[#A1A1AA] mt-2 font-sans">
            Direct chat with LYVEN studio. No payment required until your design is confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}
