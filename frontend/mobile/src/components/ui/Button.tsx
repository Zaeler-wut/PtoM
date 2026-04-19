import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#6C63FF'} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },

  // variants
  primary: {
    backgroundColor: '#6C63FF',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  secondary: {
    backgroundColor: '#22222C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#F87171',
    shadowColor: '#F87171',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },

  disabled: {
    opacity: 0.45,
  },

  // text
  text: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryText: { color: '#fff' },
  secondaryText: { color: '#F1F0F5' },
  ghostText: { color: '#A78BFA' },
  dangerText: { color: '#fff' },
})