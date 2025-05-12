import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, CreditCard, DollarSign, PiggyBank } from "lucide-react";

// Step interface for onboarding flow
interface OnboardingStep {
  title: string;
  description: string;
  component: React.ReactNode;
}

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false, false]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // User preferences state
  const [debtStrategy, setDebtStrategy] = useState("avalanche");
  const [roundupAmount, setRoundupAmount] = useState([5]);
  const [roundupFrequency, setRoundupFrequency] = useState("daily");
  const [bankAccount, setBankAccount] = useState("");

  const markStepComplete = (step: number) => {
    const newCompleted = [...completed];
    newCompleted[step] = true;
    setCompleted(newCompleted);
  };

  const handleNext = () => {
    markStepComplete(currentStep);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    setIsLoading(true);
    
    // Save user preferences
    const userPreferences = {
      debtStrategy,
      roundupAmount: roundupAmount[0],
      roundupFrequency,
      bankAccount
    };
    
    localStorage.setItem("userPreferences", JSON.stringify(userPreferences));
    
    // Mock successful completion
    setTimeout(() => {
      toast({
        title: "Setup complete!",
        description: "Your account is ready to start paying down debt.",
      });
      navigate("/dashboard");
      setIsLoading(false);
    }, 1500);
  };

  // Define steps for the onboarding flow
  const steps: OnboardingStep[] = [
    {
      title: "Debt Repayment Strategy",
      description: "Choose how you want to tackle your debt",
      component: (
        <RadioGroup value={debtStrategy} onValueChange={setDebtStrategy} className="space-y-4">
          <div className="flex items-start space-x-3 rounded-lg border p-4 hover:border-primary/50 transition cursor-pointer">
            <RadioGroupItem value="avalanche" id="avalanche" className="mt-1" />
            <div>
              <Label htmlFor="avalanche" className="text-base font-medium">Avalanche Method</Label>
              <p className="text-sm text-gray-500">Pay off high-interest debt first to save more money over time</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 rounded-lg border p-4 hover:border-primary/50 transition cursor-pointer">
            <RadioGroupItem value="snowball" id="snowball" className="mt-1" />
            <div>
              <Label htmlFor="snowball" className="text-base font-medium">Snowball Method</Label>
              <p className="text-sm text-gray-500">Pay off smaller debts first to build momentum and motivation</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 rounded-lg border p-4 hover:border-primary/50 transition cursor-pointer">
            <RadioGroupItem value="hybrid" id="hybrid" className="mt-1" />
            <div>
              <Label htmlFor="hybrid" className="text-base font-medium">Hybrid Method</Label>
              <p className="text-sm text-gray-500">Smart balance of both methods based on your specific debt profile</p>
            </div>
          </div>
        </RadioGroup>
      )
    },
    {
      title: "Round-Up Amount",
      description: "Choose how much to round up your transactions",
      component: (
        <div className="space-y-8">
          <div>
            <div className="flex justify-between mb-2">
              <Label>Round up to nearest:</Label>
              <span className="font-medium">${roundupAmount[0]}.00</span>
            </div>
            <Slider
              value={roundupAmount}
              onValueChange={setRoundupAmount}
              min={1}
              max={10}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$1</span>
              <span>$5</span>
              <span>$10</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label>Example:</Label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm">Coffee purchase: <span className="font-medium">$3.75</span></p>
              <p className="text-sm">Round up to: <span className="font-medium">${3.75 + (roundupAmount[0] - (3.75 % roundupAmount[0])).toFixed(2)}</span></p>
              <p className="text-sm text-primary font-medium">Amount to debt: ${(roundupAmount[0] - (3.75 % roundupAmount[0])).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Round-Up Frequency",
      description: "Choose how often to apply your round-ups to debt",
      component: (
        <RadioGroup value={roundupFrequency} onValueChange={setRoundupFrequency} className="space-y-4">
          <div className="flex items-start space-x-3 rounded-lg border p-4 hover:border-primary/50 transition cursor-pointer">
            <RadioGroupItem value="daily" id="daily" className="mt-1" />
            <div>
              <Label htmlFor="daily" className="text-base font-medium">Daily</Label>
              <p className="text-sm text-gray-500">Apply round-ups to your debt every day</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 rounded-lg border p-4 hover:border-primary/50 transition cursor-pointer">
            <RadioGroupItem value="weekly" id="weekly" className="mt-1" />
            <div>
              <Label htmlFor="weekly" className="text-base font-medium">Weekly</Label>
              <p className="text-sm text-gray-500">Apply round-ups to your debt once a week</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 rounded-lg border p-4 hover:border-primary/50 transition cursor-pointer">
            <RadioGroupItem value="monthly" id="monthly" className="mt-1" />
            <div>
              <Label htmlFor="monthly" className="text-base font-medium">Monthly</Label>
              <p className="text-sm text-gray-500">Apply round-ups to your debt once a month</p>
            </div>
          </div>
        </RadioGroup>
      )
    },
    {
      title: "Connect Your Bank Account",
      description: "Choose your bank to track purchases and apply round-ups",
      component: (
        <div className="space-y-6">
          <Select value={bankAccount} onValueChange={setBankAccount}>
            <SelectTrigger>
              <SelectValue placeholder="Select your bank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="capital_one">Capital One</SelectItem>
              <SelectItem value="chase">Chase</SelectItem>
              <SelectItem value="bank_of_america">Bank of America</SelectItem>
              <SelectItem value="wells_fargo">Wells Fargo</SelectItem>
              <SelectItem value="citi">Citibank</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 font-medium">Featured Partners</div>
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="font-medium">Capital One</p>
                  <p className="text-sm text-gray-500">Direct integration available</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <PiggyBank size={20} />
                </div>
                <div>
                  <p className="font-medium">Chase</p>
                  <p className="text-sm text-gray-500">Direct integration available</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            By connecting your bank account, you authorize MicroRepay to access your transaction data to calculate round-ups. We use bank-level security to protect your information.
          </p>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50">
      <div className="w-full max-w-2xl p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">MicroRepay</h1>
          <p className="text-gray-500 mt-2">Let's set up your account</p>
        </div>
        
        {/* Progress indicators */}
        <div className="flex justify-between mb-6">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  completed[index]
                    ? "bg-primary border-primary text-white"
                    : index === currentStep
                    ? "border-primary text-primary"
                    : "border-gray-300 text-gray-300"
                }`}
              >
                {completed[index] ? <Check size={16} /> : index + 1}
              </div>
              <span className="text-xs mt-2 text-gray-500">{`Step ${index + 1}`}</span>
            </div>
          ))}
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStepData.component}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                isLoading ||
                (currentStep === 3 && !bankAccount) // Validate bank account selection in last step
              }
              className="bg-primary-gradient"
            >
              {isLoading
                ? "Processing..."
                : currentStep === steps.length - 1
                ? "Finish Setup"
                : "Next Step"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding; 