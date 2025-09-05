import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Store,
  MapPin,
  Clock,
  Search,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Phone,
  Navigation as NavIcon
} from "lucide-react";
import { useTranslation } from "./translations";

interface PharmacyTrackerProps {
  language: string;
}

export function PharmacyTracker({ language }: PharmacyTrackerProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [isPharmacistView, setIsPharmacistView] = useState(false);

  const t = useTranslation(language);

  const pharmacies = [
    {
      id: 1,
      name: "Prem Medical Store",
      address: "Bhawra Bazar",
      distance: "0.5 km",
      phone: "+91 98765 43210",
      isOpen: true,
      lastUpdated: "2 mins ago",
      coordinates: { lat: 30.7333, lng: 76.7794 }
    },
    {
      id: 2,
      name: "Pardeep Medicos",
      address: "Patiala Gate",
      distance: "1.2 km",
      phone: "+91 98765 43211",
      isOpen: true,
      lastUpdated: "15 mins ago",
      coordinates: { lat: 30.7400, lng: 76.7800 }
    },
    {
      id: 3,
      name: "M/s Satkartar Medical Store",
      address: "MEHS gate, near BSNL exchange",
      distance: "2.1 km",
      phone: "+91 98765 43212",
      isOpen: false,
      lastUpdated: "1 hour ago",
      coordinates: { lat: 30.7200, lng: 76.7700 }
    }
  ];

  const medicines = [
    {
      id: 1,
      name: "Paracetamol",
      genericName: "Acetaminophen",
      strength: "500mg",
      form: "Tablet",
      manufacturer: "Cipla",
      price: "₹25",
      stocks: {
        1: { quantity: 150, status: "in_stock", lastUpdated: "2024-01-25 10:30" },
        2: { quantity: 25, status: "low_stock", lastUpdated: "2024-01-25 09:45" },
        3: { quantity: 0, status: "out_of_stock", lastUpdated: "2024-01-24 18:00" }
      }
    },
    {
      id: 2,
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      strength: "250mg",
      form: "Capsule",
      manufacturer: "Sun Pharma",
      price: "₹45",
      stocks: {
        1: { quantity: 80, status: "in_stock", lastUpdated: "2024-01-25 11:00" },
        2: { quantity: 5, status: "low_stock", lastUpdated: "2024-01-25 10:15" },
        3: { quantity: 20, status: "in_stock", lastUpdated: "2024-01-25 08:30" }
      }
    },
    {
      id: 3,
      name: "Amlodipine",
      genericName: "Amlodipine Besylate",
      strength: "5mg",
      form: "Tablet",
      manufacturer: "Ranbaxy",
      price: "₹35",
      stocks: {
        1: { quantity: 200, status: "in_stock", lastUpdated: "2024-01-25 12:00" },
        2: { quantity: 60, status: "in_stock", lastUpdated: "2024-01-25 11:30" },
        3: { quantity: 10, status: "low_stock", lastUpdated: "2024-01-25 07:45" }
      }
    },
    {
      id: 4,
      name: "Insulin Glargine",
      genericName: "Insulin Glargine",
      strength: "100IU/ml",
      form: "Injection",
      manufacturer: "Sanofi",
      price: "₹1250",
      stocks: {
        1: { quantity: 12, status: "low_stock", lastUpdated: "2024-01-25 09:00" },
        2: { quantity: 0, status: "out_of_stock", lastUpdated: "2024-01-24 16:00" },
        3: { quantity: 8, status: "low_stock", lastUpdated: "2024-01-25 10:00" }
      }
    }
  ];

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle className="w-4 h-4" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4" />;
      case 'out_of_stock':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return t.inStock;
      case 'low_stock':
        return t.lowStock;
      case 'out_of_stock':
        return t.outOfStock;
      default:
        return status;
    }
  };

  const updateStock = (medicineId: number, pharmacyId: number, newQuantity: number) => {
    console.log("Updating stock:", { medicineId, pharmacyId, newQuantity });
    // In real app, this would update the backend
  };

  const syncData = () => {
    console.log("Syncing pharmacy data...");
    setLastSyncTime(new Date());
  };

  const callPharmacy = (phone: string) => {
    console.log("Calling pharmacy:", phone);
  };

  const getDirections = (pharmacy: any) => {
    console.log("Getting directions to:", pharmacy.name);
  };

  // Pharmacist Stock Update Component
  const PharmacistStockUpdate = ({ medicine }: { medicine: any }) => {
    const [newQuantity, setNewQuantity] = useState(
      selectedPharmacy ? medicine.stocks[selectedPharmacy.id]?.quantity || 0 : 0
    );

    return (
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">{medicine.name}</h3>
              <p className="text-sm text-muted-foreground">
                {medicine.strength} • {medicine.form}
              </p>
            </div>
            <Badge className={getStatusColor(medicine.stocks[selectedPharmacy?.id]?.status || 'out_of_stock')}>
              {getStatusText(medicine.stocks[selectedPharmacy?.id]?.status || 'out_of_stock')}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Label>{t.quantity}:</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNewQuantity(Math.max(0, newQuantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                className="w-20 text-center border-2"
                min="0"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNewQuantity(newQuantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => updateStock(medicine.id, selectedPharmacy?.id, newQuantity)}
            className="w-full"
          >
            {t.updateStock}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl mb-2">{t.medicineAvailability}</h1>
            <p className="text-muted-foreground">{t.nearbyPharmacies}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Online/Offline Status */}
            <Badge variant={isOnline ? "secondary" : "destructive"} className="gap-2">
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>

            {/* Pharmacist Toggle */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">{t.pharmacistMode}</Label>
              <input
                type="checkbox"
                checked={isPharmacistView}
                onChange={(e) => setIsPharmacistView(e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            {/* Sync Button */}
            <Button onClick={syncData} variant="outline" size="lg">
              <RefreshCw className="w-5 h-5 mr-2" />
              Sync
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Pharmacy List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t.selectPharmacy}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pharmacies.map((pharmacy) => (
                  <Card
                    key={pharmacy.id}
                    className={`cursor-pointer transition-all hover:shadow-md border-2 ${selectedPharmacy?.id === pharmacy.id ? 'border-primary' : 'border-gray-200'
                      }`}
                    onClick={() => setSelectedPharmacy(pharmacy)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-primary" />
                          <h3 className="text-sm font-medium">{pharmacy.name}</h3>
                        </div>
                        <Badge variant={pharmacy.isOpen ? "secondary" : "outline"}>
                          {pharmacy.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{pharmacy.address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <NavIcon className="w-3 h-3" />
                          <span>{pharmacy.distance}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{t.lastUpdated}: {pharmacy.lastUpdated}</span>
                        </div>
                      </div>

                      <div className="flex gap-1 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            callPharmacy(pharmacy.phone);
                          }}
                          className="flex-1 text-xs"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            getDirections(pharmacy);
                          }}
                          className="flex-1 text-xs"
                        >
                          <NavIcon className="w-3 h-3 mr-1" />
                          Directions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Medicine Stock List */}
          <div className="lg:col-span-3">
            {selectedPharmacy ? (
              <div>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type="text"
                      placeholder={t.searchMedicine}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 border-2"
                    />
                  </div>
                </div>

                {/* Pharmacist vs Patient View */}
                {isPharmacistView ? (
                  <div>
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>Pharmacist Dashboard - {selectedPharmacy.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Update medicine stock quantities for your pharmacy
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                      {filteredMedicines.map((medicine) => (
                        <PharmacistStockUpdate key={medicine.id} medicine={medicine} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMedicines.map((medicine) => {
                      const stock = medicine.stocks[selectedPharmacy.id];

                      return (
                        <Card key={medicine.id} className="border-2">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-medium text-lg">{medicine.name}</h3>
                                <p className="text-muted-foreground">
                                  {medicine.genericName} • {medicine.strength} • {medicine.form}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  by {medicine.manufacturer}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-lg font-medium">{medicine.price}</p>
                                <Badge className={`gap-1 ${getStatusColor(stock?.status || 'out_of_stock')}`}>
                                  {getStatusIcon(stock?.status || 'out_of_stock')}
                                  {getStatusText(stock?.status || 'out_of_stock')}
                                </Badge>
                              </div>
                            </div>

                            {stock && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>{t.quantity}:</span>
                                  <span>{stock.quantity} units</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>{t.lastUpdated}:</span>
                                  <span>{new Date(stock.lastUpdated).toLocaleString()}</span>
                                </div>

                                {stock.status === 'in_stock' && (
                                  <Button
                                    size="sm"
                                    className="w-full mt-3"
                                    onClick={() => callPharmacy(selectedPharmacy.phone)}
                                  >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Reserve Medicine
                                  </Button>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg mb-2">{t.selectPharmacy}</h3>
                  <p className="text-muted-foreground">
                    Choose a pharmacy to view medicine availability
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Last Sync Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t.lastUpdated}: {lastSyncTime.toLocaleString()}
            {!isOnline && " (Offline data)"}
          </p>
        </div>
      </div>
    </div>
  );
}