import { useState } from "react";
import { LanguageSelector } from "./components/language-selector";
import { Navigation } from "./components/navigation";
import { HomeScreen } from "./components/home-screen";
import { DoctorConsultation } from "./components/doctor-consultation";
import { DoctorDashboard } from "./components/doctor-dashboard";
import { DoctorRecords } from "./components/doctor-records";
import { SymptomChecker } from "./components/symptom-checker";
import { EMRRecords } from "./components/emr-records";
import { MedicineTracker } from "./components/medicine-tracker";
import { PharmacyTracker } from "./components/pharmacy-tracker";
import { useTranslation } from "./components/translations";
import { Button } from "./components/ui/button";
import { Phone } from "lucide-react";

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState('hi');
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [isHealthWorkerMode, setIsHealthWorkerMode] = useState(false);
  
  const t = useTranslation(currentLanguage);

  const handleAuth = (authenticated: boolean, type?: 'patient' | 'doctor') => {
    setIsAuthenticated(authenticated);
    if (type) {
      setUserType(type);
      // Redirect to appropriate dashboard after login
      if (type === 'doctor') {
        setCurrentPage('doctor-dashboard');
      } else {
        setCurrentPage('home');
      }
    }
  };

  const renderCurrentPage = () => {
    if (!isAuthenticated && currentPage !== 'home') {
      setCurrentPage('home');
      return null;
    }

    switch (currentPage) {
      case 'home':
        return (
          <HomeScreen
            language={currentLanguage}
            isAuthenticated={isAuthenticated}
            onAuth={handleAuth}
            onPageChange={setCurrentPage}
          />
        );
      case 'doctor-dashboard':
        return userType === 'doctor' ? (
          <DoctorDashboard 
            language={currentLanguage} 
            onPageChange={setCurrentPage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl mb-4">Access Denied</h2>
              <p className="text-muted-foreground">Doctor access required</p>
            </div>
          </div>
        );
      case 'consultation':
        return userType === 'patient' ? <DoctorConsultation language={currentLanguage} /> : null;
      case 'symptoms':
        return userType === 'patient' ? <SymptomChecker language={currentLanguage} onPageChange={setCurrentPage} /> : null;
      case 'records':
        return userType === 'patient' ? <EMRRecords language={currentLanguage} /> : null;
      case 'doctor-records':
        return userType === 'doctor' ? <DoctorRecords language={currentLanguage} /> : null;
      case 'medicines':
        return <MedicineTracker language={currentLanguage} />;
      case 'pharmacy':
        return <PharmacyTracker language={currentLanguage} />;
      case 'notifications':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl mb-4">{t.notifications}</h2>
              <p className="text-muted-foreground">Notifications feature coming soon</p>
            </div>
          </div>
        );
      case 'health-worker':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl mb-4">{t.healthWorker}</h2>
              <p className="text-muted-foreground">Health worker mode coming soon</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 p-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo/Title */}
            <div className="hidden md:block">
              <h1 className="text-2xl text-primary">TeleMed</h1>
              <p className="text-sm text-muted-foreground">
                {userType === 'doctor' ? 'Doctor Portal' : 'Rural Healthcare Platform'}
              </p>
            </div>
            {/* Mobile logo */}
            <div className="md:hidden">
              <h1 className="text-xl text-primary">TeleMed</h1>
            </div>
          </div>
          
          {/* Header Right - With Emergency Button */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Emergency Button - Always visible */}
            <Button 
              size="sm"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 px-3 py-2 shadow-lg text-xs md:text-sm"
            >
              <Phone className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{t.emergency}</span>
              <span className="sm:hidden">SOS</span>
            </Button>

            {isAuthenticated && userType === 'patient' && (
              <div className="hidden md:flex items-center gap-2">
                <label className="text-sm">Health Worker Mode</label>
                <input
                  type="checkbox"
                  checked={isHealthWorkerMode}
                  onChange={(e) => setIsHealthWorkerMode(e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            )}

            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAuthenticated(false);
                    setUserType('patient');
                    setCurrentPage('home');
                  }}
                  className="text-xs"
                >
                  Logout
                </Button>
              </div>
            )}
            
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && (
          <Navigation
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            language={currentLanguage}
            isHealthWorkerMode={isHealthWorkerMode}
            userType={userType}
          />
        )}
        
        <main className="flex-1 overflow-auto">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}