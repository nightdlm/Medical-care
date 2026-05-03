-- 创建数据库
CREATE DATABASE IF NOT EXISTS medical_care DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE medical_care;

-- 问诊记录表
CREATE TABLE IF NOT EXISTS consultation_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    conversation_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    patient_input TEXT NOT NULL COMMENT '患者输入原文',
    structured_result TEXT COMMENT 'AI结构化结果JSON',
    chief_complaint VARCHAR(500) COMMENT '主诉',
    present_illness TEXT COMMENT '现病史摘要',
    symptom_duration VARCHAR(200) COMMENT '症状持续时间',
    accompanying_dymptoms VARCHAR(500) COMMENT '伴随症状',
    suggested_dept VARCHAR(100) COMMENT '建议科室',
    risk_flags VARCHAR(500) COMMENT '风险标志',
    belong_tenant VARCHAR(64) COMMENT '租户ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_tenant (belong_tenant),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问诊记录表';