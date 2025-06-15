import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';
import DescriptionCard from '../components/DescriptionCard';
import UsageIndicator from '../components/UsageIndicator';
import { UploadedImage, ProductDescription } from '../types';
import { generateProductDescription, sendDescriptionByEmail } from '../services/aiService';
import { exportToCSV } from '../services/csvService';
import { Sparkles, Info, AlertCircle, Download, Settings, Crown, Calendar, User, CreditCard, X, Copy, Mail, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [descriptions, setDescriptions] = useState<ProductDescription[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationLimit, setGenerationLimit] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'account'>('generate');
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Progress tracking state
  const [batchProgress, setBatchProgress] = useState({
    current: 0,
    total: 0,
    currentImageName: '',
    isProcessing: false
  });

  // Bulk actions state
  const [bulkActionLoading, setBulkActionLoading] = useState<'copy' | 'email' | 'csv' | null>(null);
  const [showBulkEmailForm, setShowBulkEmailForm] = useState(false);
  const [bulkEmail, setBulkEmail] = useState('');
  const [bulkActionSuccess, setBulkActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user && !user.isPremium && user.usageCount >= user.usageLimit) {
      setGenerationLimit(true);
    } else {
      setGenerationLimit(false);
    }
  }, [user]);

  const handleImageUpload = (uploadedImages: UploadedImage[]) => {
    console.log('Images updated:', uploadedImages.map(img => ({ id: img.id, status: img.status })));
    setImages(uploadedImages);
    setError(null); // Clear any previous errors when images change
  };

  const getPlanFeatures = () => {
    if (!user) return { maxTags: 5, maxWords: 150, planName: 'Free', maxImages: 1 };
    
    if (!user.isPremium) {
      return { maxTags: 5, maxWords: 150, planName: 'Free', maxImages: 1 };
    } else if (user.usageLimit === 50) {
      return { maxTags: 10, maxWords: 300, planName: 'Starter', maxImages: 2 };
    } else if (user.usageLimit === 200) {
      return { maxTags: 15, maxWords: 500, planName: 'Pro', maxImages: 10 };
    }
    
    return { maxTags: 5, maxWords: 150, planName: 'Free', maxImages: 1 };
  };

  const getPlanType = (): 'free' | 'starter' | 'pro' => {
    if (!user || !user.isPremium) return 'free';
    if (user.usageLimit === 50) return 'starter';
    if (user.usageLimit === 200) return 'pro';
    return 'free';
  };

  // Function to refresh user data from database
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Update user state with fresh data
      const updatedUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        usageCount: userData.usage_count,
        usageLimit: userData.usage_limit,
        isPremium: userData.is_premium,
        createdAt: userData.created_at,
        authId: userData.auth_id,
        subscriptionId: userData.subscription_id
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const handleGenerateDescription = async () => {
    if (!user) return;
    
    if (!user.isPremium && user.usageCount >= user.usageLimit) {
      setError("You've reached your monthly usage limit.");
      return;
    }
    
    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    // Check if all images are uploaded successfully
    const completedImages = images.filter(img => img.status === 'complete');
    const uploadingImages = images.filter(img => img.status === 'uploading');
    const errorImages = images.filter(img => img.status === 'error');

    console.log('Image status check:', {
      total: images.length,
      completed: completedImages.length,
      uploading: uploadingImages.length,
      error: errorImages.length
    });

    if (uploadingImages.length > 0) {
      setError("Please wait for all images to finish uploading.");
      return;
    }

    if (errorImages.length > 0) {
      setError("Some images failed to upload. Please remove them and try again.");
      return;
    }

    if (completedImages.length !== images.length) {
      setError("Please wait for all images to finish uploading.");
      return;
    }
    
    setError(null);
    setGenerating(true);
    
    try {
      const planFeatures = getPlanFeatures();
      
      if (images.length === 1) {
        // Single image generation (existing logic)
        setBatchProgress({
          current: 1,
          total: 1,
          currentImageName: images[0].file.name,
          isProcessing: true
        });

        const image = images[0];
        const description = await generateProductDescription(
          image.file,
          image.preview,
          user.id,
          user.usageLimit,
          user.isPremium
        );
        
        setDescriptions(prev => [description, ...prev]);
      } else {
        // Batch processing for multiple images
        console.log('Processing batch of', images.length, 'images');
        
        // Initialize progress
        setBatchProgress({
          current: 0,
          total: images.length,
          currentImageName: '',
          isProcessing: true
        });
        
        // Convert images to base64 format expected by the Edge Function
        const imageData = await Promise.all(images.map(async (img) => ({
          id: img.id,
          data: await fileToBase64(img.file),
          filename: img.file.name
        })));

        console.log('Calling process-batch with data:', {
          imageCount: imageData.length,
          userId: user.id,
          planType: getPlanType()
        });
        
        // Process images one by one to track progress properly
        const results = [];
        const errors = [];

        for (let i = 0; i < imageData.length; i++) {
          const imageItem = imageData[i];
          
          // Update progress for current image
          setBatchProgress({
            current: i,
            total: images.length,
            currentImageName: imageItem.filename,
            isProcessing: true
          });

          try {
            console.log(`Processing image ${i + 1}/${images.length}: ${imageItem.filename}`);
            
            // Call the single image generation function for each image
            const description = await generateProductDescription(
              images[i].file,
              images[i].preview,
              user.id,
              user.usageLimit,
              user.isPremium
            );
            
            results.push(description);
            
            // Update progress to show completion of current image
            setBatchProgress({
              current: i + 1,
              total: images.length,
              currentImageName: imageItem.filename,
              isProcessing: true
            });
            
            console.log(`Successfully processed image ${i + 1}/${images.length}`);
            
          } catch (error) {
            console.error(`Error processing image ${i + 1}:`, error);
            errors.push({
              index: i,
              imageName: imageItem.filename,
              error: error instanceof Error ? error.message : 'Failed to process image'
            });
          }
        }

        console.log(`Batch processing complete: ${results.length} successful, ${errors.length} failed`);

        // Add all successful results to descriptions
        setDescriptions(prev => [...results, ...prev]);
        
        // Show errors if any
        if (errors.length > 0) {
          setError(`${errors.length} image(s) failed to process. Successfully processed ${results.length} image(s).`);
        }
      }
      
      // Reset images after successful generation
      setImages([]);
      
      // Refresh user data to get updated usage count
      await refreshUserData();
      
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : "Failed to generate description");
    } finally {
      setGenerating(false);
      setBatchProgress({
        current: 0,
        total: 0,
        currentImageName: '',
        isProcessing: false
      });
    }
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSendEmail = async (email: string, description: ProductDescription) => {
    try {
      return await sendDescriptionByEmail(email, description);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
      return false;
    }
  };

  const handleExportAllCSV = () => {
    if (descriptions.length === 0) {
      setError("No descriptions to export");
      return;
    }
    exportToCSV(descriptions, 'all-seo-snap-descriptions');
  };

  // Bulk Actions
  const handleBulkCopyAll = async () => {
    if (descriptions.length === 0) return;
    
    setBulkActionLoading('copy');
    try {
      // Create a comprehensive text with all descriptions
      const allText = descriptions.map((desc, index) => {
        return `
=== PRODUCT ${index + 1}: ${desc.title} ===

DESCRIPTION:
${desc.text}

SEO TITLE: ${desc.seoMetadata.title}
META DESCRIPTION: ${desc.seoMetadata.description}
KEYWORDS: ${desc.keywords.join(', ')}
SEO TAGS: ${desc.seoMetadata.tags.join(', ')}

Generated: ${new Date(desc.createdAt).toLocaleDateString()}

${'='.repeat(60)}
        `;
      }).join('\n');

      await navigator.clipboard.writeText(allText.trim());
      setBulkActionSuccess(`Copied all ${descriptions.length} descriptions to clipboard!`);
      setTimeout(() => setBulkActionSuccess(null), 3000);
    } catch (error) {
      setError('Failed to copy to clipboard');
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleBulkEmailAll = async () => {
    if (!bulkEmail || descriptions.length === 0) return;
    
    setBulkActionLoading('email');
    try {
      // Send all descriptions in one email
      const { data: emailData, error: emailError } = await supabase.functions.invoke(
        'send-bulk-email',
        {
          body: {
            email: bulkEmail,
            descriptions: descriptions,
            totalCount: descriptions.length
          }
        }
      );

      if (emailError) {
        throw new Error(emailError.message || 'Failed to send bulk email');
      }

      if (!emailData || !emailData.success) {
        throw new Error(emailData?.error || 'Failed to send bulk email');
      }

      setBulkActionSuccess(`Successfully emailed all ${descriptions.length} descriptions!`);
      setShowBulkEmailForm(false);
      setBulkEmail('');
      setTimeout(() => setBulkActionSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send bulk email');
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleBulkExportCSV = () => {
    if (descriptions.length === 0) return;
    
    setBulkActionLoading('csv');
    try {
      exportToCSV(descriptions, `seo-snap-batch-${descriptions.length}-descriptions`);
      setBulkActionSuccess(`Exported all ${descriptions.length} descriptions to CSV!`);
      setTimeout(() => setBulkActionSuccess(null), 3000);
    } catch (error) {
      setError('Failed to export CSV');
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleCancelSubscription = () => {
    // In a real app, this would call your subscription cancellation API
    setShowCancelModal(false);
    // For now, just show a message
    alert('Subscription cancellation would be processed here. Contact support for assistance.');
  };

  if (!user) return null;

  const planFeatures = getPlanFeatures();
  const isProUser = user.isPremium && user.usageLimit === 200;

  const getCurrentPlanName = () => {
    if (!user.isPremium) return 'Free Plan';
    if (user.usageLimit === 50) return 'Starter Plan';
    if (user.usageLimit === 200) return 'Pro Plan';
    return 'Free Plan';
  };

  const getNextBillingDate = () => {
    // For demo purposes, show next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Check if generation button should be enabled
  const canGenerate = images.length > 0 && 
                     images.every(img => img.status === 'complete') && 
                     !generating && 
                     (!(!user.isPremium && generationLimit));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <div className="card">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('generate')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'generate'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles className="h-4 w-4 inline mr-1" />
                Generate
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'account'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="h-4 w-4 inline mr-1" />
                Account
              </button>
            </div>

            {activeTab === 'generate' ? (
              <>
                <UsageIndicator user={user} />
                
                {!user.isPremium && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Need more descriptions?</h3>
                    <Link to="/plans" className="btn btn-outline w-full">
                      Upgrade Plan
                    </Link>
                  </div>
                )}
              </>
            ) : (
              /* Account Management Section */
              <div className="space-y-6">
                {/* Current Plan */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Current Plan</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Crown className={`h-5 w-5 mr-2 ${user.isPremium ? 'text-blue-800' : 'text-gray-400'}`} />
                        <span className="font-medium text-gray-900">{getCurrentPlanName()}</span>
                      </div>
                      {user.isPremium && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• {user.usageLimit} generations per month</p>
                      <p>• {planFeatures.maxTags} SEO tags per product</p>
                      <p>• Up to {planFeatures.maxWords} words per description</p>
                      <p>• {planFeatures.maxImages} image{planFeatures.maxImages > 1 ? 's' : ''} per batch</p>
                      {isProUser && <p>• CSV export included</p>}
                    </div>
                  </div>
                </div>

                {/* Billing Information */}
                {user.isPremium && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Billing</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Next billing date</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-3">{getNextBillingDate()}</p>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">•••• •••• •••• 4242</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Actions */}
                <div className="space-y-3">
                  <Link 
                    to="/plans" 
                    className="btn btn-outline w-full flex items-center justify-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {user.isPremium ? 'Manage Subscription' : 'Upgrade Plan'}
                  </Link>
                  
                  {user.isPremium && (
                    <button 
                      onClick={() => setShowCancelModal(true)}
                      className="btn btn-outline w-full flex items-center justify-center text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>

                {/* Account Stats */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Account Statistics</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Member since</span>
                      <span className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total generations</span>
                      <span className="text-gray-900">{user.usageCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current plan</span>
                      <span className="text-gray-900">{getCurrentPlanName()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {activeTab === 'generate' && (
            <div className="card bg-blue-50 border-blue-100">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-800 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Your Plan Features</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• <strong>{planFeatures.planName} Plan</strong></p>
                    <p>• Up to {planFeatures.maxTags} SEO tags</p>
                    <p>• Max {planFeatures.maxWords} words</p>
                    <p>• {user.usageLimit} generations/month</p>
                    <p>• {planFeatures.maxImages} image{planFeatures.maxImages > 1 ? 's' : ''} per batch</p>
                    {isProUser && <p>• CSV export included</p>}
                  </div>
                  {!user.isPremium && (
                    <p className="text-sm text-gray-700 mt-2">
                      You have <span className="font-semibold">{Math.max(0, user.usageLimit - user.usageCount)}</span> free generations remaining this month.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'generate' ? (
            <>
              {/* Generation Section */}
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Generate New Description</h2>
                
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium">Error:</span>
                      <span className="text-sm ml-1">{error}</span>
                      {error.includes('Google AI API key') && (
                        <p className="text-sm mt-1">
                          The AI service requires proper configuration. Please contact support if this issue persists.
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <ImageUploader 
                  onImageUpload={handleImageUpload} 
                  className="mb-6"
                  maxImages={planFeatures.maxImages}
                  planType={getPlanType()}
                />
                
                {/* Progress Bar */}
                {batchProgress.isProcessing && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-900">
                        Processing Images ({batchProgress.current}/{batchProgress.total})
                      </h4>
                      <span className="text-sm text-blue-700">
                        {batchProgress.total > 0 ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    
                    {/* Current Image Info */}
                    {batchProgress.currentImageName && (
                      <div className="flex items-center text-sm text-blue-800">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
                        <span>
                          {batchProgress.current === batchProgress.total ? 
                            `Completed: ${batchProgress.currentImageName}` :
                            `Currently processing: ${batchProgress.currentImageName}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleGenerateDescription}
                    disabled={!canGenerate}
                    className="btn btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>
                          Generate Description{images.length > 1 ? 's' : ''} ({planFeatures.planName})
                        </span>
                      </>
                    )}
                  </button>
                  
                  {/* Progress indicator next to button */}
                  {batchProgress.isProcessing && (
                    <div className="flex items-center text-sm text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>{batchProgress.current}/{batchProgress.total}</span>
                    </div>
                  )}
                </div>
                
                {!user.isPremium && generationLimit && (
                  <div className="mt-4">
                    <p className="text-sm text-red-600 mb-2">
                      You've reached your monthly limit. Please upgrade your plan for more generations.
                    </p>
                    <Link to="/plans" className="btn btn-primary w-full sm:w-auto">
                      Upgrade Now
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Bulk Actions Success Message */}
              {bulkActionSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{bulkActionSuccess}</span>
                </div>
              )}
              
              {/* Generated Descriptions */}
              {descriptions.length > 0 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Your Descriptions ({descriptions.length})</h2>
                    
                    {/* Bulk Actions - Only show CSV export for Pro users */}
                    <div className="flex flex-wrap gap-2">
                      {/* Copy All Button */}
                      <button
                        onClick={handleBulkCopyAll}
                        disabled={bulkActionLoading === 'copy'}
                        className="btn btn-outline flex items-center space-x-2 text-sm"
                        title="Copy all descriptions to clipboard"
                      >
                        {bulkActionLoading === 'copy' ? (
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span>Copy All</span>
                      </button>

                      {/* Email All Button */}
                      <button
                        onClick={() => setShowBulkEmailForm(!showBulkEmailForm)}
                        className="btn btn-outline flex items-center space-x-2 text-sm"
                        title="Email all descriptions"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Email All</span>
                      </button>

                      {/* Export All CSV Button - ONLY FOR PRO USERS */}
                      {isProUser ? (
                        <button
                          onClick={handleBulkExportCSV}
                          disabled={bulkActionLoading === 'csv'}
                          className="btn btn-secondary flex items-center space-x-2 text-sm"
                          title="Export all descriptions to CSV (Pro Feature)"
                        >
                          {bulkActionLoading === 'csv' ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span>Export All CSV</span>
                        </button>
                      ) : (
                        <div className="relative group">
                          <button
                            disabled
                            className="btn btn-outline opacity-50 cursor-not-allowed flex items-center space-x-2 text-sm"
                            title="CSV Export is a Pro feature"
                          >
                            <Download className="h-4 w-4" />
                            <span>Export CSV</span>
                          </button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            CSV Export is a Pro feature
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bulk Email Form */}
                  {showBulkEmailForm && (
                    <div className="card bg-blue-50 border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Email All Descriptions</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Send all {descriptions.length} descriptions in one comprehensive email.
                      </p>
                      <div className="flex space-x-3">
                        <input
                          type="email"
                          placeholder="Enter email address"
                          value={bulkEmail}
                          onChange={(e) => setBulkEmail(e.target.value)}
                          className="input flex-1"
                          disabled={bulkActionLoading === 'email'}
                        />
                        <button
                          onClick={handleBulkEmailAll}
                          disabled={!bulkEmail || bulkActionLoading === 'email'}
                          className="btn btn-primary flex items-center space-x-2"
                        >
                          {bulkActionLoading === 'email' ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4" />
                              <span>Send All</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowBulkEmailForm(false);
                            setBulkEmail('');
                          }}
                          className="btn btn-outline"
                          disabled={bulkActionLoading === 'email'}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {descriptions.map(description => (
                    <DescriptionCard 
                      key={description.id}
                      description={description}
                      onSendEmail={handleSendEmail}
                    />
                  ))}
                </div>
              )}
              
              {descriptions.length === 0 && !generating && (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No descriptions yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Upload {planFeatures.maxImages > 1 ? `up to ${planFeatures.maxImages} product photos` : 'a product photo'} and click "Generate Description{planFeatures.maxImages > 1 ? 's' : ''}" to create your first AI-powered, SEO-optimized product description{planFeatures.maxImages > 1 ? 's' : ''} with {planFeatures.planName} plan features.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Account Management Content */
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
                
                {/* Profile Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={user.name}
                          disabled
                          className="input bg-gray-50 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="input bg-gray-50 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Contact support to update your profile information.
                    </p>
                  </div>

                  {/* Plan Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Crown className={`h-6 w-6 mr-3 ${user.isPremium ? 'text-blue-800' : 'text-gray-400'}`} />
                          <div>
                            <h4 className="font-semibold text-gray-900">{getCurrentPlanName()}</h4>
                            <p className="text-sm text-gray-600">
                              {user.isPremium ? 'Premium subscription' : 'Free plan'}
                            </p>
                          </div>
                        </div>
                        {user.isPremium && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{user.usageLimit}</p>
                          <p className="text-xs text-gray-600">Monthly Limit</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{user.usageCount}</p>
                          <p className="text-xs text-gray-600">Used This Month</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{planFeatures.maxTags}</p>
                          <p className="text-xs text-gray-600">SEO Tags</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{planFeatures.maxWords}</p>
                          <p className="text-xs text-gray-600">Max Words</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{planFeatures.maxImages}</p>
                          <p className="text-xs text-gray-600">Images/Batch</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link 
                        to="/plans" 
                        className="btn btn-primary flex items-center justify-center"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        {user.isPremium ? 'Change Plan' : 'Upgrade to Premium'}
                      </Link>
                      
                      <Link 
                        to="/subscription"
                        className="btn btn-outline flex items-center justify-center"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Subscription Settings
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <strong>Batch Processing:</strong> Upload multiple images at once with Starter (2 images) or Pro (10 images) plans for faster content generation.
                  </p>
                  <p>
                    <strong>CSV Export:</strong> Export your product descriptions to CSV format for easy import into your e-commerce platform. This feature is available exclusively with the Pro plan.
                  </p>
                  <p>
                    <strong>Cancellation Policy:</strong> You can cancel your subscription at any time. 
                    When you cancel, you'll continue to have access to premium features until the end 
                    of your current billing period.
                  </p>
                  <p>
                    <strong>Billing:</strong> Subscriptions are billed monthly. Your next billing date 
                    is shown in your subscription details above.
                  </p>
                  <p>
                    <strong>Support:</strong> Contact our support team at{' '}
                    <a href="mailto:support@seosnap.com" className="text-blue-800 hover:text-blue-700">
                      support@seosnap.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-start space-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 mb-2">
                    Are you sure you want to cancel your subscription?
                  </p>
                  <p className="text-sm text-gray-600">
                    You'll continue to have access until your current billing period ends.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn btn-outline flex-1"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;