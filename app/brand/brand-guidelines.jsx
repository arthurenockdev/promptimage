import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

function BrandGuidelines({ onGuidelinesChange }) {
  // State for all brand guideline values
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');
  const [accentColor, setAccentColor] = useState('#FF0000');
  const [guidelines, setGuidelines] = useState('');
  const [primaryFont, setPrimaryFont] = useState('');
  const [secondaryFont, setSecondaryFont] = useState('');
  const [applyToAll, setApplyToAll] = useState(false);
  const [additionalColors, setAdditionalColors] = useState([]);
  const [notification, setNotification] = useState(null);

  // Load saved guidelines from localStorage on mount
  useEffect(() => {
    const savedGuidelines = localStorage.getItem('brandGuidelines');
    if (savedGuidelines) {
      const parsed = JSON.parse(savedGuidelines);
      setPrimaryColor(parsed.primaryColor || '#000000');
      setSecondaryColor(parsed.secondaryColor || '#FFFFFF');
      setAccentColor(parsed.accentColor || '#FF0000');
      setGuidelines(parsed.guidelines || '');
      setPrimaryFont(parsed.primaryFont || '');
      setSecondaryFont(parsed.secondaryFont || '');
      setAdditionalColors(parsed.additionalColors || []);
      setApplyToAll(parsed.applyToAll || false);
    }
  }, []);

  // Update parent component when guidelines change
  useEffect(() => {
    if (applyToAll) {
      const guidelinesData = {
        primaryColor,
        secondaryColor,
        accentColor,
        additionalColors,
        guidelines,
        primaryFont,
        secondaryFont,
        applyToAll
      };
      onGuidelinesChange(guidelinesData);
      localStorage.setItem('brandGuidelines', JSON.stringify(guidelinesData));
    } else {
      onGuidelinesChange(null);
      localStorage.removeItem('brandGuidelines');
    }
  }, [
    applyToAll,
    primaryColor,
    secondaryColor,
    accentColor,
    additionalColors,
    guidelines,
    primaryFont,
    secondaryFont,
    onGuidelinesChange
  ]);

  // Show notification for 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const addAdditionalColor = () => {
    if (additionalColors.length >= 5) {
      setNotification({
        type: 'warning',
        message: 'Maximum of 5 additional colors allowed'
      });
      return;
    }
    setAdditionalColors([...additionalColors, '#000000']);
  };

  const removeAdditionalColor = (index) => {
    setAdditionalColors(additionalColors.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const guidelinesData = {
      primaryColor,
      secondaryColor,
      accentColor,
      additionalColors,
      guidelines,
      primaryFont,
      secondaryFont,
      applyToAll
    };

    localStorage.setItem('brandGuidelines', JSON.stringify(guidelinesData));
    setNotification({
      type: 'success',
      message: 'Brand guidelines saved successfully'
    });
  };

  // Preview style based on selected colors
  const previewStyle = {
    backgroundColor: secondaryColor,
    color: primaryColor,
    borderColor: accentColor,
    fontFamily: primaryFont || 'inherit',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '2px solid',
    marginTop: '1rem'
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      {notification && (
        <Alert variant={notification.type === 'warning' ? 'destructive' : 'default'}>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-12 p-1 rounded"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-grow"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="secondary-color"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-12 h-12 p-1 rounded"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-grow"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="accent-color">Accent Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="accent-color"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-12 h-12 p-1 rounded"
              />
              <Input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="flex-grow"
              />
            </div>
          </div>

          {additionalColors.map((color, index) => (
            <div key={index}>
              <Label htmlFor={`additional-color-${index}`}>Additional Color {index + 1}</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id={`additional-color-${index}`}
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const newColors = [...additionalColors];
                    newColors[index] = e.target.value;
                    setAdditionalColors(newColors);
                  }}
                  className="w-12 h-12 p-1 rounded"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    const newColors = [...additionalColors];
                    newColors[index] = e.target.value;
                    setAdditionalColors(newColors);
                  }}
                  className="flex-grow"
                />
                <Button variant="outline" size="icon" onClick={() => removeAdditionalColor(index)}>
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addAdditionalColor}>
            <Plus className="mr-2 h-4 w-4" /> Add Color
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Fonts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="primary-font">Primary Font</Label>
            <Select value={primaryFont} onValueChange={setPrimaryFont}>
              <SelectTrigger id="primary-font">
                <SelectValue placeholder="Select primary font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="secondary-font">Secondary Font</Label>
            <Select value={secondaryFont} onValueChange={setSecondaryFont}>
              <SelectTrigger id="secondary-font">
                <SelectValue placeholder="Select secondary font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="guidelines">Guidelines</Label>
            <Textarea
              id="guidelines"
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
              placeholder="Enter brand guidelines"
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="apply-to-all" checked={applyToAll} onCheckedChange={setApplyToAll} />
            <Label htmlFor="apply-to-all">Apply to all</Label>
          </div>

          <Button onClick={handleSave}>Save Brand Guidelines</Button>

          <div style={previewStyle}>
            <p>Preview with selected colors and font styles.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Default props for BrandGuidelines
BrandGuidelines.defaultProps = {
  onGuidelinesChange: () => {},
};

// Example parent component
function ParentComponent() {
  const handleGuidelinesChange = (guidelines) => {
    if (guidelines) {
      console.log('Brand guidelines updated:', guidelines);
    } else {
      console.log('Brand guidelines removed.');
    }
  };

  return <BrandGuidelines onGuidelinesChange={handleGuidelinesChange} />;
}

export default ParentComponent;
