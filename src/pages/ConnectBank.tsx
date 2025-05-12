import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, CreditCard, ChevronRight, Lock, CheckCircle2 } from "lucide-react";

const BankCard = ({ bank, onClick }: { bank: Bank; onClick: () => void }) => (
  <div 
    className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors"
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
        {bank.logo ? (
          <img src={bank.logo} alt={bank.name} className="w-8 h-8" />
        ) : (
          <Building className="w-6 h-6 text-blue-600" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{bank.name}</h3>
        <p className="text-sm text-gray-500">{bank.description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  </div>
);

interface Bank {
  id: string;
  name: string;
  description: string;
  logo?: string;
  popular?: boolean;
}

const ConnectBank = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const popularBanks: Bank[] = [
    { 
      id: "capital_one", 
      name: "Capital One", 
      description: "Credit cards, checking & savings",
      popular: true
    },
    { 
      id: "chase", 
      name: "Chase", 
      description: "Credit cards, checking & savings",
      popular: true 
    },
    { 
      id: "bank_of_america", 
      name: "Bank of America", 
      description: "Credit cards, checking & savings",
      popular: true 
    },
    { 
      id: "wells_fargo", 
      name: "Wells Fargo", 
      description: "Banking, credit cards, loans",
      popular: true 
    },
  ];

  const otherBanks: Bank[] = [
    { id: "citi", name: "Citibank", description: "Credit cards, checking & savings" },
    { id: "discover", name: "Discover", description: "Credit cards & banking" },
    { id: "us_bank", name: "U.S. Bank", description: "Banking, loans, credit cards" },
    { id: "pnc", name: "PNC Bank", description: "Banking & investments" },
    { id: "td_bank", name: "TD Bank", description: "Banking, credit cards & loans" },
    { id: "american_express", name: "American Express", description: "Credit cards & services" },
  ];

  const allBanks = [...popularBanks, ...otherBanks];

  const filteredBanks = searchTerm
    ? allBanks.filter(bank => 
        bank.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
  };

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBank) return;
    
    setIsLoading(true);
    
    // Simulate bank connection
    setTimeout(() => {
      // Store connected bank in user preferences
      const userPreferences = localStorage.getItem("userPreferences");
      const parsedPreferences = userPreferences ? JSON.parse(userPreferences) : {};
      
      localStorage.setItem("userPreferences", JSON.stringify({
        ...parsedPreferences,
        bankAccount: selectedBank.id
      }));
      
      setIsLoading(false);
      setIsConnected(true);
      
      toast({
        title: "Bank connected successfully",
        description: `Your ${selectedBank.name} account is now linked to MicroRepay.`,
      });
      
      // Redirect after successful connection
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }, 1500);
  };

  const renderBankSelection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <Input
            placeholder="Search for your bank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {searchTerm && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Search Results</h3>
            {filteredBanks.length > 0 ? (
              <div className="space-y-2">
                {filteredBanks.map((bank) => (
                  <BankCard
                    key={bank.id}
                    bank={bank}
                    onClick={() => handleSelectBank(bank)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No banks found matching your search.</p>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="popular">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="popular">Popular Banks</TabsTrigger>
          <TabsTrigger value="all">All Banks</TabsTrigger>
        </TabsList>
        <TabsContent value="popular" className="space-y-4 mt-4">
          {popularBanks.map((bank) => (
            <BankCard
              key={bank.id}
              bank={bank}
              onClick={() => handleSelectBank(bank)}
            />
          ))}
        </TabsContent>
        <TabsContent value="all" className="space-y-4 mt-4">
          {allBanks.map((bank) => (
            <BankCard
              key={bank.id}
              bank={bank}
              onClick={() => handleSelectBank(bank)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderCredentialsForm = () => (
    <div>
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-medium">{selectedBank?.name}</h2>
            <p className="text-sm text-gray-500">Enter your credentials</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleConnect} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleCredentialsChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleCredentialsChange}
            required
          />
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-4">
          <Lock className="w-4 h-4" />
          <p>Your credentials are securely encrypted and never stored.</p>
        </div>
        
        <div className="flex space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setSelectedBank(null)}
          >
            Back
          </Button>
          <Button 
            type="submit" 
            className="w-full bg-primary-gradient"
            disabled={!credentials.username || !credentials.password || isLoading}
          >
            {isLoading ? "Connecting..." : "Connect Account"}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="py-8 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-xl font-bold mb-2">Successfully Connected!</h2>
      <p className="text-gray-500 mb-6">
        Your {selectedBank?.name} account has been successfully linked to MicroRepay.
      </p>
      <p className="text-sm text-gray-400 mb-6">
        Redirecting to dashboard...
      </p>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Connect Your Bank</h1>
          <p className="text-gray-500">
            Link your bank account to track transactions and enable round-ups
          </p>
        </div>
        
        <Card>
          <CardHeader className={selectedBank || isConnected ? "border-b" : ""}>
            <CardTitle>{isConnected 
              ? "Connection Successful" 
              : selectedBank 
                ? `Connect to ${selectedBank.name}` 
                : "Select Your Bank"
            }</CardTitle>
            <CardDescription>
              {isConnected 
                ? "Your bank account is now linked to MicroRepay" 
                : selectedBank 
                  ? "Enter your online banking credentials" 
                  : "Choose your bank from the list or search by name"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isConnected 
              ? renderSuccess()
              : selectedBank 
                ? renderCredentialsForm() 
                : renderBankSelection()
            }
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ConnectBank; 