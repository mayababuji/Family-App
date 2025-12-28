
import { GoogleGenAI, Type } from "@google/genai";
import { Chore, FamilyMember, KingdomReport, Grievance, TravelTarget } from './types';

export const generateKingdomReport = async (
  chores: Chore[],
  members: FamilyMember[],
  grievances: Grievance[] = [],
  travelTargets: TravelTarget[] = []
): Promise<KingdomReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const choreSummary = chores.map(c => {
    const assigned = members.find(m => m.id === c.assignedToId)?.name || 'Unclaimed';
    return `- ${c.title} (${c.points} pts) [${assigned}]: ${c.status}`;
  }).join('\n');

  const travelSummary = travelTargets.length > 0
    ? travelTargets.map(t => `- ${t.location}: ${t.status}`).join('\n')
    : "No expeditions planned yet.";

  const grievanceSummary = grievances.length > 0 
    ? grievances.map(g => `- From ${members.find(m => m.id === g.fromId)?.name} regarding ${g.againstId ? members.find(m => m.id === g.againstId)?.name : 'General'}: [${g.severity}] ${g.title} - "${g.content}"`).join('\n')
    : "No grievances reported! The kingdom is in a state of pure harmony.";

  const prompt = `
    You are the 'Oracle of the Family Vibe' in the RPG realm of 'Vaiga World'.
    Analyze the kingdom's emotional and productivity state based on this data:
    
    HERO PRODUCTIVITY (Chores):
    ${choreSummary}
    
    EXPEDITIONS (Travel Targets):
    ${travelSummary}

    HERO RANKINGS:
    ${members.map(m => `${m.name}: ${m.points} pts`).join(', ')}

    COUNCIL WHISPERS (Grievances/Conflicts):
    ${grievanceSummary}

    Write a 'Family Vibe Report'. Focus heavily on emotional intelligence, social dynamics, and well-being.
    
    Return a JSON object:
    1. summary: A fun, fantasy-themed summary of the vibe.
    2. heroOfTheWeek: Name of the person showing the best spirit (not just points).
    3. efficiencyScore: Percentage of chores completed (0-100).
    4. encouragingNudge: A gentle, wise RPG-themed tip for better family connection.
    5. royalMediation: If grievances exist, provide a fair, kind, and funny resolution.
    6. emotionalClimate: One of: 'SUNNY' (Great vibe), 'BREEZY' (Good), 'OVERCAST' (Stale), 'STORMY' (High conflict), 'STARRY' (Magical/Perfect).
    7. socialInsight: A 1-sentence observation about how the family is getting along socially.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            heroOfTheWeek: { type: Type.STRING },
            efficiencyScore: { type: Type.NUMBER },
            encouragingNudge: { type: Type.STRING },
            royalMediation: { type: Type.STRING },
            emotionalClimate: { type: Type.STRING, enum: ['SUNNY', 'BREEZY', 'OVERCAST', 'STORMY', 'STARRY'] },
            socialInsight: { type: Type.STRING },
          },
          required: ["summary", "heroOfTheWeek", "efficiencyScore", "encouragingNudge", "emotionalClimate", "socialInsight"],
        },
      },
    });

    return JSON.parse(response.text || '{}') as KingdomReport;
  } catch (error) {
    console.error("AI Vibe Report failed", error);
    return {
      summary: "The Oracle is currently meditating. The vibe remains a mystery of the ages.",
      heroOfTheWeek: "Everyone",
      efficiencyScore: 50,
      encouragingNudge: "Speak kindly and act bravely.",
      emotionalClimate: 'BREEZY',
      socialInsight: "The family seems to be in a quiet transition."
    };
  }
};
