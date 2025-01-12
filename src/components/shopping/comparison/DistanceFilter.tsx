import { Slider } from "@/components/ui/slider";

interface DistanceFilterProps {
  maxDistance: number;
  onDistanceChange: (value: number) => void;
}

export const DistanceFilter = ({ maxDistance, onDistanceChange }: DistanceFilterProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        מרחק מקסימלי: {maxDistance} ק"מ
      </label>
      <Slider
        value={[maxDistance]}
        onValueChange={(value) => onDistanceChange(value[0])}
        min={1}
        max={50}
        step={1}
      />
    </div>
  );
};