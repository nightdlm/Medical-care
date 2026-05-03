<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHistory } from '../api'

const router = useRouter()
const records = ref([])
const loading = ref(false)
const expandedId = ref(null)

// 风险关键词列表
const riskKeywords = ['胸痛', '呼吸困难', '意识障碍', '昏迷', '剧烈头痛', '大出血', '高热不退']

// 检查是否有风险标志
function hasRisk(riskFlags) {
  if (!riskFlags || riskFlags === '无') return false
  return riskKeywords.some(keyword => riskFlags.includes(keyword))
}

// 格式化时间
function formatTime(dateTime) {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载历史记录
async function loadHistory() {
  loading.value = true
  try {
    records.value = await getHistory()
  } catch (error) {
    console.error('加载历史记录失败:', error)
    alert('加载历史记录失败')
  } finally {
    loading.value = false
  }
}

// 切换展开/收起
function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

// 返回问诊页面
function goBack() {
  router.push('/')
}

onMounted(() => {
  loadHistory()
})
</script>

<template>
  <div class="history-container">
    <header class="header">
      <button @click="goBack" class="back-btn">← 返回问诊</button>
      <h1>📋 历史问诊记录</h1>
    </header>

    <main class="main-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="records.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>暂无问诊记录</p>
        <button @click="goBack" class="start-btn">开始问诊</button>
      </div>

      <!-- 记录列表 -->
      <div v-else class="records-list">
        <div 
          v-for="record in records" 
          :key="record.id"
          class="record-card"
          :class="{ 'risk-card': hasRisk(record.riskFlags) }"
        >
          <div class="record-header" @click="toggleExpand(record.id)">
            <div class="record-info">
              <div class="record-time">{{ formatTime(record.createdAt) }}</div>
              <div class="record-preview">{{ record.patientInput }}</div>
            </div>
            <div class="record-actions">
              <span v-if="hasRisk(record.riskFlags)" class="risk-tag">高风险</span>
              <span class="expand-icon">{{ expandedId === record.id ? '▲' : '▼' }}</span>
            </div>
          </div>

          <div v-if="expandedId === record.id" class="record-detail">
            <div class="detail-grid">
              <div class="detail-item">
                <label>主诉</label>
                <div class="value">{{ record.chiefComplaint || '未提取' }}</div>
              </div>

              <div class="detail-item">
                <label>现病史摘要</label>
                <div class="value">{{ record.presentIllness || '未提取' }}</div>
              </div>

              <div class="detail-item">
                <label>症状持续时间</label>
                <div class="value">{{ record.symptomDuration || '未提取' }}</div>
              </div>

              <div class="detail-item">
                <label>伴随症状</label>
                <div class="value">{{ record.accompanyingDymptoms || '无' }}</div>
              </div>

              <div class="detail-item">
                <label>建议科室</label>
                <div class="value highlight">{{ record.suggestedDept || '未提取' }}</div>
              </div>

              <div class="detail-item" :class="{ 'risk-item': hasRisk(record.riskFlags) }">
                <label>风险标志</label>
                <div class="value" :class="{ 'risk-text': hasRisk(record.riskFlags) }">
                  {{ record.riskFlags || '无' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.history-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.back-btn {
  padding: 10px 20px;
  background: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  color: #667eea;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.header h1 {
  color: white;
  font-size: 2em;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.main-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  min-height: 500px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.start-btn {
  margin-top: 20px;
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.record-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  background: white;
}

.record-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.record-card.risk-card {
  border-color: #ff4757;
  background: #fff5f5;
}

.record-header {
  padding: 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  transition: background 0.3s;
}

.record-header:hover {
  background: #f8f9fa;
}

.record-info {
  flex: 1;
}

.record-time {
  font-size: 0.85em;
  color: #999;
  margin-bottom: 8px;
}

.record-preview {
  font-size: 1em;
  color: #333;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.record-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.risk-tag {
  background: #ff4757;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 600;
}

.expand-icon {
  color: #999;
  font-size: 0.8em;
}

.record-detail {
  border-top: 1px solid #e0e0e0;
  padding: 20px;
  background: #fafafa;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.detail-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.detail-item.risk-item {
  border-left-color: #ff4757;
  background: #fff0f0;
}

.detail-item label {
  display: block;
  font-size: 0.85em;
  color: #666;
  margin-bottom: 8px;
  font-weight: 600;
}

.detail-item .value {
  font-size: 0.95em;
  color: #333;
  line-height: 1.6;
}

.detail-item .value.highlight {
  color: #667eea;
  font-weight: 600;
}

.detail-item .value.risk-text {
  color: #ff4757;
  font-weight: 600;
}

@media (max-width: 768px) {
  .history-container {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header h1 {
    font-size: 1.5em;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .record-header {
    flex-direction: column;
  }
}
</style>
