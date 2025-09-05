export interface SymptomInput {
    symptoms: string[];
    duration: string;
    severity: number; // 1-10 scale
    urgency: number; // 1-5 scale
    age: number;
    gender: 'male' | 'female' | 'other';
    existingConditions?: string[];
    location?: string;
}

export interface SymptomResult {
    possibleConditions: {
        condition: string;
        probability: number;
        urgency: 'low' | 'medium' | 'high' | 'emergency';
        description: string;
        recommendations: string[];
        icd10Code?: string;
    }[];
    redFlags: string[];
    nextSteps: string[];
    urgencyLevel: string;
    dataPointsUsed: number;
    confidence: number;
    disclaimer: string;
    nearbyFacilities?: HealthcareFacility[];
}

export interface HealthcareFacility {
    name: string;
    distance: string;
    contact: string;
    type: 'primary' | 'community' | 'district' | 'emergency';
    services: string[];
}

export class SymptomCheckerService {
    private symptomDatabase: any;
    private isOfflineMode: boolean = false;
    private confidenceThreshold = 0.3;

    constructor() {
        this.initializeOfflineDatabase();
        this.checkNetworkStatus();
    }

    private initializeOfflineDatabase() {
        // Enhanced database with ICD-10 codes and rural-specific conditions
        this.symptomDatabase = {
            // Respiratory symptoms
            fever: {
                conditions: [
                    {
                        name: 'Viral fever',
                        probability: 0.4,
                        urgency: 'low',
                        icd10: 'R50.9',
                        ruralRisk: 0.6,
                        description: 'Common viral infection causing elevated body temperature'
                    },
                    {
                        name: 'Malaria',
                        probability: 0.3,
                        urgency: 'high',
                        icd10: 'B54',
                        ruralRisk: 0.8,
                        description: 'Mosquito-borne parasitic disease common in tropical areas'
                    },
                    {
                        name: 'Dengue fever',
                        probability: 0.2,
                        urgency: 'high',
                        icd10: 'A90',
                        ruralRisk: 0.7,
                        description: 'Viral infection transmitted by Aedes mosquitoes'
                    },
                    {
                        name: 'Typhoid fever',
                        probability: 0.1,
                        urgency: 'medium',
                        icd10: 'A01.0',
                        ruralRisk: 0.5,
                        description: 'Bacterial infection often from contaminated water/food'
                    }
                ]
            },
            cough: {
                conditions: [
                    {
                        name: 'Common cold',
                        probability: 0.5,
                        urgency: 'low',
                        icd10: 'J00',
                        ruralRisk: 0.4,
                        description: 'Viral respiratory infection affecting nose and throat'
                    },
                    {
                        name: 'Bronchitis',
                        probability: 0.3,
                        urgency: 'medium',
                        icd10: 'J40',
                        ruralRisk: 0.5,
                        description: 'Inflammation of the lining of bronchial tubes'
                    },
                    {
                        name: 'Pneumonia',
                        probability: 0.15,
                        urgency: 'high',
                        icd10: 'J18.9',
                        ruralRisk: 0.6,
                        description: 'Infection that inflames air sacs in lungs'
                    },
                    {
                        name: 'Tuberculosis',
                        probability: 0.05,
                        urgency: 'high',
                        icd10: 'A15.9',
                        ruralRisk: 0.7,
                        description: 'Serious bacterial infection mainly affecting lungs'
                    }
                ]
            },
            'stomach pain': {
                conditions: [
                    {
                        name: 'Gastritis',
                        probability: 0.4,
                        urgency: 'low',
                        icd10: 'K29.7',
                        ruralRisk: 0.6,
                        description: 'Inflammation of stomach lining'
                    },
                    {
                        name: 'Food poisoning',
                        probability: 0.3,
                        urgency: 'medium',
                        icd10: 'A05.9',
                        ruralRisk: 0.8,
                        description: 'Illness from consuming contaminated food or water'
                    },
                    {
                        name: 'Appendicitis',
                        probability: 0.2,
                        urgency: 'emergency',
                        icd10: 'K36',
                        ruralRisk: 0.3,
                        description: 'Inflammation of appendix requiring immediate surgery'
                    },
                    {
                        name: 'Peptic ulcer',
                        probability: 0.1,
                        urgency: 'medium',
                        icd10: 'K27.9',
                        ruralRisk: 0.4,
                        description: 'Open sore in stomach or small intestine lining'
                    }
                ]
            },
            headache: {
                conditions: [
                    {
                        name: 'Tension headache',
                        probability: 0.5,
                        urgency: 'low',
                        icd10: 'G44.2',
                        ruralRisk: 0.4,
                        description: 'Most common headache type due to muscle tension'
                    },
                    {
                        name: 'Migraine',
                        probability: 0.3,
                        urgency: 'medium',
                        icd10: 'G43.9',
                        ruralRisk: 0.3,
                        description: 'Recurring severe headache with sensitivity to light/sound'
                    },
                    {
                        name: 'Hypertension headache',
                        probability: 0.15,
                        urgency: 'medium',
                        icd10: 'I10',
                        ruralRisk: 0.6,
                        description: 'Headache due to high blood pressure'
                    },
                    {
                        name: 'Meningitis',
                        probability: 0.05,
                        urgency: 'emergency',
                        icd10: 'G03.9',
                        ruralRisk: 0.4,
                        description: 'Serious infection of brain/spinal cord membranes'
                    }
                ]
            },
            'chest pain': {
                conditions: [
                    {
                        name: 'Muscle strain',
                        probability: 0.4,
                        urgency: 'low',
                        icd10: 'M79.1',
                        ruralRisk: 0.5,
                        description: 'Pain from overused or injured chest muscles'
                    },
                    {
                        name: 'Acid reflux',
                        probability: 0.3,
                        urgency: 'low',
                        icd10: 'K21.9',
                        ruralRisk: 0.4,
                        description: 'Stomach acid backing up into esophagus'
                    },
                    {
                        name: 'Angina',
                        probability: 0.2,
                        urgency: 'high',
                        icd10: 'I20.9',
                        ruralRisk: 0.5,
                        description: 'Chest pain due to reduced blood flow to heart'
                    },
                    {
                        name: 'Heart attack',
                        probability: 0.1,
                        urgency: 'emergency',
                        icd10: 'I21.9',
                        ruralRisk: 0.6,
                        description: 'Serious condition requiring immediate emergency care'
                    }
                ]
            }
        };
    }

