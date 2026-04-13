import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'

function UploadBox({
  label,
  icon,
  images,
  onPick,
}: {
  label: string
  icon: 'flash-outline' | 'water-outline'
  images: string[]
  onPick: () => void
}) {
  return (
    <View style={styles.uploadSection}>
      <View style={styles.uploadHeader}>
        <Ionicons name={icon} size={18} color={icon === 'flash-outline' ? '#F59E0B' : '#3B82F6'} />
        <Text style={styles.uploadLabel}>{label}</Text>
      </View>

      {images.length > 0 ? (
        <View style={styles.previewRow}>
          {images.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.previewImage} resizeMode="cover" />
          ))}
          <TouchableOpacity style={styles.addMoreBtn} onPress={onPick}>
            <Ionicons name="add" size={24} color="#7C5CFC" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadBox} onPress={onPick} activeOpacity={0.8}>
          <Ionicons name="cloud-upload-outline" size={36} color="#C4B5FD" />
          <Text style={styles.uploadBoxHint}>JPG, PNG • เลือกได้หลายรูป</Text>
          <View style={styles.pickBtn}>
            <Ionicons name="images-outline" size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.pickBtnText}>เลือกรูปภาพ</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default function MeterUploadScreen() {
  const { propertyId, propertyName } = useLocalSearchParams<{
    propertyId: string
    propertyName: string
  }>()

  const [electricImages, setElectricImages] = useState<string[]>([])
  const [waterImages, setWaterImages] = useState<string[]>([])

  const pickImages = async (setter: (uris: string[]) => void, current: string[]) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('ไม่ได้รับอนุญาต', 'กรุณาอนุญาตการเข้าถึงรูปภาพ')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (!result.canceled) {
      setter([...current, ...result.assets.map((a) => a.uri)])
    }
  }

  const handleNext = () => {
    router.push({
      pathname: '/(app)/(tenant)/meter/readings' as any,
      params: { propertyId, propertyName },
    })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#1F1D2E" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>อัปโหลดรูปมิเตอร์</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{propertyName}</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* AI badge */}
        <View style={styles.aiBadge}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={16} color="#7C5CFC" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>AI อัตโนมัติ</Text>
            <Text style={styles.aiDesc}>
              แทนที่ผลจากภาพมิเตอร์ได้ เพื่อให้ AI อ่านมิเตอร์ให้อัตโนมัติ
              คุณสามารถตรวจสอบและแก้ไขได้ในขั้นตอนถัดไป
            </Text>
          </View>
        </View>

        <UploadBox
          label="มิเตอร์ไฟฟ้า"
          icon="flash-outline"
          images={electricImages}
          onPick={() => pickImages(setElectricImages, electricImages)}
        />

        <UploadBox
          label="มิเตอร์น้ำประปา"
          icon="water-outline"
          images={waterImages}
          onPick={() => pickImages(setWaterImages, waterImages)}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} activeOpacity={0.85} onPress={handleNext}>
          <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.nextBtnText}>กรอกมิเตอร์</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F3FF',
    backgroundColor: '#fff',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1F1D2E' },
  headerSub: { fontSize: 12, color: '#7C5CFC', marginTop: 1 },

  body: {
    padding: 16,
    paddingBottom: 32,
  },

  aiBadge: {
    flexDirection: 'row',
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    alignItems: 'flex-start',
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: { fontSize: 13, fontWeight: '700', color: '#1F1D2E', marginBottom: 3 },
  aiDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18 },

  uploadSection: { marginBottom: 20 },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: '#1F1D2E' },

  uploadBox: {
    borderWidth: 2,
    borderColor: '#DDD6FE',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#FAFAFF',
    gap: 8,
  },
  uploadBoxHint: { fontSize: 12, color: '#9CA3AF' },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  pickBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  addMoreBtn: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD6FE',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFF',
  },

  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F5F3FF',
    backgroundColor: '#fff',
  },
  nextBtn: {
    backgroundColor: '#7C5CFC',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
