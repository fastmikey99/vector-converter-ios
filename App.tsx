import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  Share,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';

const {width, height} = Dimensions.get('window');

interface ImageData {
  uri: string;
  name: string;
  type: string;
  fileSize?: number;
}

interface ConvertedResult {
  svgContent: string;
  downloadUrl?: string;
  imageToken?: string;
}

const VectorConverterApp = () => {
  const [uploadedImage, setUploadedImage] = useState<ImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedResult, setConvertedResult] = useState<ConvertedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Railway API Configuration
  const API_CONFIG = {
    endpoint: 'https://zucchini-truth-production.up.railway.app/vectorize',
    debug: true,
  };

  const pickImage = () => {
    Alert.alert(
      'Select Image',
      'Choose from where you want to select an image',
      [
        {text: 'Camera', onPress: openCamera},
        {text: 'Gallery', onPress: openGallery},
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      response => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.uri && asset.fileName && asset.type) {
            setUploadedImage({
              uri: asset.uri,
              name: asset.fileName,
              type: asset.type,
              fileSize: asset.fileSize,
            });
            resetConversionState();
          }
        }
      },
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      response => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.uri && asset.fileName && asset.type) {
            setUploadedImage({
              uri: asset.uri,
              name: asset.fileName,
              type: asset.type,
              fileSize: asset.fileSize,
            });
            resetConversionState();
          }
        }
      },
    );
  };

  const convertToVector = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Prepare image for upload
      formData.append('image', {
        uri: uploadedImage.uri,
        type: uploadedImage.type,
        name: uploadedImage.name,
      } as any);

      // Add conversion settings
      formData.append('mode', 'production');
      formData.append('processing.max_colors', '16');
      formData.append('output.file_format', 'svg');
      formData.append('output.svg.version', '1.1');
      formData.append('output.svg.fixed_size', 'false');
      formData.append('output.svg.adobe_compatibility', 'false');
      formData.append('processing.shape_stacking', 'cutouts');
      formData.append('output.group_by', 'none');
      formData.append('output.draw_style', 'fill');
      formData.append('processing.curve_types.lines', 'true');
      formData.append('processing.curve_types.quadratic_bezier', 'true');
      formData.append('processing.curve_types.cubic_bezier', 'true');
      formData.append('processing.curve_types.circular_arcs', 'true');
      formData.append('processing.curve_types.elliptical_arcs', 'true');
      formData.append('processing.line_fit_tolerance', 'medium');
      formData.append('output.group_by_color', 'true');
      formData.append('output.illustrator_compatibility', 'true');
      formData.append('policy.retention_days', '7');

      console.log('Sending request to:', API_CONFIG.endpoint);

      const response = await fetch(API_CONFIG.endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        
        let errorMessage = 'Conversion failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || `Error ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      // Get headers for editor URL
      const imageToken = response.headers.get('X-Image-Token');
      const editorUrl = response.headers.get('X-Editor-URL');

      // Get SVG content
      const svgContent = await response.text();

      if (!svgContent || svgContent.indexOf('<svg') === -1) {
        throw new Error('Invalid SVG content returned');
      }

      setConvertedResult({
        svgContent,
        imageToken: imageToken || undefined,
      });

      console.log('Conversion successful');
    } catch (err: any) {
      console.error('Conversion failed:', err);
      setError(err.message || 'Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const shareResult = async () => {
    if (!convertedResult) return;

    try {
      await Share.share({
        message: 'Check out my vectorized artwork!',
        title: 'Vector Art',
        // In a real app, you'd save the SVG to a file and share that
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to share file');
    }
  };

  const resetApp = () => {
    setUploadedImage(null);
    setConvertedResult(null);
    setError(null);
    setIsProcessing(false);
  };

  const resetConversionState = () => {
    setConvertedResult(null);
    setError(null);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>VC</Text>
            </View>
          </View>
          <Text style={styles.title}>Vector Converter</Text>
          <Text style={styles.subtitle}>Transform artwork into scalable vectors</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          
          {/* Upload Section */}
          {!uploadedImage && (
            <View style={styles.card}>
              <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                <View style={styles.uploadContent}>
                  <Text style={styles.uploadIcon}>📁</Text>
                  <Text style={styles.uploadTitle}>Upload Artwork</Text>
                  <Text style={styles.uploadSubtitle}>
                    Tap to select from gallery or camera
                  </Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.supportedFormats}>
                Supports: JPG, PNG, GIF, BMP, WEBP
              </Text>
            </View>
          )}

          {/* Preview Section */}
          {uploadedImage && !convertedResult && !error && (
            <View style={styles.card}>
              <View style={styles.previewContainer}>
                <Image source={{uri: uploadedImage.uri}} style={styles.previewImage} />
              </View>
              <View style={styles.fileInfo}>
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{uploadedImage.name}</Text>
                  {uploadedImage.fileSize && (
                    <Text style={styles.fileSize}>{formatFileSize(uploadedImage.fileSize)}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={resetApp}>
                  <Text style={styles.changeButton}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Convert Button */}
          {uploadedImage && !convertedResult && !error && (
            <TouchableOpacity 
              style={[styles.convertButton, isProcessing && styles.convertButtonDisabled]}
              onPress={convertToVector}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.convertButtonIcon}>⚡</Text>
              )}
              <Text style={styles.convertButtonText}>
                {isProcessing ? 'Converting...' : 'Convert to Vector'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <View style={styles.card}>
              <View style={styles.processingContent}>
                <ActivityIndicator size="large" color="#ff9c40" />
                <Text style={styles.processingText}>Processing your image...</Text>
                <Text style={styles.processingSubtext}>This may take a few moments</Text>
              </View>
            </View>
          )}

          {/* Result Section */}
          {convertedResult && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Vector Result</Text>
              <View style={styles.resultContainer}>
                <View style={styles.svgPreview}>
                  <Text style={styles.svgIcon}>✨</Text>
                  <Text style={styles.svgPreviewText}>Vector Ready!</Text>
                </View>
              </View>
              <Text style={styles.resultCaption}>
                ✨ Your vector is ready • Scalable to any size
              </Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.downloadButton} onPress={shareResult}>
                  <Text style={styles.downloadButtonIcon}>📱</Text>
                  <Text style={styles.downloadButtonText}>Share SVG</Text>
                </TouchableOpacity>
                
                {convertedResult.imageToken && (
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => {
                      // Open editor URL in browser
                      Alert.alert('Edit Online', 'This would open the vectorizer.ai editor');
                    }}
                  >
                    <Text style={styles.editButtonIcon}>✏️</Text>
                    <Text style={styles.editButtonText}>Edit Online</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={styles.newImageButton} onPress={resetApp}>
                <Text style={styles.newImageButtonText}>Convert Another Image</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error Section */}
          {error && (
            <View style={styles.card}>
              <View style={styles.errorContent}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={convertToVector}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by advanced AI vectorization technology
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#ff9c40',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    maxWidth: 280,
  },
  mainContent: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#ff9c40',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#1a4d3e',
    minHeight: 200,
    justifyContent: 'center',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    maxWidth: 250,
  },
  supportedFormats: {
    textAlign: 'center',
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 12,
  },
  previewContainer: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 200,
    justifyContent: 'center',
  },
  previewImage: {
    width: width - 120,
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  fileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  fileSize: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 2,
  },
  changeButton: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  convertButton: {
    backgroundColor: '#ff9c40',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  convertButtonDisabled: {
    opacity: 0.7,
  },
  convertButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  convertButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  processingContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 200,
    justifyContent: 'center',
  },
  svgPreview: {
    alignItems: 'center',
  },
  svgIcon: {
    fontSize: 64,
  },
  svgPreviewText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 12,
  },
  resultCaption: {
    textAlign: 'center',
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 24,
  },
  actionButtons: {
    gap: 12,
  },
  downloadButton: {
    backgroundColor: '#ff9c40',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#ff9c40',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  editButtonText: {
    color: '#ff9c40',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newImageButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  newImageButtonText: {
    color: '#a1a1aa',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default VectorConverterApp;