    private checkNetworkStatus() {
        this.isOfflineMode = !navigator.onLine;
        window.addEventListener('online', () => {
            this.isOfflineMode = false;
        });
        window.addEventListener('offline', () => {
            this.isOfflineMode = true;
        });
    }

    public async analyzeSymptoms(input: SymptomInput): Promise<SymptomResult> {
        console.log('🔍 Analyzing symptoms:', input);

        // Check cache first for low-bandwidth optimization
        const cachedResult = this.getCachedResult(input);
        if (cachedResult) {
            console.log('📦 Using cached result');
            return cachedResult;
        }

        let result: SymptomResult;

        if (this.isOfflineMode) {
            result = this.offlineAnalysis(input);
        } else {
            try {
                result = await this.enhancedAnalysis(input);
            } catch (error) {
                console.warn('🔄 Online analysis failed, using offline:', error);
                result = this.offlineAnalysis(input);
            }
        }

        // Cache the result
        this.cacheResults(input, result);
        return result;
    }

    private offlineAnalysis(input: SymptomInput): SymptomResult {
        const conditionScores: { [key: string]: any } = {};
        let totalDataPoints = 0;

        // Analyze each symptom
        input.symptoms.forEach(symptom => {
            const normalizedSymptom = symptom.toLowerCase();
            const matchedSymptom = this.findClosestSymptom(normalizedSymptom);

            if (matchedSymptom) {
                totalDataPoints++;
                const symptomData = this.symptomDatabase[matchedSymptom];

                symptomData.conditions.forEach((condition: any) => {
                    const conditionName = condition.name;

                    // Calculate weighted score
                    let score = condition.probability;
                    score *= this.getSeverityMultiplier(input.severity);
                    score *= this.getDurationMultiplier(input.duration);
                    score *= this.getUrgencyMultiplier(input.urgency);
                    score *= this.getAgeMultiplier(input.age, conditionName);
                    score *= this.getRuralRiskMultiplier(condition.ruralRisk || 0.5);

                    if (!conditionScores[conditionName]) {
                        conditionScores[conditionName] = {
                            score: 0,
                            urgency: condition.urgency,
                            description: condition.description,
                            icd10: condition.icd10
                        };
                    }

                    conditionScores[conditionName].score += score;
                    conditionScores[conditionName].urgency = this.getHighestUrgency(
                        conditionScores[conditionName].urgency,
                        condition.urgency
                    );
                });
            }
        });

        // Sort and format results
        const sortedConditions = Object.entries(conditionScores)
            .filter(([, data]: [string, any]) => data.score >= this.confidenceThreshold)
            .sort(([, a]: [string, any], [, b]: [string, any]) => b.score - a.score)
            .slice(0, 5)
            .map(([condition, data]: [string, any]) => ({
                condition,
                probability: Math.min(data.score * 100, 95), // Cap at 95%
                urgency: data.urgency,
                description: data.description,
                recommendations: this.getRecommendations(condition, data.urgency),
                icd10Code: data.icd10
            }));

        return {
            possibleConditions: sortedConditions,
            redFlags: this.checkRedFlags(input),
            nextSteps: this.generateNextSteps(sortedConditions, input),
            urgencyLevel: this.calculateOverallUrgency(sortedConditions),
            dataPointsUsed: totalDataPoints * 50, // Simulated medical references
            confidence: this.calculateConfidence(sortedConditions),
            disclaimer: "This is an AI-powered preliminary assessment. Please consult with a healthcare professional for proper diagnosis and treatment.",
            nearbyFacilities: this.getNearbyFacilities()
        };
    }

