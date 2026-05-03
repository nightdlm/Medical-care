import axios from 'axios'

const api = axios.create({
  baseURL: '/api/medical',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token-tenant-001' // 硬编码的 token，模拟租户 001
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// 创建问诊记录
export function createConsultation(patientInput, conversationId = '') {
  return api.post('/consult', {
    patientInput,
    conversationId
  })
}

// 获取历史记录
export function getHistory() {
  return api.get('/history')
}

export default api
