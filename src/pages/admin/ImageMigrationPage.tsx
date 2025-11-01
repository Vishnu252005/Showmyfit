// Image Migration Page - Compress existing product images
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, AlertCircle, 
  Image as ImageIcon, Package, Zap, TrendingDown,
  Play, Pause, RefreshCw, TestTube
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, query, orderBy, where, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { compressProductImages, isFirebaseStorageUrl, isAlreadyCompressed, testStorageConnection } from '../../utils/imageMigration';

interface Product {
  id: string;
  name: string;
  image: string;
  images?: string[];
}

interface MigrationProgress {
  currentIndex: number;
  total: number;
  currentProduct: string;
  status: 'idle' | 'running' | 'paused' | 'completed';
  stats: {
    processed: number;
    successful: number;
    failed: number;
    totalSavings: number;
  };
  errors: Array<{ productId: string; name: string; error: string }>;
}

const ImageMigrationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [testMode, setTestMode] = useState<'idle' | 'checking-connection' | 'testing-one' | 'ready'>( 'idle');
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; productId?: string } | null>(null);
  const [testedProduct, setTestedProduct] = useState<Product | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [testProgress, setTestProgress] = useState<{
    step: string;
    progress: number;
    message: string;
    startTime: number;
    elapsedTime: number;
    errors: string[];
  }>({
    step: '',
    progress: 0,
    message: '',
    startTime: 0,
    elapsedTime: 0,
    errors: []
  });
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress>({
    currentIndex: 0,
    total: 0,
    currentProduct: '',
    status: 'idle',
    stats: {
      processed: 0,
      successful: 0,
      failed: 0,
      totalSavings: 0
    },
    errors: []
  });

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((p: any) => 
          p.image && 
          isFirebaseStorageUrl(p.image) && 
          !isAlreadyCompressed(p.image)
        ) as Product[];
      
      setProducts(productsData);
      setMigrationProgress(prev => ({
        ...prev,
        total: productsData.length
      }));
      console.log(`📦 Found ${productsData.length} products with uncompressed images`);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test connection
  const testConnection = async () => {
    setTestMode('checking-connection');
    setConnectionTestResult(null);
    
    try {
      const success = await testStorageConnection();
      if (success) {
        setConnectionTestResult({
          success: true,
          message: 'Firebase Storage connection successful!'
        });
        setTestMode('ready');
      } else {
        setConnectionTestResult({
          success: false,
          message: 'Failed to connect to Firebase Storage. Please check your connection.'
        });
        setTestMode('idle');
      }
    } catch (error: any) {
      setConnectionTestResult({
        success: false,
        message: `Connection test failed: ${error.message}`
      });
      setTestMode('idle');
    }
  };

  // Test one product migration
  const testOneProduct = async () => {
    if (products.length === 0) {
      setTestResult({
        success: false,
        message: 'No products available to test'
      });
      return;
    }

    const startTime = Date.now();
    setTestMode('testing-one');
    setTestResult(null);
    setTestedProduct(null);
    setTestProgress({
      step: 'Initializing',
      progress: 0,
      message: 'Preparing test...',
      startTime,
      elapsedTime: 0,
      errors: []
    });
    
    const testProduct = products[0];
    
    // Store original image URL for comparison
    setOriginalImageUrl(testProduct.image);
    
    // Update progress timer
    const progressInterval = setInterval(() => {
      setTestProgress(prev => ({
        ...prev,
        elapsedTime: Math.floor((Date.now() - prev.startTime) / 1000)
      }));
    }, 100);
    
    try {
      console.log(`🧪 Testing migration with product: ${testProduct.name}`);
      setTestProgress(prev => ({
        ...prev,
        step: 'Downloading',
        progress: 10,
        message: `Downloading image from Firebase Storage...`
      }));
      
      const result = await compressProductImages(
        testProduct.id,
        testProduct.image,
        testProduct.images,
        true, // Delete old images
        (progress) => {
          // Update progress based on compression progress
          const step = progress < 30 ? 'Downloading' : progress < 70 ? 'Compressing' : progress < 90 ? 'Uploading' : 'Finalizing';
          setTestProgress(prev => ({
            ...prev,
            step,
            progress,
            message: 
              progress < 30 ? 'Downloading image...' :
              progress < 70 ? 'Compressing image (this may take a moment)...' :
              progress < 90 ? 'Uploading compressed image...' :
              'Deleting old image and updating database...'
          }));
        }
      );

      setTestProgress(prev => ({
        ...prev,
        step: 'Updating Database',
        progress: 95,
        message: 'Updating product in database...'
      }));

      // Update product in Firestore
      await updateDoc(doc(db, 'products', testProduct.id), {
        image: result.newImage,
        ...(result.newImages && { images: result.newImages }),
        updatedAt: new Date()
      });

      setTestProgress(prev => ({
        ...prev,
        step: 'Fetching Updated Product',
        progress: 98,
        message: 'Loading updated product data...'
      }));

      // Fetch updated product to display
      const productDoc = await getDoc(doc(db, 'products', testProduct.id));
      let updatedProduct = testProduct;
      if (productDoc.exists()) {
        const docData = productDoc.data();
        updatedProduct = {
          id: testProduct.id,
          name: docData.name || testProduct.name,
          image: result.newImage,
          images: result.newImages || docData.images
        };
      } else {
        updatedProduct = {
          ...testProduct,
          image: result.newImage,
          images: result.newImages
        };
      }

      clearInterval(progressInterval);
      
      setTestProgress(prev => ({
        ...prev,
        step: 'Complete',
        progress: 100,
        message: `Successfully compressed! Saved ${result.savings.toFixed(2)} MB`
      }));

      setTestedProduct(updatedProduct);
      setTestResult({
        success: true,
        message: `Successfully compressed and migrated product "${testProduct.name}". Saved ${result.savings.toFixed(2)} MB`,
        productId: testProduct.id
      });
      
      // Reload products to remove the tested one from the list
      await loadProducts();
      setTestMode('ready');
      
      console.log('✅ Test migration successful');
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('❌ Test migration failed:', error);
      
      const errorMessage = error.message || 'Unknown error';
      setTestProgress(prev => ({
        ...prev,
        step: 'Failed',
        progress: 0,
        message: `Error: ${errorMessage}`,
        errors: [...prev.errors, errorMessage]
      }));
      
      setTestResult({
        success: false,
        message: `Test failed: ${errorMessage}`,
        productId: testProduct.id
      });
      setTestMode('ready');
      setTestedProduct(null);
      setOriginalImageUrl('');
    }
  };

  const migrateImages = async (startIndex: number = 0) => {
    if (migrationProgress.status === 'paused') {
      setMigrationProgress(prev => ({ ...prev, status: 'running' }));
    } else {
      setMigrationProgress(prev => ({ ...prev, status: 'running', currentIndex: startIndex }));
    }

    const productsToProcess = products.slice(startIndex);
    
    for (let i = 0; i < productsToProcess.length; i++) {
      // Check if paused
      if (migrationProgress.status === 'paused') {
        break;
      }

      const product = productsToProcess[i];
      const actualIndex = startIndex + i;
      
      setMigrationProgress(prev => ({
        ...prev,
        currentIndex: actualIndex,
        currentProduct: product.name
      }));

      try {
        console.log(`🗜️ Compressing images for product ${actualIndex + 1}/${products.length}: ${product.name}`);
        
        const result = await compressProductImages(
          product.id,
          product.image,
          product.images,
          true, // Delete old images
          (progress) => {
            // Progress callback can be used for UI updates
          }
        );

        // Update product in Firestore with new URLs
        await updateDoc(doc(db, 'products', product.id), {
          image: result.newImage,
          ...(result.newImages && { images: result.newImages }),
          updatedAt: new Date()
        });

        setMigrationProgress(prev => ({
          ...prev,
          stats: {
            processed: prev.stats.processed + 1,
            successful: prev.stats.successful + 1,
            failed: prev.stats.failed,
            totalSavings: prev.stats.totalSavings + result.savings
          }
        }));

        console.log(`✅ Successfully compressed images for product: ${product.name}`);
      } catch (error: any) {
        console.error(`❌ Failed to compress images for product ${product.name}:`, error);
        
        setMigrationProgress(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            processed: prev.stats.processed + 1,
            failed: prev.stats.failed + 1
          },
          errors: [
            ...prev.errors,
            {
              productId: product.id,
              name: product.name,
              error: error.message || 'Unknown error'
            }
          ]
        }));
      }

      // Small delay to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Mark as completed if we processed all items
    if (migrationProgress.currentIndex >= products.length - 1) {
      setMigrationProgress(prev => ({ ...prev, status: 'completed' }));
    }
  };

  const pauseMigration = () => {
    setMigrationProgress(prev => ({ ...prev, status: 'paused' }));
  };

  const resumeMigration = () => {
    migrateImages(migrationProgress.currentIndex);
  };

  const resetMigration = () => {
    setMigrationProgress({
      currentIndex: 0,
      total: products.length,
      currentProduct: '',
      status: 'idle',
      stats: {
        processed: 0,
        successful: 0,
        failed: 0,
        totalSavings: 0
      },
      errors: []
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Image Compression Migration</h1>
                  <p className="text-gray-600 mt-1">Compress existing product images to reduce storage and improve performance</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Successful</p>
                    <p className="text-2xl font-bold text-green-700">{migrationProgress.stats.successful}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-red-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Failed</p>
                    <p className="text-2xl font-bold text-red-700">{migrationProgress.stats.failed}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Space Saved</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {migrationProgress.stats.totalSavings.toFixed(1)} MB
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        {migrationProgress.status !== 'idle' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Migration Progress</h2>
              <span className="text-sm text-gray-600">
                {migrationProgress.currentIndex + 1} / {migrationProgress.total}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-300"
                style={{
                  width: `${((migrationProgress.currentIndex + 1) / migrationProgress.total) * 100}%`
                }}
              />
            </div>
            
            {migrationProgress.currentProduct && (
              <p className="text-sm text-gray-600">
                Processing: <span className="font-semibold">{migrationProgress.currentProduct}</span>
              </p>
            )}
            
            <div className="flex items-center space-x-4 mt-4">
              {migrationProgress.status === 'running' && (
                <button
                  onClick={pauseMigration}
                  className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </button>
              )}
              
              {migrationProgress.status === 'paused' && (
                <button
                  onClick={resumeMigration}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </button>
              )}
            </div>
          </div>
        )}

        {/* Test Mode */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <TestTube className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-900">Test Mode</h2>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
              Recommended: Test before migrating all
            </span>
          </div>
          
          <div className="space-y-4">
            {/* Connection Test */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">Step 1: Test Connection</h3>
                  <p className="text-sm text-gray-600">Check Firebase Storage connection</p>
                </div>
                <button
                  onClick={testConnection}
                  disabled={testMode === 'checking-connection' || testMode === 'testing-one'}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testMode === 'checking-connection' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </button>
              </div>
              {connectionTestResult && (
                <div className={`mt-3 p-3 rounded-lg flex items-center ${
                  connectionTestResult.success 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {connectionTestResult.success ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2" />
                  )}
                  <span className="text-sm font-medium">{connectionTestResult.message}</span>
                </div>
              )}
            </div>

            {/* Test One Product */}
            {testMode === 'ready' && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">Step 2: Test One Product</h3>
                    <p className="text-sm text-gray-600">Test migration on a single product first</p>
                  </div>
                  <button
                    onClick={testOneProduct}
                    disabled={testMode === 'testing-one' || products.length === 0}
                    className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testMode === 'testing-one' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test One Product
                      </>
                    )}
                  </button>
                </div>

                {/* Real-time Progress Display */}
                {testMode === 'testing-one' && (
                  <div className="mt-4 bg-white rounded-lg p-4 border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-gray-900">{testProgress.step}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {testProgress.elapsedTime}s elapsed
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${testProgress.progress}%` }}
                      />
                    </div>
                    
                    {/* Progress Percentage */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {testProgress.progress}% complete
                      </span>
                      <span className="text-xs text-gray-500">
                        {testProgress.progress < 100 
                          ? `Est. ${Math.ceil((100 - testProgress.progress) / 10)}s remaining`
                          : 'Complete!'}
                      </span>
                    </div>
                    
                    {/* Current Message */}
                    <div className="bg-purple-50 rounded-lg p-3 mt-2">
                      <p className="text-sm text-gray-700">{testProgress.message}</p>
                    </div>

                    {/* Errors if any */}
                    {testProgress.errors.length > 0 && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-semibold text-red-700">Errors:</span>
                        </div>
                        {testProgress.errors.map((error, index) => (
                          <p key={index} className="text-xs text-red-600 mt-1">
                            • {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {testResult && (
                  <div className={`mt-3 p-3 rounded-lg flex items-center ${
                    testResult.success 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2" />
                    )}
                    <span className="text-sm font-medium">{testResult.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tested Product Display */}
          {testedProduct && testResult?.success && (
            <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Test Product Preview</h3>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                  Verified: Image compressed successfully
                </span>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{testedProduct.name}</h4>
                  <p className="text-sm text-gray-600">Product ID: {testedProduct.id}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original Image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-gray-700">Original Image</h5>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Before</span>
                    </div>
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-red-200">
                      {originalImageUrl ? (
                        <img
                          src={originalImageUrl}
                          alt={`${testedProduct.name} - Original`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IExvYWRlZDwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <AlertCircle className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 text-center truncate max-w-full">
                      {originalImageUrl.substring(0, 50)}...
                    </p>
                  </div>

                  {/* Compressed Image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-gray-700">Compressed Image</h5>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">After</span>
                    </div>
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200">
                      {testedProduct.image ? (
                        <img
                          src={testedProduct.image}
                          alt={`${testedProduct.name} - Compressed`}
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('✅ Compressed image loaded successfully')}
                          onError={(e) => {
                            console.error('❌ Failed to load compressed image');
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RmFpbGVkIHRvIExvYWQ8L3RleHQ+PC9zdmc+';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <AlertCircle className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        ✓ Compressed
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center truncate max-w-full">
                      {testedProduct.image.substring(0, 50)}...
                    </p>
                  </div>
                </div>

                {/* Additional Images if any */}
                {testedProduct.images && testedProduct.images.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h5 className="font-semibold text-gray-700 mb-3">Additional Images ({testedProduct.images.length})</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {testedProduct.images.map((imgUrl, index) => (
                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={imgUrl}
                            alt={`${testedProduct.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onLoad={() => console.log(`✅ Additional image ${index + 1} loaded`)}
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Loading Status */}
                <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-600">Image should load above</span>
                  </div>
                  <button
                    onClick={() => window.open(testedProduct.image, '_blank')}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Open in new tab
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Full Migration</h2>
              <p className="text-gray-600 text-sm">
                {migrationProgress.status === 'idle' && 'Ready to start migration (recommended: test first)'}
                {migrationProgress.status === 'running' && 'Migration in progress...'}
                {migrationProgress.status === 'paused' && 'Migration paused'}
                {migrationProgress.status === 'completed' && 'Migration completed!'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {migrationProgress.status === 'idle' && (
                <button
                  onClick={() => migrateImages(0)}
                  disabled={products.length === 0 || testMode !== 'ready'}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  title={testMode !== 'ready' ? 'Please test connection and one product first' : ''}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Full Migration
                </button>
              )}
              
              <button
                onClick={loadProducts}
                disabled={loading || migrationProgress.status === 'running'}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {migrationProgress.status === 'completed' && (
                <button
                  onClick={resetMigration}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Errors */}
        {migrationProgress.errors.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              Errors ({migrationProgress.errors.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {migrationProgress.errors.map((error, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="font-semibold text-red-900">{error.name}</p>
                  <p className="text-sm text-red-700 mt-1">{error.error}</p>
                  <p className="text-xs text-red-600 mt-1">Product ID: {error.productId}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageMigrationPage;

