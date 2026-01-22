import { BATIAO_SYSTEM_PROMPT } from './aiPrompt'

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const API_URL = import.meta.env.VITE_DEEPSEEK_API_URL

/**
 * 向 AI 发送消息
 * @param {Array} history - 历史对话 [{ role, content }]
 * @param {String} userInput - 用户当前输入
 * @returns {Promise<String>} AI 回复文本
 */
export async function sendAiMessage(history = [], userInput) {
  if (!API_KEY) {
    throw new Error('未检测到 API Key')
  }

  const messages = [
    { role: 'system', content: BATIAO_SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: userInput }
  ]

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.9,
      top_p: 0.95
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI 请求失败：${errorText}`)
  }

  const data = await response.json()

  return data.choices?.[0]?.message?.content ?? ''
}
