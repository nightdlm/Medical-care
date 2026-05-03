<script setup>
import { ref, computed } from 'vue'
import { createConsultation } from '../api'

const patientInput = ref('')
const loading = ref(false)
const result = ref(null)
const conversationId = ref('')

// 风险关键词列表（用于高亮显示）
const riskKeywords = ['胸痛', '呼吸困难', '意识障碍', '昏迷', '剧烈头痛', '大出血', '高热不退']

// 检查是否有风险标志
const hasRisk = computed(() => {
  if (!result.value || !result.value.riskFlags) return false
  const riskFlags = result.value.riskFlags
  return riskFlags !== '无' && riskKeywords.some(keyword => riskFlags.includes(keyword))
})

// 提交问诊
async function handleSubmit() {
  if (!patientInput.value.trim()) {
    alert('请输入您的症状描述')
    return
  }

  loading.value = true
  result.value = null

  try {
    const data = await createConsultation(patientInput.value, conversationId.value)
    result.value = data
    
    // 保存 conversationId 用于后续对话
    if (!conversationId.value) {
      conversationId.value = data.conversationId
    }
    
    // 清空输入框
    patientInput.value = ''
  } catch (error) {
    console.error('问诊失败:', error)
    alert('问诊失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 重新开始新对话
function handleReset() {
  conversationId.value = ''
  result.value = null
  patientInput.value = ''
}
</script>

<template>
  <div class="consultation-container">
    <header class="header">
      <h1>🏥 AI 预问诊助手</h1>
      <p class="subtitle">请描述您的症状，AI 将为您生成结构化病历</p>
    </header>

    <main class="main-content">
      <!-- 输入区域 -->
      <section class="input-section">
        <textarea
          v-model="patientInput"
          placeholder="例如：我头疼三天了，昨晚开始发烧，体温38.5度，伴有恶心..."
          :disabled="loading"
          rows="4"
        ></textarea>
        
        <div class="button-group">
          <button 
            @click="handleSubmit" 
            :disabled="loading || !patientInput.trim()"
            class="submit-btn"
          >
            {{ loading ? 'AI 分析中...' : '提交问诊' }}
          </button>
          
          <button 
            v-if="result"
            @click="handleReset"
            class="reset-btn"
          >
            新对话
          </button>
        </div>
      </section>

      <!-- 结果展示区域 -->
      <section v-if="result" class="result-section">
        <div class="result-card" :class="{ 'risk-card': hasRisk }">
          <div v-if="hasRisk" class="risk-warning">
            ⚠️ 风险提示：检测到高风险症状，建议尽快就医！
          </div>

          <h2 class="result-title">
            📋 结构化病历
            <span v-if="hasRisk" class="risk-badge">高风险</span>
          </h2>

          <div class="result-grid">
            <div class="result-item">
              <label>主诉</label>
              <div class="value">{{ result.chiefComplaint || '未提取' }}</div>
            </div>

            <div class="result-item">
              <label>现病史摘要</label>
              <div class="value">{{ result.presentIllness || '未提取' }}</div>
            </div>

            <div class="result-item">
              <label>症状持续时间</label>
              <div class="value">{{ result.symptomDuration || '未提取' }}</div>
            </div>

            <div class="result-item">
              <label>伴随症状</label>
              <div class="value">{{ result.accompanyingDymptoms || '无' }}</div>
            </div>

            <div class="result-item">
              <label>建议科室</label>
              <div class="value highlight">{{ result.suggestedDept || '未提取' }}</div>
            </div>

            <div class="result-item" :class="{ 'risk-item': hasRisk }">
              <label>风险标志</label>
              <div class="value" :class="{ 'risk-text': hasRisk }">
                {{ result.riskFlags || '无' }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 空状态提示 -->
      <section v-else-if="!loading" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>请在上方描述您的症状，AI 将自动为您生成结构化病历</p>
        <div class="example-tips">
          <p class="tips-title">示例输入：</p>
          <ul>
            <li>"我头疼三天了，昨晚开始发烧"</li>
            <li>"肚子疼，拉肚子，吃了不干净的东西"</li>
            <li>"咳嗽一周，有痰，胸口有点闷"</li>
          </ul>
        </div>
      </section>

      <!-- 加载状态 -->
      <section v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>AI 正在分析您的症状...</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.consultation-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.5em;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.1em;
  opacity: 0.9;
  margin: 0;
}

.main-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.input-section {
  margin-bottom: 30px;
}

textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

textarea:focus {
  outline: none;
  border-color: #667eea;
}

textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.submit-btn, .reset-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex: 1;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  background: #f0f0f0;
  color: #333;
}

.reset-btn:hover {
  background: #e0e0e0;
}

.result-section {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 25px;
  background: #fafafa;
  transition: all 0.3s;
}

.result-card.risk-card {
  border-color: #ff4757;
  background: #fff5f5;
  box-shadow: 0 0 20px rgba(255, 71, 87, 0.2);
}

.risk-warning {
  background: #ff4757;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.result-title {
  margin: 0 0 20px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.risk-badge {
  background: #ff4757;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7em;
  font-weight: 600;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.result-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.result-item.risk-item {
  border-left-color: #ff4757;
  background: #fff0f0;
}

.result-item label {
  display: block;
  font-size: 0.85em;
  color: #666;
  margin-bottom: 8px;
  font-weight: 600;
}

.result-item .value {
  font-size: 1em;
  color: #333;
  line-height: 1.6;
}

.result-item .value.highlight {
  color: #667eea;
  font-weight: 600;
}

.result-item .value.risk-text {
  color: #ff4757;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.example-tips {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.tips-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.example-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.example-tips li {
  padding: 8px 0;
  color: #666;
  font-size: 0.95em;
}

.example-tips li:before {
  content: "💡 ";
  margin-right: 5px;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
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

@media (max-width: 768px) {
  .consultation-container {
    padding: 10px;
  }
  
  .header h1 {
    font-size: 1.8em;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .result-grid {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>