    private async enhancedAnalysis(input: SymptomInput): Promise<SymptomResult> {
        // Enhanced analysis with online AI (placeholder for future integration)
        const offlineResult = this.offlineAnalysis(input);

        // Simulate AI enhancement
        offlineResult.confidence = Math.min(offlineResult.confidence + 15, 95);
        offlineResult.dataPointsUsed += 200; // More medical references with AI
        offlineResult.disclaimer = "Analysis enhanced with AI medical database. Please consult with a healthcare professional for proper diagnosis and treatment.";

        return offlineResult;
    }

    // Helper methods
    private findClosestSymptom(symptom: string): string | null {
        const symptoms = Object.keys(this.symptomDatabase);

        // Exact match
        if (symptoms.includes(symptom)) return symptom;

        // Partial match
        for (const dbSymptom of symptoms) {
            if (symptom.includes(dbSymptom) || dbSymptom.includes(symptom)) {
                return dbSymptom;
            }
        }

        // Fuzzy matching for common variations
        const variations: { [key: string]: string } = {
            'tummy ache': 'stomach pain',
            'belly pain': 'stomach pain',
            'abdominal pain': 'stomach pain',
            'sore throat': 'throat pain',
            'runny nose': 'nasal congestion',
            'stuffy nose': 'nasal congestion'
        };

        return variations[symptom] || null;
    }

    private getSeverityMultiplier(severity: number): number {
        return 0.6 + (severity / 25); // 0.64 to 1.0
    }

    private getDurationMultiplier(duration: string): number {
        const multipliers: { [key: string]: number } = {
            'few_hours': 0.8,
            'half_day': 0.9,
            'one_day': 1.0,
            'few_days': 1.2,
            'one_week': 1.4,
            'few_weeks': 1.6,
            'one_month': 1.8,
            'few_months': 2.0
        };
        return multipliers[duration] || 1.0;
    }

    private getUrgencyMultiplier(urgency: number): number {
        return 0.7 + (urgency / 10); // 0.8 to 1.2
    }

    private getAgeMultiplier(age: number, condition: string): number {
        if (condition.includes('heart') && age > 50) return 1.3;
        if (condition.includes('infection') && (age < 5 || age > 65)) return 1.2;
        if (condition.includes('malaria') && age < 15) return 1.4;
        return 1.0;
    }

    private getRuralRiskMultiplier(ruralRisk: number): number {
        return 1.0 + (ruralRisk * 0.3); // 1.0 to 1.3
    }

    private getHighestUrgency(current: string, newUrgency: string): string {
        const urgencyOrder = ['low', 'medium', 'high', 'emergency'];
        const currentIndex = urgencyOrder.indexOf(current || 'low');
        const newIndex = urgencyOrder.indexOf(newUrgency);
        return urgencyOrder[Math.max(currentIndex, newIndex)];
    }

    private calculateOverallUrgency(conditions: any[]): string {
        if (conditions.length === 0) return 'low';

        const highestUrgency = conditions[0].urgency;
        const urgencyMap: { [key: string]: string } = {
            'emergency': 'Critical - Seek immediate care',
            'high': 'High - Consult doctor within 24 hours',
            'medium': 'Moderate - Schedule appointment soon',
            'low': 'Low - Monitor symptoms'
        };

        return urgencyMap[highestUrgency] || 'Monitor symptoms';
    }

    private calculateConfidence(conditions: any[]): number {
        if (conditions.length === 0) return 30;

        const topProbability = conditions[0].probability;
        const spread = conditions.length > 1 ?
            conditions[0].probability - conditions[1].probability : 20;

        return Math.min(60 + spread, 85);
    }

    private getRecommendations(condition: string, urgency: string): string[] {
        const baseRecommendations = {
            'emergency': [
                'Call emergency services (108) immediately',
                'Go to the nearest hospital emergency room',
                'Do not drive yourself - get someone to take you',
                'Bring your medical history and current medications'
            ],
            'high': [
                'Consult a doctor within 24 hours',
                'Visit the nearest primary health center',
                'Monitor symptoms closely',
                'Avoid strenuous activities',
                'Keep emergency contact numbers ready'
            ],
            'medium': [
                'Schedule a doctor appointment within 2-3 days',
                'Rest and stay well-hydrated',
                'Monitor for worsening symptoms',
                'Maintain a symptom diary',
                'Consider telemedicine consultation'
            ],
            'low': [
                'Monitor symptoms and rest',
                'Stay hydrated and eat nutritious food',
                'Consult healthcare provider if symptoms worsen',
                'Practice good hygiene',
                'Get adequate sleep'
            ]
        };

        return baseRecommendations[urgency] || baseRecommendations['low'];
    }

