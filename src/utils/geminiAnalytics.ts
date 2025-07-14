
const GEMINI_API_KEY = "AIzaSyBwOdkC1Ko_01gCvYzyDXieKrdGHbG7VWA";

interface SessionData {
  questions: string[];
  answers: string[];
  type: string;
  industry: string;
  level: string;
  duration: string;
}

interface AnalyticsResult {
  overallScore: number;
  questionScores: number[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: string;
  skillBreakdown: {
    communication: number;
    technical: number;
    problemSolving: number;
    confidence: number;
  };
}

export const analyzeInterviewWithGemini = async (sessionData: SessionData): Promise<AnalyticsResult> => {
  try {
    const prompt = `You are an expert interview analyst. Analyze this ${sessionData.type} interview for a ${sessionData.level} position in ${sessionData.industry}.

Interview Data:
${sessionData.questions.map((q, i) => `
Q${i + 1}: ${q}
A${i + 1}: ${sessionData.answers[i] || "No answer provided"}
`).join('\n')}

Provide a comprehensive analysis with:

1. Overall Performance Score (0-100)
2. Individual Question Scores (0-100 for each)
3. Top 3 Strengths
4. Top 3 Weaknesses  
5. 3 Specific Recommendations
6. Detailed Feedback (2-3 sentences)
7. Skill Breakdown (0-100):
   - Communication Skills
   - Technical Knowledge
   - Problem-Solving Ability
   - Confidence Level

Consider:
- Answer completeness and relevance
- Use of specific examples (STAR method)
- Technical accuracy for technical interviews
- Communication clarity
- Confidence indicators
- Industry-specific knowledge

Format your response as valid JSON:
{
  "overallScore": number,
  "questionScores": [numbers],
  "strengths": ["string1", "string2", "string3"],
  "weaknesses": ["string1", "string2", "string3"],
  "recommendations": ["string1", "string2", "string3"],
  "detailedFeedback": "string",
  "skillBreakdown": {
    "communication": number,
    "technical": number,
    "problemSolving": number,
    "confidence": number
  }
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate and sanitize the response
    return {
      overallScore: Math.max(0, Math.min(100, analysis.overallScore || 75)),
      questionScores: analysis.questionScores?.map((score: number) => Math.max(0, Math.min(100, score))) || 
                     sessionData.questions.map(() => Math.max(0, Math.min(100, analysis.overallScore || 75))),
      strengths: analysis.strengths?.slice(0, 3) || ["Clear communication", "Good examples", "Professional demeanor"],
      weaknesses: analysis.weaknesses?.slice(0, 3) || ["Need more specific examples", "Could improve structure", "Practice technical concepts"],
      recommendations: analysis.recommendations?.slice(0, 3) || ["Practice STAR method", "Research company more", "Mock interview sessions"],
      detailedFeedback: analysis.detailedFeedback || "Overall good performance with room for improvement in specific areas.",
      skillBreakdown: {
        communication: Math.max(0, Math.min(100, analysis.skillBreakdown?.communication || 75)),
        technical: Math.max(0, Math.min(100, analysis.skillBreakdown?.technical || 75)),
        problemSolving: Math.max(0, Math.min(100, analysis.skillBreakdown?.problemSolving || 75)),
        confidence: Math.max(0, Math.min(100, analysis.skillBreakdown?.confidence || 75))
      }
    };

  } catch (error) {
    console.error('Gemini analysis error:', error);
    
    // Fallback analysis
    const avgAnswerLength = sessionData.answers.reduce((sum, answer) => sum + (answer?.length || 0), 0) / sessionData.answers.length;
    const answerCompleteness = sessionData.answers.filter(answer => answer && answer.length > 50).length / sessionData.answers.length;
    
    const fallbackScore = Math.round(50 + (answerCompleteness * 30) + (Math.min(avgAnswerLength / 200, 1) * 20));
    
    return {
      overallScore: fallbackScore,
      questionScores: sessionData.questions.map(() => fallbackScore + (Math.random() * 20 - 10)),
      strengths: ["Completed the interview", "Provided responses", "Showed engagement"],
      weaknesses: ["Could provide more detailed answers", "Practice interview structure", "Expand on examples"],
      recommendations: ["Use STAR method for responses", "Practice with mock interviews", "Research company and role thoroughly"],
      detailedFeedback: "Good effort in completing the interview. Focus on providing more structured and detailed responses.",
      skillBreakdown: {
        communication: fallbackScore,
        technical: fallbackScore - 5,
        problemSolving: fallbackScore,
        confidence: fallbackScore - 10
      }
    };
  }
};
