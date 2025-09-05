import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import {
  Search, AlertTriangle, Clock, User, Activity,
  Phone, MapPin, Wifi, WifiOff, Brain,
  Heart, Thermometer, Stethoscope, Mic, MicOff,
  Volume2, PlayCircle, StopCircle, RotateCcw
} from "lucide-react";
import { useTranslation } from "./translations";
import { SymptomCheckerService, SymptomInput, SymptomResult } from "../services/symptom-checker-service";

interface SymptomCheckerProps {
  language: string;
}

export function SymptomChecker({ language }: SymptomCheckerProps) {
  const t = useTranslation(language);

  // AI Service
  const [service] = useState(() => new SymptomCheckerService());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SymptomResult | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Form state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState(5);
  const [urgencyLevel, setUrgencyLevel] = useState(1);
  const [patientAge, setPatientAge] = useState("25");
  const [patientGender, setPatientGender] = useState("other");
  const [showResults, setShowResults] = useState(false);

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  // Common symptoms for quick selection
  const commonSymptoms = [
    t.fever || 'Fever',
    t.headache || 'Headache',
    t.cough || 'Cough',
    t.stomachPain || 'Stomach pain',
    t.nausea || 'Nausea',
    t.dizziness || 'Dizziness',
    t.fatigue || 'Fatigue',
    t.chestPain || 'Chest pain',
    t.backPain || 'Back pain',
    t.jointPain || 'Joint pain',
    t.soreThroat || 'Sore throat',
    t.runnyNose || 'Runny nose',
    t.difficultyBreathing || 'Difficulty breathing',
    t.diarrhea || 'Diarrhea',
    t.vomiting || 'Vomiting',
    t.skinRash || 'Skin rash',
    t.eyeProblems || 'Eye problems',
    t.earPain || 'Ear pain'
  ];

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : 'en-IN';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceInput(transcript);
        setCustomSymptom(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [language]);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const addSymptom = (symptom: string) => {
    if (symptom.trim() && !selectedSymptoms.includes(symptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, symptom.trim()]);
      setCustomSymptom("");
      setVoiceInput("");
    }
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  const handleAnalysis = async () => {
    if (selectedSymptoms.length === 0) {
      alert(t.pleaseSelectSymptoms || 'Please select at least one symptom');
      return;
    }

    if (!duration || !patientAge) {
      alert(t.pleaseCompleteForm || 'Please complete all required fields');
      return;
    }

    setIsAnalyzing(true);
    setShowResults(true);

    const input: SymptomInput = {
      symptoms: selectedSymptoms,
      duration: duration,
      severity: severity,
      urgency: urgencyLevel,
      age: parseInt(patientAge) || 25,
      gender: patientGender as 'male' | 'female' | 'other'
    };

    try {
      const result = await service.analyzeSymptoms(input);
      setResults(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert(t.analysisError || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setSelectedSymptoms([]);
    setCustomSymptom("");
    setDuration("");
    setSeverity(5);
    setUrgencyLevel(1);
    setPatientAge("25");
    setPatientGender("other");
    setShowResults(false);
    setResults(null);
    setVoiceInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t.aiSymptomChecker || 'AI Symptom Checker'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {t.poweredByAI || 'Powered by Medical AI Database'}
              </p>
            </div>
            {isOffline ? (
              <Badge variant="secondary" className="ml-4">
                <WifiOff className="h-4 w-4 mr-1" />
                {t.offlineMode || 'Offline Mode'}
              </Badge>
            ) : (
              <Badge variant="default" className="ml-4">
                <Wifi className="h-4 w-4 mr-1" />
                {t.aiEnhanced || 'AI Enhanced'}
              </Badge>
            )}
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.symptomCheckerDescription || 'Get preliminary health insights based on your symptoms. Our AI analyzes medical data to provide guidance for rural and low-bandwidth areas.'}
          </p>
        </div>

        {!showResults && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
              <CardTitle className="flex items-center text-xl">
                <Stethoscope className="h-6 w-6 mr-2" />
                {t.describeSymptoms || 'Describe Your Symptoms'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Symptom Input Section */}
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold text-gray-700 mb-3 block">
                    {t.selectOrDescribeSymptoms || 'Select or describe your symptoms'}
                  </Label>

                  {/* Voice Input Section */}
                  {recognition && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Volume2 className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-700">
                            {t.voiceInput || 'Voice Input'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={isListening ? "destructive" : "default"}
                          onClick={isListening ? stopListening : startListening}
                          className="flex items-center gap-2"
                        >
                          {isListening ? (
                            <>
                              <MicOff className="h-4 w-4" />
                              {t.stopListening || 'Stop'}
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4" />
                              {t.startListening || 'Speak'}
                            </>
                          )}
                        </Button>
                      </div>

                      {isListening && (
                        <div className="flex items-center justify-center py-4">
                          <div className="flex items-center text-blue-600">
                            <div className="animate-pulse flex space-x-1">
                              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
                              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="ml-2">{t.listening || 'Listening...'}</span>
                          </div>
                        </div>
                      )}

                      {voiceInput && (
                        <div className="bg-white border rounded-lg p-3 mb-2">
                          <p className="text-sm text-gray-600 mb-1">{t.youSaid || 'You said:'}:</p>
                          <p className="font-medium">"{voiceInput}"</p>
                        </div>
                      )}

                      <details className="text-sm text-blue-600">
                        <summary className="cursor-pointer font-medium">
                          {language === 'hi' ? 'आवाज़ इनपुट का उपयोग करने के लिए:' :
                            language === 'pa' ? 'ਆਵਾਜ਼ ਇਨਪੁਟ ਦੀ ਵਰਤੋਂ ਕਰਨ ਲਈ:' :
                              'To use voice input:'}
                        </summary>
                        <div className="mt-2 text-xs whitespace-pre-line">
                          {language === 'hi' ?
                            '• ब्राउज़र में माइक्रोफोन की अनुमति दें\n• स्पष्ट रूप से बोलें\n• शांत वातावरण में उपयोग करें' :
                            language === 'pa' ?
                              '• ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਮਾਈਕਰੋਫੋਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ\n• ਸਪਸ਼ਟ ਰੂਪ ਵਿੱਚ ਬੋਲੋ\n• ਸ਼ਾੰਤ ਮਾਹੌਲ ਵਿੱਚ ਵਰਤੋ' :
                              '• Allow microphone access in browser\n• Speak clearly\n• Use in quiet environment'
                          }
                        </div>
                      </details>
                    </div>
                  )}

                  {/* Manual Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder={t.typeSymptom || 'Type your symptom (e.g., headache, fever)'}
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSymptom(customSymptom)}
                      className="flex-1"
                    />
                    <Button onClick={() => addSymptom(customSymptom)}>
                      {t.add || 'Add'}
                    </Button>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    💡 {t.selectOrDescribeHelp || 'Select symptoms above or describe them in detail below'}
                  </p>
                </div>

                {/* Common Symptoms Grid */}
                <div>
                  <Label className="font-medium text-gray-700 mb-3 block">
                    {t.commonSymptoms || 'Common Symptoms (click to select):'}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {commonSymptoms.map((symptom, index) => (
                      <Button
                        key={index}
                        variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                        size="sm"
                        onClick={() => selectedSymptoms.includes(symptom) ? removeSymptom(symptom) : addSymptom(symptom)}
                        className={`text-left justify-start h-auto py-2 px-3 ${selectedSymptoms.includes(symptom)
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-blue-50'
                          }`}
                      >
                        {symptom}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Selected Symptoms */}
                {selectedSymptoms.length > 0 && (
                  <div>
                    <Label className="font-medium text-gray-700 mb-2 block">
                      {t.selectedSymptoms || 'Selected Symptoms:'} ({selectedSymptoms.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map((symptom, index) => (
                        <Badge key={index} variant="default" className="text-sm py-1 px-3">
                          {symptom}
                          <button
                            onClick={() => removeSymptom(symptom)}
                            className="ml-2 text-blue-200 hover:text-white"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Duration Selection */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-700">
                  {t.symptomDuration || 'Select the duration of your symptoms'}
                </Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectDuration || "How long have you had these symptoms?"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="few_hours">{t.fewHours || 'Few hours'}</SelectItem>
                    <SelectItem value="half_day">{t.halfDay || 'Half day'}</SelectItem>
                    <SelectItem value="one_day">{t.oneDay || '1 day'}</SelectItem>
                    <SelectItem value="few_days">{t.fewDays || '2-3 days'}</SelectItem>
                    <SelectItem value="one_week">{t.oneWeek || '1 week'}</SelectItem>
                    <SelectItem value="few_weeks">{t.fewWeeks || '2-3 weeks'}</SelectItem>
                    <SelectItem value="one_month">{t.oneMonth || '1 month'}</SelectItem>
                    <SelectItem value="few_months">{t.fewMonths || 'Few months'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Severity Slider */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-700">
                  {t.symptomSeverity || 'Rate the severity of your symptoms'}
                </Label>
                <div className="px-4">
                  <Slider
                    value={[severity]}
                    onValueChange={(value) => setSeverity(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>{t.mild || '1 - Mild'}</span>
                    <span className="font-bold text-lg text-blue-600">{severity}</span>
                    <span>{t.severe || '10 - Severe'}</span>
                  </div>
                </div>
              </div>

              {/* Urgency Level */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-700">
                  {t.urgencyQuestion || 'How urgent do you feel your condition is?'}
                </Label>
                <div className="px-4">
                  <Slider
                    value={[urgencyLevel]}
                    onValueChange={(value) => setUrgencyLevel(value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>{t.notUrgent || 'Not urgent'}</span>
                    <span className="font-bold text-lg text-green-600">{urgencyLevel}</span>
                    <span>{t.veryUrgent || 'Very urgent'}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium text-gray-700">
                    {t.age || 'Age'}
                  </Label>
                  <Input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder={t.enterAge || 'Enter your age'}
                    min="1"
                    max="120"
                  />
                </div>
                <div>
                  <Label className="font-medium text-gray-700">
                    {t.gender || 'Gender'}
                  </Label>
                  <Select value={patientGender} onValueChange={setPatientGender}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t.male || 'Male'}</SelectItem>
                      <SelectItem value="female">{t.female || 'Female'}</SelectItem>
                      <SelectItem value="other">{t.other || 'Other'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={resetForm}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t.resetForm || 'Reset Form'}
                </Button>
                <Button
                  onClick={handleAnalysis}
                  disabled={selectedSymptoms.length === 0 || !duration || isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t.analyzing || 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      {t.analyzeSymptoms || 'Analyze Symptoms'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {showResults && (
          <Card className="mt-6 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="h-6 w-6 mr-2 text-blue-600" />
                  {t.analysisResults || 'Analysis Results'}
                </span>
                {isOffline ? (
                  <Badge variant="secondary">
                    <WifiOff className="h-4 w-4 mr-1" />
                    {t.offlineMode || 'Offline Mode'}
                  </Badge>
                ) : (
                  <Badge variant="default">
                    <Wifi className="h-4 w-4 mr-1" />
                    {t.aiEnhanced || 'AI Enhanced'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="text-center py-12">
                  <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                  </div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    {t.aiProcessingSymptoms || 'AI is analyzing your symptoms...'}
                  </p>
                  <p className="text-gray-500">
                    {t.mayTakeFewMoments || 'This may take a few moments'}
                  </p>
                </div>
              ) : results ? (
                <div className="space-y-6">
                  {/* Data Confidence Indicator */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Brain className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-semibold text-blue-700">
                          {t.basedOnMedicalDatabase || 'Based on medical database:'} {results.dataPointsUsed} {t.medicalReferences || 'medical references'}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        {results.confidence}% {t.confidence || 'confidence'}
                      </Badge>
                    </div>
                    <p className="text-blue-600 mb-2">{t.basedOnAnalysis || 'Based on your symptom analysis:'}</p>
                    <p className="font-bold text-blue-800 text-lg">
                      {t.urgencyLevel || 'Urgency Level'}: {results.urgencyLevel}
                    </p>
                  </div>

                  {/* Red Flags - Emergency Warnings */}
                  {results.redFlags && results.redFlags.length > 0 && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                        <h3 className="text-xl font-bold text-red-600">
                          {t.immediateAttention || 'Immediate Attention Required'}
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {results.redFlags.map((flag, index) => (
                          <div key={index} className="flex items-start">
                            <span className="text-red-500 mr-2 mt-1">⚠️</span>
                            <span className="text-red-700 font-medium">{flag}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 p-4 bg-red-600 rounded-lg">
                        <p className="text-white font-bold text-center text-lg">
                          🚨 {t.callEmergencyNow || 'Call emergency services (108) now!'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Possible Conditions */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Stethoscope className="h-6 w-6 mr-2 text-green-600" />
                      {t.possibleConditions || 'Possible Conditions'}
                    </h3>
                    <div className="space-y-4">
                      {results.possibleConditions.map((condition, index) => (
                        <div key={index} className="border-2 rounded-lg p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-lg text-gray-800">{condition.condition}</h4>
                            <div className="flex items-center gap-3">
                              <Badge className={`text-white font-medium ${condition.urgency === 'emergency' ? 'bg-red-600' :
                                  condition.urgency === 'high' ? 'bg-orange-500' :
                                    condition.urgency === 'medium' ? 'bg-yellow-500' :
                                      'bg-green-500'
                                }`}>
                                {condition.urgency.toUpperCase()}
                              </Badge>
                              <span className="font-bold text-lg text-blue-600">
                                {Math.round(condition.probability)}% {t.match || 'match'}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3 leading-relaxed">{condition.description}</p>
                          {condition.icd10Code && (
                            <p className="text-sm text-gray-500 mb-3 font-mono">
                              {t.medicalCode || 'Medical Code'}: {condition.icd10Code}
                            </p>
                          )}
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">{t.recommendations || 'Recommendations'}:</h5>
                            <ul className="space-y-1">
                              {condition.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start text-gray-600">
                                  <span className="text-blue-500 mr-2 mt-1">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Clock className="h-6 w-6 mr-2 text-orange-600" />
                      {t.nextSteps || 'Recommended Next Steps'}
                    </h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                      <div className="space-y-3">
                        {results.nextSteps.map((step, index) => (
                          <div key={index} className="flex items-start">
                            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-green-800 font-medium">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Nearby Healthcare Facilities */}
                  {results.nearbyFacilities && results.nearbyFacilities.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <MapPin className="h-6 w-6 mr-2 text-purple-600" />
                        {t.nearbyHealthcare || 'Nearby Healthcare Facilities'}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {results.nearbyFacilities.map((facility, index) => (
                          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-lg">{facility.name}</h4>
                              <Badge variant="outline" className="capitalize">
                                {facility.type}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <p className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {t.distance || 'Distance'}: {facility.distance}
                              </p>
                              <p className="flex items-center">
                                <Phone className="h-4 w-4 mr-2" />
                                {facility.contact}
                              </p>
                              <div>
                                <p className="font-medium text-gray-700 mb-1">{t.services || 'Services'}:</p>
                                <div className="flex flex-wrap gap-1">
                                  {facility.services.map((service, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {service}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-5">
                    <div className="flex items-start">
                      <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-yellow-800 mb-2">
                          {t.disclaimer || 'Medical Disclaimer'}
                        </h4>
                        <p className="text-yellow-700 text-sm leading-relaxed">
                          {results.disclaimer}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-center gap-4 pt-6 border-t">
                    <Button variant="outline" onClick={() => {
                      setShowResults(false);
                      setResults(null);
                    }}>
                      <Search className="h-4 w-4 mr-2" />
                      {t.checkNewSymptoms || 'Check New Symptoms'}
                    </Button>
                    <Button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700">
                      <Heart className="h-4 w-4 mr-2" />
                      {t.saveResults || 'Save Results'}
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t.startOver || 'Start Over'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
