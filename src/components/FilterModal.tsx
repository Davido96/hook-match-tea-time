
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllStates, getCitiesByState } from "@/data/nigerianLocations";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    distance: number;
    ageRange: [number, number];
    gender: string;
    location: string;
    userType: string;
  };
  onApply: (filters: any) => void;
}

const FilterModal = ({ isOpen, onClose, filters, onApply }: FilterModalProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  const states = getAllStates();

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCity(""); // Reset city when state changes
    
    if (state === "all") {
      setLocalFilters({ ...localFilters, location: "" });
    } else {
      setLocalFilters({ ...localFilters, location: state });
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    
    if (city === "all") {
      setLocalFilters({ ...localFilters, location: selectedState });
    } else {
      setLocalFilters({ ...localFilters, location: `${city}, ${selectedState}` });
    }
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      distance: 50,
      ageRange: [18, 35] as [number, number],
      gender: 'both',
      location: '',
      userType: 'both'
    };
    setLocalFilters(defaultFilters);
    setSelectedState("");
    setSelectedCity("");
  };

  const availableCities = selectedState && selectedState !== "all" ? getCitiesByState(selectedState) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Preferences</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Distance */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Distance: {localFilters.distance} km
            </Label>
            <Slider
              value={[localFilters.distance]}
              onValueChange={(value) => setLocalFilters({ ...localFilters, distance: value[0] })}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Age Range */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Age Range: {localFilters.ageRange[0]} - {localFilters.ageRange[1]}
            </Label>
            <Slider
              value={localFilters.ageRange}
              onValueChange={(value) => setLocalFilters({ ...localFilters, ageRange: value as [number, number] })}
              max={60}
              min={18}
              step={1}
              className="w-full"
            />
          </div>

          {/* Gender */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Gender Preference</Label>
            <Select
              value={localFilters.gender}
              onValueChange={(value) => setLocalFilters({ ...localFilters, gender: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Everyone</SelectItem>
                <SelectItem value="male">Men</SelectItem>
                <SelectItem value="female">Women</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Type */}
          <div>
            <Label className="text-sm font-medium mb-2 block">User Type</Label>
            <Select
              value={localFilters.userType}
              onValueChange={(value) => setLocalFilters({ ...localFilters, userType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Everyone</SelectItem>
                <SelectItem value="creator">Creators</SelectItem>
                <SelectItem value="consumer">Members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location - State */}
          <div>
            <Label className="text-sm font-medium mb-2 block">State</Label>
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location - City */}
          {selectedState && selectedState !== "all" && (
            <div>
              <Label className="text-sm font-medium mb-2 block">City</Label>
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities in {selectedState}</SelectItem>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1 gradient-coral text-white">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
