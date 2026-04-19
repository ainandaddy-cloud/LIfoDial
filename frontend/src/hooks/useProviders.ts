import { useState, useEffect } from 'react'
import { fetchWithAuth } from '../api/client'

interface Model {
  id: string
  name: string
  description?: string
  input_token_limit?: number
  output_token_limit?: number
  tags?: string[]
  is_recommended?: boolean
  is_preview?: boolean
  is_flash?: boolean
  is_pro?: boolean
  label?: string
  recommended?: boolean
  voices?: any
}

interface Provider {
  id: string
  name: string
  flag: string
  connected: boolean
  models: Model[]
  best_for: string
}

interface ProvidersData {
  providers: {
    stt: Provider[]
    llm: Provider[]
    tts: Provider[]
  }
}

export function useProviders() {
  const [data, setData] = useState<ProvidersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  
  const load = async () => {
    try {
      setLoading(true)
      const result = await fetchWithAuth('/models/providers')
      setData(result)
    } catch (e) {
      setError('Failed to load providers')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => { load() }, [])
  
  const refresh = async () => {
    await fetchWithAuth('/models/gemini/refresh')
    await load()
  }
  
  return { data, loading, error, refresh }
}
