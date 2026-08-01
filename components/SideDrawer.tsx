import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/format';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function SideDrawer({ visible, onClose }: SideDrawerProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNavigate = (path: string) => {
    onClose();
    setTimeout(() => {
      router.push(path as any);
    }, 150);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    router.replace('/login');
  };

  if (!visible) return null;

  const menuGroups = [
    {
      title: 'MAIN NAVIGATION',
      items: [
        { label: 'Dashboard', icon: 'grid-outline', route: '/(tabs)' },
        { label: 'Asset Catalog', icon: 'cube-outline', route: '/(tabs)/assets' },
        { label: 'Scan Tag / QR', icon: 'qr-code-outline', route: '/(tabs)/scan' },
        { label: 'Activity Logs', icon: 'time-outline', route: '/(tabs)/activity' },
      ],
    },
    {
      title: 'INVENTORY MANAGEMENT',
      items: [
        { label: 'Register New Asset', icon: 'add-circle-outline', route: '/register-asset' },
        { label: 'Check-outs & Returns', icon: 'swap-horizontal-outline', route: '/checkouts' },
        { label: 'Categories', icon: 'folder-open-outline', route: '/categories' },
        { label: 'Archived Assets', icon: 'archive-outline', route: '/archived-assets' },
      ],
    },
    {
      title: 'ACCOUNT & SYSTEM',
      items: [
        { label: 'Notifications', icon: 'notifications-outline', route: '/notifications' },
        { label: 'My Profile', icon: 'person-outline', route: '/profile' },
        { label: 'Settings', icon: 'settings-outline', route: '/settings' },
      ],
    },
  ];

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          {/* Top Brand Logo Banner */}
          <View style={styles.brandBanner}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* User Profile Card */}
          <View style={styles.header}>
            <View style={styles.userCardRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || 'Asset Manager'}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email || 'user@example.com'}
                </Text>
                <View style={styles.roleBadge}>
                  <View style={styles.roleDot} />
                  <Text style={styles.roleText}>{user?.role || 'Manager'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Menu Items List */}
          <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
            {menuGroups.map((group) => (
              <View key={group.title} style={styles.groupContainer}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => handleNavigate(item.route)}
                  >
                    <View style={styles.menuItemLeft}>
                      <Ionicons name={item.icon as any} size={20} color="#800020" style={styles.menuIcon} />
                      <Text style={styles.menuItemText}>{item.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#800020" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.versionText}>Royalty World AssetTracker v1.0.0</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    elevation: 24,
    shadowColor: '#800020',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  brandBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fde6e6',
  },
  logoImage: {
    height: 36,
    width: 150,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#fde6e6',
  },
  userCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#800020',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fde6e6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#800020',
    marginRight: 5,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#800020',
    textTransform: 'capitalize',
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  groupContainer: {
    marginBottom: 18,
  },
  groupTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fde6e6',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  logoutText: {
    color: '#800020',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  versionText: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
