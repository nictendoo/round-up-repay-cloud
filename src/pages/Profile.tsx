import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, CreditCard, User, Wallet, Shield, Bell, Building, DollarSign } from "lucide-react";

const Profile = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // User profile state
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  }>({
    name: "John Doe",
    email: "john@example.com",
    avatar: "",
  });
  
  // User preferences state
  const [preferences, setPreferences] = useState<{
    debtStrategy: string;
    roundupAmount: number;
    roundupFrequency: string;
    bankAccount: string;
    notifications: boolean;
    emailUpdates: boolean;
    twoFactorAuth: boolean;
  }>({
    debtStrategy: "avalanche",
    roundupAmount: 5,
    roundupFrequency: "daily",
    bankAccount: "capital_one",
    notifications: true,
    emailUpdates: true,
    twoFactorAuth: false,
  });
  
  // Connected accounts state
  const [connectedAccounts, setConnectedAccounts] = useState<{
    banks: { id: string; name: string; connected: boolean }[];
    creditors: { id: string; name: string; connected: boolean }[];
  }>({
    banks: [
      { id: "capital_one", name: "Capital One", connected: true },
      { id: "chase", name: "Chase", connected: false },
      { id: "bank_of_america", name: "Bank of America", connected: false },
    ],
    creditors: [
      { id: "visa", name: "Visa Credit Card", connected: true },
      { id: "student_loan", name: "Student Loan Servicer", connected: true },
      { id: "mortgage", name: "Mortgage Provider", connected: false },
    ],
  });
  
  // Load user data on mount
  useEffect(() => {
    // TODO: Replace with actual API call to get user data
    const storedUser = localStorage.getItem("user");
    const storedPreferences = localStorage.getItem("userPreferences");
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser({
        name: parsedUser.name || "John Doe",
        email: parsedUser.email || "john@example.com",
        avatar: parsedUser.avatar || "",
      });
    }
    
    if (storedPreferences) {
      const parsedPreferences = JSON.parse(storedPreferences);
      setPreferences(prev => ({
        ...prev,
        ...parsedPreferences,
      }));
    }
  }, []);
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock API call to update user profile
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify(user));
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  const handleUpdatePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock API call to update preferences
    setTimeout(() => {
      localStorage.setItem("userPreferences", JSON.stringify(preferences));
      
      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully.",
      });
      
      setIsLoading(false);
    }, 1000);
  };
  
  const connectAccount = (type: 'banks' | 'creditors', id: string) => {
    setConnectedAccounts(prev => {
      const updated = {...prev};
      const accountIndex = updated[type].findIndex(a => a.id === id);
      
      if (accountIndex !== -1) {
        updated[type][accountIndex].connected = !updated[type][accountIndex].connected;
      }
      
      return updated;
    });
    
    toast({
      title: "Account updated",
      description: "Your connected account status has been updated.",
    });
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-end">
              <span className="font-medium">{user.name}</span>
              <span className="text-sm text-gray-500">{user.email}</span>
            </div>
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <Tabs defaultValue="profile">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User size={16} />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Wallet size={16} />
              <span>Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center space-x-2">
              <Building size={16} />
              <span>Connections</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield size={16} />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={user.name}
                        onChange={e => setUser({...user, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        onChange={e => setUser({...user, email: e.target.value})}
                      />
                    </div>
                    
                    <Button type="submit" className="mt-4 bg-primary-gradient" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Round-Up Settings</CardTitle>
                <CardDescription>
                  Configure how MicroRepay handles your round-ups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePreferences} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Debt Repayment Strategy</Label>
                      <RadioGroup 
                        value={preferences.debtStrategy} 
                        onValueChange={val => setPreferences({...preferences, debtStrategy: val})}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="avalanche" id="strategy-avalanche" />
                          <Label htmlFor="strategy-avalanche">Avalanche (High interest first)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="snowball" id="strategy-snowball" />
                          <Label htmlFor="strategy-snowball">Snowball (Small balances first)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="hybrid" id="strategy-hybrid" />
                          <Label htmlFor="strategy-hybrid">Hybrid (Smart balance of both)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between mb-2">
                        <Label>Round-Up Amount</Label>
                        <span className="font-medium">${preferences.roundupAmount}.00</span>
                      </div>
                      <Slider
                        value={[preferences.roundupAmount]}
                        onValueChange={val => setPreferences({...preferences, roundupAmount: val[0]})}
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
                    
                    <div className="space-y-2">
                      <Label>Round-Up Frequency</Label>
                      <Select 
                        value={preferences.roundupFrequency} 
                        onValueChange={val => setPreferences({...preferences, roundupFrequency: val})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Notifications</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="app-notifications" className="flex-grow">
                            Push Notifications
                          </Label>
                          <Switch 
                            id="app-notifications"
                            checked={preferences.notifications}
                            onCheckedChange={checked => 
                              setPreferences({...preferences, notifications: checked})
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-updates" className="flex-grow">
                            Email Updates
                          </Label>
                          <Switch 
                            id="email-updates"
                            checked={preferences.emailUpdates}
                            onCheckedChange={checked => 
                              setPreferences({...preferences, emailUpdates: checked})
                            }
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" className="mt-4 bg-primary-gradient" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="connections">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Banks</CardTitle>
                  <CardDescription>
                    Manage your connected bank accounts for round-ups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connectedAccounts.banks.map(bank => (
                      <div key={bank.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{bank.name}</p>
                            <p className="text-sm text-gray-500">
                              {bank.connected ? "Connected" : "Not connected"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={bank.connected ? "destructive" : "default"}
                          size="sm"
                          className={bank.connected ? "" : "bg-primary-gradient"}
                          onClick={() => connectAccount('banks', bank.id)}
                        >
                          {bank.connected ? "Disconnect" : "Connect"}
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-2">
                      + Add New Bank
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Connected Creditors</CardTitle>
                  <CardDescription>
                    Manage your debt accounts for payment allocation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connectedAccounts.creditors.map(creditor => (
                      <div key={creditor.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{creditor.name}</p>
                            <p className="text-sm text-gray-500">
                              {creditor.connected ? "Connected" : "Not connected"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={creditor.connected ? "destructive" : "default"}
                          size="sm"
                          className={creditor.connected ? "" : "bg-primary-gradient"}
                          onClick={() => connectAccount('creditors', creditor.id)}
                        >
                          {creditor.connected ? "Disconnect" : "Connect"}
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-2">
                      + Add New Creditor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account's security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={preferences.twoFactorAuth}
                      onCheckedChange={checked => 
                        setPreferences({...preferences, twoFactorAuth: checked})
                      }
                    />
                  </div>
                  
                  <div className="py-3 border-b">
                    <h3 className="font-medium mb-2">Password</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Last changed 30 days ago
                    </p>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <div className="py-3 border-b">
                    <h3 className="font-medium mb-2">Sessions</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      You're currently logged in on 1 device
                    </p>
                    <Button variant="outline">Manage Sessions</Button>
                  </div>
                  
                  <div className="py-3">
                    <h3 className="font-medium mb-2">Delete Account</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Permanently delete your account and all your data
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile; 