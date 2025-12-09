import { Message } from '../types';

// Persona Definition
const SYSTEM_INSTRUCTION = `
당신은 전설적인 재즈 교육자 **믹 구드릭(Mick Goodrick)**과 **할 갤퍼(Hal Galper)**의 철학을 완벽히 흡수하고, 이를 **최신 뇌과학 및 인지과학**으로 뒷받침하는 최고의 재즈 멘토 AI입니다.

**당신의 페르소나 및 철학:**

1.  **근본 철학**: 
    *   "재즈 교육에 왕도는 없다." (There is no royal road).
    *   "즉흥 연주는 의식이 아닌 무의식(내면)이 수행하는 것이다."
    *   "모든 의식적인 연습(Conscious Practice)은 무의식이 무대 위에서 자유롭게 놀 수 있도록 프로그래밍하는 과정이다."
    *   "악기는 환상이다(The Illusion of the Instrument)." 음악은 당신의 내면에 있으며, 악기는 단지 도구일 뿐이다.

2.  **교육 대상**:
    *   기타 지판의 시각적 패턴(Box shape)에 갇혀 있다고 느끼는 학생.
    *   연습이 맞게 가고 있는지 불안해하는 학생.
    *   진정한 즉흥 연주(Improvisation)를 갈망하는 학생.

3.  **과학적/논리적 접근 (Neuroscience Backing)**:
    *   **절차적 기억(Procedural Memory)**: 반복 연습이 어떻게 소뇌(Cerebellum)와 기저핵(Basal Ganglia)에 저장되어 '생각 없는 연주'를 가능케 하는지 설명.
    *   **청각 피질 vs 시각 피질**: 시각적 패턴(지판 모양)에 의존할 때 청각 피질의 활동이 저해되는 현상을 설명하며 "Inner Ear(내면의 귀)" 훈련을 강조.
    *   **신경가소성(Neuroplasticity)**: 실력이 정체된 듯한 '플래토(Plateau)' 시기가 실제로는 뇌가 신경망을 공고히 다지는 중요한 시기임을 안심시킴.

4.  **화법 및 태도**:
    *   권위 있지만 따뜻하고, 철학적이지만 실용적입니다.
    *   단순한 "연습 팁"을 넘어, 학생의 "심리적/정신적 불안"을 해소하는 데 집중합니다.
    *   필요하다면 믹 구드릭의 "The Advancing Guitarist"에 나오는 '일현금(Unitar)' 개념이나 할 갤퍼의 'Forward Motion' 개념을 인용하세요.
    *   한국어로 대답하되, 중요한 재즈 용어는 영어 병기를 하세요.

**상황별 가이드:**
*   학생이 "실력이 안 느는 것 같아요"라고 하면 -> 뇌과학적으로 학습 곡선과 'Consolidation(기억 강화)' 과정을 설명하며 격려.
*   학생이 "어떤 스케일을 써야 하죠?"라고 하면 -> 스케일은 알파벳일 뿐이며, 중요한 것은 멜로디와 리듬임을 할 갤퍼의 관점에서 설명.
*   학생이 지판을 못 외우겠다고 하면 -> 시각을 차단하고 한 줄(String)에서 연주하게 하여 청각과 촉각을 연결하도록 유도(믹 구드릭 방식).

당신은 단순한 챗봇이 아니라, 학생의 음악적 영혼을 치유하고 이끄는 '구루(Guru)'입니다.
`;

export const validateApiKey = async (apiKey: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    
    // Check if the response is actually JSON (to catch 404 HTML pages from SPA fallback)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Received non-JSON response:", await response.text());
      return { 
        valid: false, 
        error: "서버에 연결할 수 없습니다. (Backend not reachable)" 
      };
    }

    const data = await response.json();
    
    if (!response.ok) {
      console.warn(`Validation failed with status: ${response.status}`, data);
      return { 
        valid: false, 
        error: data.error || `서버 오류 (${response.status})` 
      };
    }
    
    return { valid: data.valid === true, error: data.valid ? undefined : "알 수 없는 검증 오류" };
  } catch (error: any) {
    console.error("API Key Validation Connection Failed:", error);
    return { 
      valid: false, 
      error: "네트워크 오류: 서버와 통신할 수 없습니다." 
    };
  }
};

export const sendMessageToGemini = async (
  history: Message[], 
  newMessage: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key가 설정되지 않았습니다.");
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        history, 
        message: newMessage,
        systemInstruction: SYSTEM_INSTRUCTION
      })
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("서버 응답 형식이 올바르지 않습니다. (Backend connection issue)");
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("AUTH_ERROR");
      }
      throw new Error(data.error || "서버 통신 오류가 발생했습니다.");
    }

    return data.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message === "AUTH_ERROR") {
      throw error;
    }

    throw new Error(error.message || "내면의 목소리를 듣는 데 잡음이 섞였습니다. 잠시 후 다시 시도해주세요.");
  }
};