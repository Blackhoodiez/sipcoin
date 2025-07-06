"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, Check, ArrowRight, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/providers/auth-provider";
import { ReceiptAPI } from "@/lib/receipt-api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function UploadScreen() {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // New state variables for real processing
  const [receiptData, setReceiptData] = useState<any>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrProgress, setOcrProgress] = useState(0);

  // Enhanced progress states for Step 2
  const [processingState, setProcessingState] = useState<'uploading' | 'processing' | 'complete' | 'error'>('uploading');
  const [progressMessage, setProgressMessage] = useState('');
  const [currentPhase, setCurrentPhase] = useState('');
  const [fileName, setFileName] = useState('');

  // Step 3: Editing and submission state
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({
    merchant_name: '',
    transaction_date: '',
    total_amount: '',
    items: '', // comma-separated for editing
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { user } = useAuth();

  // When receiptData changes, update editFields
  useEffect(() => {
    if (receiptData) {
      setEditFields({
        merchant_name: receiptData.merchant_name || '',
        transaction_date: receiptData.transaction_date ? receiptData.transaction_date.slice(0, 10) : '',
        total_amount: receiptData.total_amount ? String(receiptData.total_amount) : '',
        items: receiptData.metadata?.items?.join(', ') || '',
      });
    }
  }, [receiptData]);

  // Handle edit field changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFields((prev) => ({ ...prev, [name]: value }));
  };

  // Save edits to receiptData
  const handleSaveEdits = () => {
    setReceiptData((prev: any) => ({
      ...prev,
      merchant_name: editFields.merchant_name,
      transaction_date: editFields.transaction_date,
      total_amount: parseFloat(editFields.total_amount) || 0,
      metadata: {
        ...prev?.metadata,
        items: editFields.items.split(',').map((item) => item.trim()).filter(Boolean),
      },
    }));
    setEditMode(false);
  };

  // Cancel edits
  const handleCancelEdits = () => {
    setEditMode(false);
    setEditFields({
      merchant_name: receiptData?.merchant_name || '',
      transaction_date: receiptData?.transaction_date ? receiptData.transaction_date.slice(0, 10) : '',
      total_amount: receiptData?.total_amount ? String(receiptData.total_amount) : '',
      items: receiptData?.metadata?.items?.join(', ') || '',
    });
  };

  // Final submit handler
  const handleSubmitReceipt = async () => {
    setSubmitLoading(true);
    setSubmitError(null);

    const parsedAmount = parseFloat(editFields.total_amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setSubmitLoading(false);
      setSubmitError("Please enter a valid total amount before submitting.");
      return;
    }

    try {
      // 1. Update receipt details if edited
      const updateResult = await ReceiptAPI.updateReceipt({
        id: receiptData.id,
        merchant_name: editFields.merchant_name,
        transaction_date: editFields.transaction_date,
        total_amount: parsedAmount,
        items: editFields.items.split(',').map((item) => item.trim()).filter(Boolean),
      });
      if (!updateResult.success) throw new Error(updateResult.error);
      // 2. Submit receipt for points
      const result = await ReceiptAPI.submitReceipt(receiptData.id);
      if (!result.success) throw new Error(result.error);
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit receipt');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Real file upload and processing function - Enhanced with detailed progress tracking
  const uploadAndProcessReceipt = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setProcessingError(null);
      setProcessingState('uploading');
      setCurrentPhase('upload');
      
      // Step 1: Upload file with detailed progress
      console.log("Starting file upload...");
      setProgressMessage("Preparing file for upload...");
      
      // Simulate upload progress for better UX
      const uploadProgressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadProgressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);
      
      const uploadResult = await ReceiptAPI.uploadReceipt(file);
      clearInterval(uploadProgressInterval);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }
      
      setUploadProgress(100);
      setReceiptData(uploadResult.receipt);
      setProgressMessage("File uploaded successfully!");
      console.log("File uploaded successfully:", uploadResult.receipt);
      
      // Step 2: Process with OCR - Enhanced progress tracking
      setOcrProgress(0);
      setProcessingState('processing');
      setCurrentPhase('ocr');
      console.log("Starting OCR processing...");
      
      // Real-time OCR progress simulation with detailed messages
      const progressSteps = [
        { message: "Analyzing image quality...", duration: 800 },
        { message: "Extracting text from receipt...", duration: 1200 },
        { message: "Parsing receipt data...", duration: 1000 },
        { message: "Calculating points...", duration: 600 }
      ];
      
      let currentStep = 0;
      const totalDuration = progressSteps.reduce((sum, step) => sum + step.duration, 0);
      
      const progressInterval = setInterval(() => {
        const elapsed = progressSteps.slice(0, currentStep).reduce((sum, step) => sum + step.duration, 0);
        const progress = Math.min((elapsed / totalDuration) * 90, 90); // Cap at 90% until real completion
        
        setOcrProgress(progress);
        setProgressMessage(progressSteps[currentStep]?.message || "Processing...");
        
        if (currentStep >= progressSteps.length) {
          clearInterval(progressInterval);
        }
        currentStep++;
      }, 200);
      
      const processResult = await ReceiptAPI.processReceipt(uploadResult.receipt.id);
      clearInterval(progressInterval);
      
      if (!processResult.success) {
        throw new Error(processResult.error);
      }
      
      setOcrProgress(100);
      setProgressMessage("Processing complete!");
      setProcessingState('complete');
      setReceiptData(processResult.receipt);
      console.log("OCR processing completed:", processResult.receipt);
      
      // Step 3: Move to confirmation
      setTimeout(() => {
        setStep(3);
      }, 500);
      
    } catch (error) {
      console.error("Processing error:", error);
      setProcessingError(error instanceof Error ? error.message : "Processing failed");
      setProcessingState('error');
      setStep(1); // Return to upload step
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection (gallery or camera) - Updated for real processing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setStep(2); // Move to processing step
      setProcessingError(null);
      
      // Start real upload process
      await uploadAndProcessReceipt(file);
    }
  };

  // Trigger file input for gallery
  const handleGalleryClick = () => {
    fileInputRef.current?.setAttribute("capture", ""); // Remove capture attribute
    fileInputRef.current?.click();
  };

  // Trigger file input for camera
  const handleCameraClick = () => {
    fileInputRef.current?.setAttribute("capture", "environment"); // Use camera
    fileInputRef.current?.click();
  };

  // Calculate overall progress based on upload and OCR progress
  const overallProgress = Math.round((uploadProgress + ocrProgress) / 2);

  // Utility functions for formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Enhanced progress display component
  const renderProgressDetails = () => {
    if (processingState === 'uploading') {
      return (
        <div className="text-center">
          <p className="text-sm text-zinc-400 mb-2">Uploading file...</p>
          <div className="w-full bg-zinc-800 rounded-full h-1 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500">{uploadProgress}% complete</p>
        </div>
      );
    }

    if (processingState === 'processing') {
      return (
        <div className="text-center">
          <p className="text-sm text-zinc-400 mb-2">{progressMessage}</p>
          <div className="w-full bg-zinc-800 rounded-full h-1 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${ocrProgress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500">{Math.round(ocrProgress)}% complete</p>
        </div>
      );
    }

    if (processingState === 'complete') {
      return (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
            <Check className="h-6 w-6 text-green-400" />
          </div>
          <p className="text-sm text-green-300 mb-2">Processing complete!</p>
          <p className="text-xs text-zinc-400">Ready to review receipt details</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col p-4 pb-20" role="main">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Upload Receipt</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white"
          aria-label="Close upload screen"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      <nav aria-label="Upload progress" className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors duration-200 ${
                step >= 1 ? "bg-purple-500" : "bg-zinc-700"
              }`}
              role="status"
              aria-label={step > 1 ? "Step 1 completed" : "Step 1"}
            >
              {step > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <div
              className={`h-1 w-12 transition-colors duration-200 ${
                step >= 2 ? "bg-purple-500" : "bg-zinc-700"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors duration-200 ${
                step >= 2 ? "bg-purple-500" : "bg-zinc-700"
              }`}
              role="status"
              aria-label={step > 2 ? "Step 2 completed" : "Step 2"}
            >
              {step > 2 ? <Check className="h-4 w-4" /> : "2"}
            </div>
            <div
              className={`h-1 w-12 transition-colors duration-200 ${
                step >= 3 ? "bg-purple-500" : "bg-zinc-700"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors duration-200 ${
                step >= 3 ? "bg-purple-500" : "bg-zinc-700"
              }`}
              role="status"
              aria-label="Step 3"
            >
              3
            </div>
          </div>
          <div className="text-sm text-zinc-300" role="status">
            {step === 1 && "Upload"}
            {step === 2 && "Processing"}
            {step === 3 && "Confirm"}
          </div>
        </div>
      </nav>

      {processingError && (
        <Card className="w-full bg-red-900/20 border-red-800 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mr-3">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-medium text-red-200">Processing Failed</h3>
                <p className="text-sm text-red-300">{processingError}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-red-700 text-red-300 hover:bg-red-800/20"
                onClick={() => {
                  setProcessingError(null);
                  setStep(1);
                }}
              >
                Try Again
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setProcessingError(null);
                  setStep(1);
                }}
              >
                Upload Different Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <section
          className="flex flex-col items-center"
          aria-label="Upload options"
        >
          <Card className="w-full bg-zinc-900 border-zinc-800 mb-6 hover:border-zinc-700 transition-colors">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-zinc-300" aria-hidden="true" />
              </div>
              <p className="text-center text-zinc-300 mb-4">
                Take a photo or upload your receipt
              </p>
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button
                  variant="outline"
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  aria-label="Upload from gallery"
                  onClick={handleGalleryClick}
                >
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                  Gallery
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleCameraClick}
                  aria-label="Take photo with camera"
                >
                  <Camera className="mr-2 h-4 w-4" aria-hidden="true" />
                  Camera
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-zinc-300 mb-2">
            Accepted receipt types:
          </div>
          <div className="grid grid-cols-3 gap-2 w-full">
            {["Paper", "Digital", "QR Code"].map((type) => (
              <div
                key={type}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-center text-xs text-white hover:border-zinc-700 transition-colors"
              >
                {type}
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section
          className="flex flex-col items-center"
          aria-label="Processing receipt"
        >
          <Card className="w-full bg-zinc-900 border-zinc-800 mb-6">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4 animate-pulse">
                <div
                  className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"
                  role="status"
                  aria-label="Processing"
                ></div>
              </div>
              <p className="text-center font-medium text-white mb-2">
                {processingState === 'uploading' ? 'Uploading your receipt' : 'Processing your receipt'}
              </p>
              <p className="text-center text-xs text-purple-400 mb-2">
                {processingState === 'uploading' ? 'Phase 1 of 2' : 'Phase 2 of 2'}
              </p>
              {fileName && (
                <p className="text-center text-xs text-zinc-500 mb-2">
                  {fileName}
                </p>
              )}
              <p className="text-center text-zinc-300 mb-4">
                {progressMessage || "Our AI is analyzing your receipt"}
              </p>
              
              {/* Enhanced progress display */}
              {renderProgressDetails()}
              
              <p className="text-xs text-zinc-400 mt-4">
                {processingState === 'uploading' ? 'Uploading file...' : 'This may take a few seconds'}
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {step === 3 && !submitSuccess && (
        <section className="flex flex-col" aria-label="Confirm receipt details">
          <Card className="w-full bg-zinc-900 border-zinc-800 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">Receipt Details</h3>
                {/* Edit functionality removed for beta: no edit button or form */}
              </div>

              <div className="space-y-3 mb-6">
                {(receiptData ? [
                  { label: "Venue", value: receiptData.merchant_name || "Unknown" },
                  { label: "Date", value: formatDate(receiptData.transaction_date) },
                  { label: "Total Amount", value: receiptData.total_amount ? formatCurrency(receiptData.total_amount) : "Unknown" },
                  { label: "Items", value: (receiptData.metadata?.items?.length || 0) + " items" },
                ] : [
                  { label: "Venue", value: "Neon Lounge" },
                  { label: "Date", value: "May 19, 2025" },
                  { label: "Total Amount", value: "$42.50" },
                  { label: "Items", value: "3 drinks" },
                ]).map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-zinc-300">{label}</span>
                    <span className="font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-zinc-200">Estimated SipCoins</span>
                  <span className="text-xl font-bold text-purple-400">
                    {receiptData?.sipcoins_earned || 125}
                  </span>
                </div>
                <div className="text-xs text-zinc-400">
                  + {receiptData?.total_amount ? Math.floor(receiptData.total_amount * 2) : 85} base points (receipt total)
                </div>
                <div className="text-xs text-zinc-400">
                  + 40 bonus points (first visit)
                </div>
              </div>
              {submitError && <div className="text-red-400 text-sm mb-2">{submitError}</div>}
            </CardContent>
          </Card>

          <Button
            className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Submit receipt for processing"
            onClick={handleSubmitReceipt}
            disabled={submitLoading}
          >
            {submitLoading ? 'Submitting...' : 'Submit Receipt'}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </section>
      )}

      {/* Final success state */}
      {step === 3 && submitSuccess && (
        <section className="flex flex-col items-center justify-center min-h-[300px]" aria-label="Receipt submitted">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <Check className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-green-300 mb-2">Receipt Submitted!</h2>
          <p className="text-lg text-zinc-200 mb-4">You earned <span className="text-purple-400 font-bold">{receiptData?.sipcoins_earned || 125}</span> SipCoins</p>
          <Button className="mt-2" onClick={() => { setStep(1); setSubmitSuccess(false); setReceiptData(null); }}>Upload Another Receipt</Button>
          <Button variant="outline" className="mt-2" onClick={() => setStep(1)}>View Rewards</Button>
        </section>
      )}
    </div>
  );
}