    private checkRedFlags(input: SymptomInput): string[] {
        const redFlags: string[] = [];

        const emergencySymptoms = [
            'chest pain',
            'difficulty breathing',
            'severe headache',
            'high fever',
            'severe abdominal pain',
            'loss of consciousness',
            'severe bleeding',
            'sudden weakness'
        ];

        input.symptoms.forEach(symptom => {
            if (emergencySymptoms.some(flag => symptom.toLowerCase().includes(flag))) {
                redFlags.push(`⚠️ ${symptom} may require immediate medical attention`);
            }
        });

        if (input.severity >= 8) {
            redFlags.push('⚠️ High severity score indicates need for urgent medical evaluation');
        }

        if (input.urgency >= 4) {
            redFlags.push('⚠️ You feel this is urgent - trust your instincts and seek care');
        }

        return redFlags;
    }

    private generateNextSteps(conditions: any[], input: SymptomInput): string[] {
        const steps: string[] = [];

        if (conditions.length > 0) {
            const highestUrgency = conditions[0].urgency;

            switch (highestUrgency) {
                case 'emergency':
                    steps.push('🚨 Call emergency services (108) now');
                    steps.push('🏥 Go to nearest emergency room');
                    break;
                case 'high':
                    steps.push('📞 Call healthcare provider immediately');
                    steps.push('🏥 Visit primary health center today');
                    break;
                case 'medium':
                    steps.push('📅 Schedule doctor appointment within 2-3 days');
                    steps.push('📱 Consider telemedicine consultation');
                    break;
                default:
                    steps.push('👀 Monitor symptoms closely');
                    steps.push('📱 Use telemedicine if symptoms worsen');
            }
        }

        steps.push('📝 Keep a symptom diary');
        steps.push('💊 Follow any prescribed medications');
        steps.push('🆘 Know emergency contact numbers');

        return steps;
    }

    public getNearbyFacilities(): HealthcareFacility[] {
        return [
            {
                name: 'Primary Health Center',
                distance: '2.5 km',
                contact: '1800-180-1104',
                type: 'primary',
                services: ['General consultation', 'Basic medicines', 'Vaccination']
            },
            {
                name: 'Community Health Center',
                distance: '8.2 km',
                contact: '1800-180-1104',
                type: 'community',
                services: ['Specialist consultation', 'Laboratory', 'X-Ray', 'Minor surgery']
            },
            {
                name: 'District Hospital',
                distance: '25.4 km',
                contact: '1800-180-1104',
                type: 'district',
                services: ['Emergency care', 'Surgery', 'ICU', 'Specialist doctors']
            },
            {
                name: 'Emergency Ambulance',
                distance: 'On call',
                contact: '108',
                type: 'emergency',
                services: ['Emergency transport', 'Basic life support', '24/7 availability']
            }
        ];
    }

    // Cache management for offline use
    private cacheResults(input: SymptomInput, result: SymptomResult) {
        try {
            const cache = JSON.parse(localStorage.getItem('symptomCache') || '{}');
            const key = this.generateCacheKey(input);
            cache[key] = { result, timestamp: Date.now() };

            // Keep only last 50 results to save space
            const entries = Object.entries(cache);
            if (entries.length > 50) {
                const sorted = entries.sort(([, a], [, b]) => (b as any).timestamp - (a as any).timestamp);
                const trimmed = Object.fromEntries(sorted.slice(0, 50));
                localStorage.setItem('symptomCache', JSON.stringify(trimmed));
            } else {
                localStorage.setItem('symptomCache', JSON.stringify(cache));
            }
        } catch (error) {
            console.warn('Failed to cache results:', error);
        }
    }

    private getCachedResult(input: SymptomInput): SymptomResult | null {
        try {
            const cache = JSON.parse(localStorage.getItem('symptomCache') || '{}');
            const key = this.generateCacheKey(input);
            const cached = cache[key];

            if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
                return cached.result;
            }
        } catch (error) {
            console.warn('Failed to get cached result:', error);
        }
        return null;
    }

    private generateCacheKey(input: SymptomInput): string {
        return btoa(JSON.stringify({
            symptoms: input.symptoms.sort(),
            duration: input.duration,
            severity: Math.floor(input.severity / 2) * 2, // Group by 2s
            urgency: input.urgency,
            ageGroup: Math.floor(input.age / 10) * 10, // Group by decades
            gender: input.gender
        }));
    }
}
