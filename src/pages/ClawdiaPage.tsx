import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { playMeowSound } from "@/utils/sound";
import InvestmentDashboard from "@/components/InvestmentDashboard";
import { getInvestmentRecommendations } from "@/services/geminiService";
import { Loader2, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { playCatSpeech, stopAllSpeech } from "@/services/elevenlabsService";
import { CatCredentialsPlaque } from "@/components/CatCredentialsPlaque";

export default function ClawdiaPage() {
  const navigate = useNavigate();
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [riskTolerance, setRiskTolerance] = useState([5]); // 0–10
  const [investmentGoal, setInvestmentGoal] = useState("retirement");
  const [timeHorizon, setTimeHorizon] = useState("long");
  const [animate, setAnimate] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeechMuted, setIsSpeechMuted] = useState(false);

  // trigger animations & cleanup
  useEffect(() => {
    setAnimate(true);
    return () => {
      stopAllSpeech();
    };
  }, []);

  // play TTS when results arrive
  useEffect(() => {
    if (showResults && !isSpeechMuted && apiData) {
      let speech = `Greetings, I'm Doctor Clawdia. `;
      speech += `I've created an investment portfolio tailored to your ${investmentGoal} goal and a ${riskTolerance[0]}/10 risk tolerance. `;

      if (apiData.portfolioAllocation) {
        const top = [...apiData.portfolioAllocation].sort((a, b) => b.value - a.value)[0];
        speech += `I've allocated ${top.value}% to ${top.name}. `;
        if (apiData.annualReturn) {
          speech += `Projected annual return is ${apiData.annualReturn}%, growing $${investmentAmount} to $${Math.round(apiData.totalReturn)} over ${apiData.years} years. `;
        }
      }

      speech += `Let's review the plan!`;
      playCatSpeech("clawdia", speech);
    }
  }, [showResults, isSpeechMuted, apiData]);

  // scroll to top when results are shown
  useEffect(() => {
    if (showResults) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showResults]);

  const handleSubmit = async () => {
    playMeowSound();
    setIsLoading(true);
    setError(null);
    try {
      const plan = await getInvestmentRecommendations(
        investmentAmount,
        riskTolerance,
        investmentGoal,
        timeHorizon
      );
      setApiData(plan);
      setShowResults(true);
    } catch {
      setError(
        "Meow! Dr. Clawdia had trouble analyzing your preferences. Please check if the Gemini API key is configured correctly."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeechMuted) {
      setIsSpeechMuted(false);
      if (showResults && apiData) playCatSpeech("clawdia");
    } else {
      setIsSpeechMuted(true);
      stopAllSpeech();
    }
  };

  // --- RESULTS VIEW ---
  if (showResults) {
    return (
      <div className="min-h-screen bg-catty-light-gray">
        <Navbar />
        <div className="container py-12 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-8">
              <div className="flex flex-col items-center w-full">
                <CatCredentialsPlaque
                  name="Dr. Clawdia"
                  degree="Ph.D., Credit Score Analytics & Portfolio Optimization, Stanford University"
                  school="Stanford University"
                  schoolLogo="/src/images/stanford_logo.png"
                />
                <div className="flex justify-center mt-4">
                  <Button variant="ghost" size="icon" onClick={toggleSpeech}>
                    {isSpeechMuted ? (
                      <VolumeX className="h-6 w-6 text-catty-gray" />
                    ) : (
                      <Volume2 className="h-6 w-6 text-catty-orange" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <InvestmentDashboard
              data={{
                investmentAmount,
                riskTolerance,
                investmentGoal,
                timeHorizon,
                apiData,
              }}
            />
          </div>
        </div>

        <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom">
          <img
            src="/src/images/clawdia_ok.png"
            alt="Dr. Clawdia"
            className="w-64 h-64 object-contain transform scale-150"
          />
        </div>
      </div>
    );
  }

  // --- INPUT FORM VIEW ---
  return (
    <div className="min-h-screen bg-catty-light-gray">
      <Navbar />
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <img
              src="/src/images/clawdia_ok.png"
              alt="Dr. Clawdia"
              className="w-24 h-24 object-contain mr-4"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-catty-brown">
                  Dr. Clawdia's Investment Planner
                </h1>
                <Button variant="ghost" size="icon" onClick={toggleSpeech}>
                  {isSpeechMuted ? (
                    <VolumeX className="h-5 w-5 text-catty-gray" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-catty-orange" />
                  )}
                </Button>
              </div>
              <p className="text-catty-gray mt-2">
                Let me help you create a purrfect investment strategy.
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className={`mb-6 ${animate ? "clawdia-card" : "opacity-0"}`}>
            <CardHeader>
              <CardTitle className="text-xl text-catty-brown">
                How much to invest?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 stagger-appear">
                <Label htmlFor="investmentAmount">Amount ($):</Label>
                <Input
                  id="investmentAmount"
                  type="number"
                  value={investmentAmount}
                  onChange={e => setInvestmentAmount(+e.target.value)}
                  className="max-w-[180px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className={`mb-6 ${animate ? "clawdia-card" : "opacity-0"}`} style={{animationDelay:"0.5s"}}>
            <CardHeader>
              <CardTitle className="text-xl text-catty-brown">Risk tolerance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 stagger-appear">
                <Slider
                  value={riskTolerance}
                  onValueChange={setRiskTolerance}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-sm text-catty-gray">
                  <span>Conservative</span>
                  <span>Moderate</span>
                  <span>Aggressive</span>
                </div>
                <div className="text-center font-medium text-catty-brown">
                  {riskTolerance[0]}/10
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`mb-6 ${animate ? "clawdia-card" : "opacity-0"}`} style={{animationDelay:"0.7s"}}>
            <CardHeader>
              <CardTitle className="text-xl text-catty-brown">
                Primary goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={investmentGoal}
                onValueChange={setInvestmentGoal}
                className="stagger-appear"
              >
                {[
                  ["retirement","Retirement"],
                  ["education","Education Fund"],
                  ["house","Home Purchase"],
                  ["wealth","Wealth Building"]
                ].map(([val,label]) => (
                  <div key={val} className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value={val} id={val} />
                    <Label htmlFor={val}>{label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className={`mb-8 ${animate ? "clawdia-card" : "opacity-0"}`} style={{animationDelay:"0.9s"}}>
            <CardHeader>
              <CardTitle className="text-xl text-catty-brown">
                Time horizon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={timeHorizon}
                onValueChange={setTimeHorizon}
                className="stagger-appear"
              >
                {[
                  ["short","Short (1-3 yrs)"],
                  ["medium","Medium (3-7 yrs)"],
                  ["long","Long (7+ yrs)"]
                ].map(([val,label]) => (
                  <div key={val} className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value={val} id={val} />
                    <Label htmlFor={val}>{label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className={`flex justify-between ${animate?"stagger-appear":"opacity-0"}`}>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="bg-white border-catty-orange text-catty-brown hover:bg-catty-peach"
            >
              Go Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-catty-orange hover:bg-catty-brown text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Get Investment Plan"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
