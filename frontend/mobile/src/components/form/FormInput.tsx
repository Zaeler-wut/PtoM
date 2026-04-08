import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'

interface FormInputProps<T extends FieldValues> extends TextInputProps {
  name: Path<T>
  control: Control<T>
  label: string
  secureToggle?: boolean
  errorMessage?: string
}

export default function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  secureToggle = false,
  errorMessage,
  ...inputProps
}: FormInputProps<T>) {
  const [isSecure, setIsSecure] = useState(secureToggle)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.wrapper}>
          <Text style={styles.label}>{label.toUpperCase()}</Text>

          <View style={[styles.inputWrap, error && styles.inputError]}>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              secureTextEntry={isSecure}
              placeholderTextColor="#8B8A9B"
              autoCapitalize="none"
              {...inputProps}
            />

            {secureToggle && (
              <TouchableOpacity
                onPress={() => setIsSecure(prev => !prev)}
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={isSecure ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#8B8A9B"
                />
              </TouchableOpacity>
            )}
          </View>

          {(error?.message || errorMessage) && (
            <Text style={styles.errorText}>{error?.message ?? errorMessage}</Text>
          )}
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B8A9B',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#18181F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 36,
    paddingHorizontal: 20,
  },
  inputError: {
    borderColor: '#F87171',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#F1F0F5',
  },
  eyeBtn: {
    paddingLeft: 8,
  },
  eyeIcon: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 11,
    color: '#F87171',
    marginTop: 5,
    paddingLeft: 12,
  },
})