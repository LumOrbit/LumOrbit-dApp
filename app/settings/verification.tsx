import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Shield, Upload, CheckCircle, Clock, XCircle, Camera, FileText, CreditCard } from 'lucide-react-native';
import { useUserProfile } from '@/hooks/useUserProfile';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  required: boolean;
  status: 'not_uploaded' | 'pending' | 'approved' | 'rejected';
}

export default function VerificationScreen() {
  const { profile, updateVerificationStatus, loading: profileLoading } = useUserProfile();
  const [uploading, setUploading] = useState<string | null>(null);

  const documentTypes: DocumentType[] = [
    {
      id: 'government_id',
      name: 'Government ID',
      description: 'Driver\'s license, passport, or national ID card',
      icon: CreditCard,
      required: true,
      status: profile?.is_verified ? 'approved' : 'not_uploaded',
    },
    {
      id: 'proof_of_address',
      name: 'Proof of Address',
      description: 'Utility bill, bank statement, or lease agreement (less than 3 months old)',
      icon: FileText,
      required: true,
      status: profile?.is_verified ? 'approved' : 'not_uploaded',
    },
    {
      id: 'selfie',
      name: 'Selfie Verification',
      description: 'Take a clear photo of yourself holding your ID',
      icon: Camera,
      required: true,
      status: profile?.is_verified ? 'approved' : 'not_uploaded',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} color="#10b981" />;
      case 'pending':
        return <Clock size={20} color="#f59e0b" />;
      case 'rejected':
        return <XCircle size={20} color="#ef4444" />;
      default:
        return <Upload size={20} color="#6b7280" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Upload Required';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleDocumentUpload = async (documentId: string) => {
    setUploading(documentId);
    
    // Simulate document upload process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Document Uploaded',
        'Your document has been uploaded successfully and is now under review. We\'ll notify you once it\'s been processed.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to upload document. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleCompleteVerification = async () => {
    Alert.alert(
      'Complete Verification',
      'This would typically submit all documents for review. For demo purposes, this will mark your account as verified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit for Review',
          onPress: async () => {
            try {
              await updateVerificationStatus(true);
              Alert.alert('Success', 'Your account has been verified!');
            } catch (error) {
              Alert.alert('Error', 'Failed to update verification status.');
            }
          }
        }
      ]
    );
  };

  const getVerificationProgress = () => {
    const completedDocs = documentTypes.filter(doc => doc.status === 'approved').length;
    return (completedDocs / documentTypes.length) * 100;
  };

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading verification status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.subtitle}>
            Verify your identity to unlock all features and increase your transfer limits
          </Text>
        </View>

        {/* Verification Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconContainer}>
              <Shield 
                size={24} 
                color={profile?.is_verified ? '#10b981' : '#f59e0b'} 
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>
                {profile?.is_verified ? 'Verified Account' : 'Verification Required'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {profile?.is_verified 
                  ? 'Your identity has been verified' 
                  : `${Math.round(getVerificationProgress())}% complete`
                }
              </Text>
            </View>
          </View>
          
          {!profile?.is_verified && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getVerificationProgress()}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Verification Benefits</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.benefitText}>Higher transfer limits ($10,000/month)</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.benefitText}>Faster transfer processing</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.benefitText}>Access to all supported countries</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.benefitText}>Priority customer support</Text>
            </View>
          </View>
        </View>

        {/* Document Requirements */}
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          
          {documentTypes.map((doc) => {
            const Icon = doc.icon;
            return (
              <View key={doc.id} style={styles.documentCard}>
                <View style={styles.documentHeader}>
                  <View style={styles.documentInfo}>
                    <View style={styles.documentIconContainer}>
                      <Icon size={20} color="#2563eb" />
                    </View>
                    <View style={styles.documentDetails}>
                      <Text style={styles.documentName}>{doc.name}</Text>
                      <Text style={styles.documentDescription}>{doc.description}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.documentStatus}>
                    {getStatusIcon(doc.status)}
                    <Text style={[
                      styles.statusText, 
                      { color: getStatusColor(doc.status) }
                    ]}>
                      {getStatusText(doc.status)}
                    </Text>
                  </View>
                </View>

                {doc.status === 'not_uploaded' && (
                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      uploading === doc.id && styles.disabledButton
                    ]}
                    onPress={() => handleDocumentUpload(doc.id)}
                    disabled={uploading === doc.id}
                  >
                    {uploading === doc.id ? (
                      <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                      <>
                        <Upload size={16} color="#2563eb" />
                        <Text style={styles.uploadButtonText}>Upload Document</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {doc.status === 'rejected' && (
                  <View style={styles.rejectionNotice}>
                    <Text style={styles.rejectionText}>
                      Document was rejected. Please upload a clearer image or different document.
                    </Text>
                    <TouchableOpacity
                      style={styles.reuploadButton}
                      onPress={() => handleDocumentUpload(doc.id)}
                    >
                      <Upload size={16} color="#ef4444" />
                      <Text style={styles.reuploadButtonText}>Re-upload</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Action Button */}
        {!profile?.is_verified && getVerificationProgress() === 100 && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteVerification}
          >
            <Shield size={20} color="#ffffff" />
            <Text style={styles.completeButtonText}>Complete Verification</Text>
          </TouchableOpacity>
        )}

        {/* Help Section */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            • Documents should be clear and all corners visible{'\n'}
            • Photos should be well-lit and in focus{'\n'}
            • Personal information must match your account details{'\n'}
            • Processing typically takes 1-2 business days
          </Text>
          
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  benefitsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
  },
  documentsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  documentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  documentInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 16,
  },
  documentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  documentStatus: {
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  disabledButton: {
    opacity: 0.6,
  },
  rejectionNotice: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectionText: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 8,
  },
  reuploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reuploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  helpCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
}); 