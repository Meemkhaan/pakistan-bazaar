import { useState, useEffect } from "react";
import { Heart, Users, Home, BookOpen, Utensils, Droplets, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface DonationImpactProps {
  totalDonations: number;
}

interface Charity {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  target: number;
  raised: number;
  impact: string[];
}

const CHARITIES: Charity[] = [
  {
    id: "1",
    name: "Edhi Foundation",
    description: "Providing emergency medical services and social welfare",
    category: "Healthcare",
    icon: <Activity className="w-6 h-6 text-red-500" />,
    target: 500000,
    raised: 125000,
    impact: ["Emergency medical services", "Ambulance network", "Orphan care"]
  },
  {
    id: "2",
    name: "Shaukat Khanum Memorial",
    description: "Cancer treatment and research center",
    category: "Healthcare",
    icon: <Heart className="w-6 h-6 text-pink-500" />,
    target: 1000000,
    raised: 750000,
    impact: ["Free cancer treatment", "Medical research", "Patient support"]
  },
  {
    id: "3",
    name: "Saylani Welfare",
    description: "Food distribution and social services",
    category: "Social Welfare",
    icon: <Utensils className="w-6 h-6 text-orange-500" />,
    target: 300000,
    raised: 180000,
    impact: ["Daily food distribution", "Education support", "Healthcare services"]
  },
  {
    id: "4",
    name: "TCF Foundation",
    description: "Quality education for underprivileged children",
    category: "Education",
    icon: <BookOpen className="w-6 h-6 text-blue-500" />,
    target: 800000,
    raised: 450000,
    impact: ["School construction", "Teacher training", "Student scholarships"]
  },
  {
    id: "5",
    name: "WaterAid Pakistan",
    description: "Clean water and sanitation projects",
    category: "Environment",
    icon: <Droplets className="w-6 h-6 text-cyan-500" />,
    target: 400000,
    raised: 220000,
    impact: ["Water wells", "Sanitation facilities", "Hygiene education"]
  },
  {
    id: "6",
    name: "Shelter Homes",
    description: "Housing for homeless families",
    category: "Housing",
    icon: <Home className="w-6 h-6 text-green-500" />,
    target: 600000,
    raised: 320000,
    impact: ["Emergency shelters", "Family housing", "Community centers"]
  }
];

const DonationImpact = ({ totalDonations }: DonationImpactProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [impactStats, setImpactStats] = useState({
    totalRaised: 0,
    totalTarget: 0,
    peopleHelped: 0,
    projectsCompleted: 0
  });

  useEffect(() => {
    // Calculate impact statistics
    const totalRaised = CHARITIES.reduce((sum, charity) => sum + charity.raised, 0);
    const totalTarget = CHARITIES.reduce((sum, charity) => sum + charity.target, 0);
    const peopleHelped = Math.floor(totalRaised / 1000) * 100; // Rough estimate
    const projectsCompleted = Math.floor(totalRaised / 50000); // Rough estimate

    setImpactStats({
      totalRaised,
      totalTarget,
      peopleHelped,
      projectsCompleted
    });
  }, []);

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Healthcare":
        return "bg-red-100 text-red-800";
      case "Education":
        return "bg-blue-100 text-blue-800";
      case "Social Welfare":
        return "bg-orange-100 text-orange-800";
      case "Environment":
        return "bg-cyan-100 text-cyan-800";
      case "Housing":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCharities = selectedCategory === "all" 
    ? CHARITIES 
    : CHARITIES.filter(charity => charity.category === selectedCategory);

  const categories = ["all", ...new Set(CHARITIES.map(c => c.category))];

  return (
    <div className="space-y-6">
      {/* Impact Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Your Donations Make a Difference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(impactStats.totalRaised)}
              </div>
              <div className="text-sm text-muted-foreground">Total Raised</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {impactStats.peopleHelped.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">People Helped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {impactStats.projectsCompleted}+
              </div>
              <div className="text-sm text-muted-foreground">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {CHARITIES.length}
              </div>
              <div className="text-sm text-muted-foreground">Partner Charities</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round((impactStats.totalRaised / impactStats.totalTarget) * 100)}%</span>
            </div>
            <Progress value={(impactStats.totalRaised / impactStats.totalTarget) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category === "all" ? "All Categories" : category}
          </Badge>
        ))}
      </div>

      {/* Charity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharities.map((charity) => (
          <Card key={charity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    {charity.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{charity.name}</CardTitle>
                    <Badge className={getCategoryColor(charity.category)}>
                      {charity.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {charity.description}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round((charity.raised / charity.target) * 100)}%</span>
                </div>
                <Progress value={(charity.raised / charity.target) * 100} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatPrice(charity.raised)} raised</span>
                  <span>{formatPrice(charity.target)} target</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Impact:</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {charity.impact.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Impact Stories */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Impact Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">500+ Children Received Education</h4>
                <p className="text-sm text-muted-foreground">
                  Your donations helped TCF Foundation provide quality education to underprivileged children in rural areas.
                </p>
                <div className="text-xs text-green-600 mt-2">2 days ago</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">100+ Cancer Patients Treated</h4>
                <p className="text-sm text-muted-foreground">
                  Shaukat Khanum Memorial provided free cancer treatment to patients who couldn't afford it.
                </p>
                <div className="text-xs text-blue-600 mt-2">1 week ago</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Utensils className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium">10,000+ Meals Distributed</h4>
                <p className="text-sm text-muted-foreground">
                  Saylani Welfare Trust distributed meals to families affected by recent floods.
                </p>
                <div className="text-xs text-orange-600 mt-2">2 weeks ago</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationImpact; 