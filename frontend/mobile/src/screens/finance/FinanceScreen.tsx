import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import BillTab from './BillTab'
import BookingTab from './BookingTab'
import ContractTab from './ContractTab'

type Tab = 'bill' | 'booking' | 'contract'

const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'bill',     label: 'บิล',      icon: 'cash-outline' },
  { key: 'booking',  label: 'การจอง',   icon: 'calendar-outline' },
  { key: 'contract', label: 'สัญญา',    icon: 'document-text-outline' },
]

export default function FinanceScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('bill')

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#2C2C2A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>ข้อมูลและการเงิน</Text>
      </View>

      {/* Tab Bar */}
      <View style={s.tabWrap}>
        <View style={s.tabContainer}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key
            return (
              <TouchableOpacity
                key={tab.key}
                style={[s.tabBtn, isActive && s.tabBtnActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab.icon}
                  size={15}
                  color={isActive ? '#fff' : '#7C5CFC'}
                  style={{ marginRight: 5 }}
                />
                <Text style={[s.tabText, isActive && s.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Content */}
      <View style={s.content}>
        {activeTab === 'bill'     && <BillTab />}
        {activeTab === 'booking'  && <BookingTab />}
        {activeTab === 'contract' && <ContractTab />}
      </View>

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F7' },

  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  backBtn: {
    width: 34, height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C2C2A',
  },

  tabWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDE9FE',
    borderRadius: 14,
    padding: 5,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#7C5CFC',
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7C5CFC',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  content: { flex: 1 },
})