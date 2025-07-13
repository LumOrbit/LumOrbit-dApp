import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { User, Settings, Shield, Globe, CircleHelp as HelpCircle, LogOut, ChevronRight, Bell, CreditCard, FileText, Smartphone } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

interface MenuItem {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  action: string;
  badge?: string;
  toggle?: boolean;
  value?: string;
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { profile, loading } = useUserProfile();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Format user initials for avatar
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format member since date
  const formatMemberSince = (dateString: string | null | undefined) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
                     onPress: async () => {
             try {
               await signOut();
             } catch {
               Alert.alert('Error', 'Failed to sign out. Please try again.');
             }
           }
        },
      ]
    );
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', action: 'personal-info' },
        { icon: Shield, label: 'Identity Verification', action: 'verification', badge: profile?.is_verified ? 'Verified' : 'Pending' },
        { icon: CreditCard, label: 'Payment Methods', action: 'payment-methods' },
        { icon: FileText, label: 'Documents', action: 'documents' },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: Smartphone, label: 'PIN Settings', action: 'pin-settings' },
        { icon: Shield, label: 'Two-Factor Authentication', action: '2fa' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', action: 'notifications', toggle: true },
        { icon: Globe, label: 'Language', action: 'language', value: 'English' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', action: 'help' },
        { icon: Settings, label: 'Contact Support', action: 'support' },
        { icon: FileText, label: 'Terms & Privacy', action: 'terms' },
      ]
    }
  ];

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    // Here you would typically trigger a language change in your app
  };

  const renderMenuItem = (item: MenuItem, index: number) => (
    <TouchableOpacity key={index} style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <item.icon size={20} color="#2563eb" />
        </View>
        <Text style={styles.menuLabel}>{item.label}</Text>
        {item.badge && (
          <View style={[styles.badge, !profile?.is_verified && { backgroundColor: '#f59e0b' }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.menuItemRight}>
        {item.toggle ? (
          <Switch
            value={item.action === 'notifications' ? notificationsEnabled : biometricsEnabled}
            onValueChange={(value) => {
              if (item.action === 'notifications') {
                setNotificationsEnabled(value);
              } else {
                setBiometricsEnabled(value);
              }
            }}
            trackColor={{ false: '#d1d5db', true: '#2563eb' }}
            thumbColor="#ffffff"
          />
        ) : (
          <>
            {item.value && (
              <Text style={styles.menuValue}>{item.value}</Text>
            )}
            <ChevronRight size={16} color="#6b7280" />
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getUserInitials(profile?.full_name)}
              </Text>
            </View>
            {profile?.is_verified && (
              <View style={styles.verificationBadge}>
                <Shield size={16} color="#ffffff" />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.full_name || 'User'}
            </Text>
            <Text style={styles.profileEmail}>
              {profile?.email || 'No email'}
            </Text>
            <View style={styles.profileMeta}>
              <Text style={styles.profileMetaText}>
                Member since {formatMemberSince(profile?.created_at)}
              </Text>
              <View style={styles.dot} />
              <Text style={[
                styles.profileMetaText, 
                { color: profile?.is_verified ? '#10b981' : '#f59e0b' }
              ]}>
                {profile?.is_verified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.languageSection}>
          <Text style={styles.sectionTitle}>Language / Idioma</Text>
          <View style={styles.languageOptions}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === lang.code && styles.selectedLanguageOption
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  selectedLanguage === lang.code && styles.selectedLanguageName
                ]}>
                  {lang.name}
                </Text>
                {selectedLanguage === lang.code && (
                  <View style={styles.selectedIndicator}>
                    <View style={styles.selectedDot} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => renderMenuItem(item, itemIndex))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>LumOrbit v1.0.0</Text>
          <Text style={styles.versionSubtext}>Powered by Stellar Network</Text>
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
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileMetaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: 8,
  },
  languageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  languageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageOption: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedLanguageOption: {
    borderColor: '#2563eb',
  },
  languageFlag: {
    fontSize: 24,
    marginBottom: 8,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  selectedLanguageName: {
    color: '#2563eb',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  badge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
  versionInfo: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  versionText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
});