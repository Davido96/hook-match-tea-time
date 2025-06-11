
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    distance: number;
    ageRange: [number, number];
    gender: string;
    location: string;
  };
  onApply: (filters: any) => void;
}

const FilterModal = ({ isOpen, onClose, filters, onApply }: FilterModalProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      distance: 50,
      ageRange: [18, 35] as [number, number],
      gender: 'both',
      location: ''
    };
    setLocalFilters(defaultFilters);
  };

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

          {/* Location */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Location</Label>
            <Input
              placeholder="Enter city or state"
              value={localFilters.location}
              onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
            />
          </div>

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
