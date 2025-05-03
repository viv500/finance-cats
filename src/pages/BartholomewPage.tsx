import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { playMeowSound } from "@/utils/sound";
import { getCreditCardRecommendations } from "@/services/geminiService";
import { CreditCardRecommendation } from "@/components/CreditCardRecommendation";
import { Loader2, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { playCatSpeech, stopAllSpeech } from "@/services/elevenlabsService";
import { CatCredentialsPlaque } from "@/components/CatCredentialsPlaque";
import { useAudioDetection } from "@/hooks/useAudioDetection";

export default function BartholomewPage() {
  const navigate = useNavigate();
  const { isTalking } = useAudioDetection();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [spendingCategories, setSpendingCategories] = useState({
    dining: false,
    travel: false,
    groceries: false,
    gas: false,
    online: false,
    entertainment: false,
  });
  const [cardGoal, setCardGoal] = useState("cashback");
  const [animate, setAnimate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeechMuted, setIsSpeechMuted] = useState(false);

  // initial animation & cleanup
  useEffect(() => {
    setAnimate(true);
    return () => {
      stopAllSpeech();
    };
  }, []);

  // Play speech when results appear
  useEffect(() => {
    if (showResults && !isSpeechMuted) {
      let speechText = `Hello there! I'm Doctor Bartholomeow, your credit card expert. `;
      if (recommendations.length > 0) {
        speechText += `Based on your preferences, I've found ${recommendations.length} purr-fect options for you. `;
        speechText += `My top recommendation is the ${recommendations[0].name}. `;
        speechText += `This card ${recommendations[0].description.toLowerCase()} `;
        speechText += `and offers benefits like ${recommendations[0].benefits[0].toLowerCase()}.`;
      } else {
        speechText += `I've analyzed your preferences and have some paw-some recommendations for you!`;
      }
      
      // Create audio element for speech
      if (!audioRef.current) {
        audioRef.current = document.createElement('audio');
        audioRef.current.style.display = 'none';
        document.body.appendChild(audioRef.current);
      }
      
      // Play speech and update audio source
      playCatSpeech("bartholomew", speechText).then(audioUrl => {
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
      });
    }
  }, [showResults, isSpeechMuted, recommendations]);

  // Cleanup audio element
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
        audioRef.current = null;
      }
    };
  }, []);

  // scroll to top when results are shown
  useEffect(() => {
    if (showResults) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showResults]);

  const handleCategoryChange = (category: string) => {
    setSpendingCategories(prev => ({
      ...prev,
      [category]: !prev[category as keyof typeof prev],
    }));
  };

  const handleSubmit = async () => {
    playMeowSound();
    setIsLoading(true);
    setError(null);
    try {
      const cards = await getCreditCardRecommendations(
        spendingCategories,
        cardGoal
      );
      setRecommendations(cards);
      setShowResults(true);
    } catch (e) {
      console.error(e);
      setError(
        "Meow! Dr. Bartholomeow had trouble analyzing your preferences. Please check if the Gemini API key is configured correctly."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeechMuted) {
      setIsSpeechMuted(false);
      if (showResults) playCatSpeech("bartholomew");
    } else {
      setIsSpeechMuted(true);
      stopAllSpeech();
    }
  };

  return (
    <div className="min-h-screen bg-catty-light-gray">
      <Navbar />

      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {/* header + title + volume toggle (only before results) */}
          {!showResults && (
            <div
              className={`flex items-center mb-8 ${
                animate ? "bartholomeow-appear" : "opacity-0"
              }`}
            >
              <div className="relative w-24 h-24 mr-4">
                <img
                  src="/src/images/barth_ok.png"
                  alt="Dr. Bartholomeow"
                  className="absolute w-full h-full object-contain transition-opacity duration-300"
                  style={{ opacity: isTalking ? 0 : 1 }}
                />
                <img
                  src="/src/images/barth_talk.png"
                  alt="Dr. Bartholomeow Talking"
                  className="absolute w-full h-full object-contain transition-opacity duration-300"
                  style={{ opacity: isTalking ? 1 : 0 }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-catty-brown">
                    Dr. Bartholomeow's Canadian Credit Card Advisor
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSpeech}
                    className="ml-2"
                  >
                    {isSpeechMuted ? (
                      <VolumeX className="h-5 w-5 text-catty-gray" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-catty-orange" />
                    )}
                  </Button>
                </div>
                <p className="text-catty-gray mt-2">
                  Let me help you find the purrfect Canadian credit card based on
                  your spending habits and goals.
                </p>
              </div>
            </div>
          )}

          {/* credentials plaque + volume toggle (after results) */}
          {showResults && (
            <>
              <CatCredentialsPlaque
                name="Dr. Bartholomeow"
                degree="Ph.D., Quantitative Finance & Risk Management"
                school="University of Oxford"
                schoolLogo="/src/images/oxford_logo.png"
              />
              <div className="flex justify-center mt-4 mb-6">
                <Button variant="ghost" size="icon" onClick={toggleSpeech}>
                  {isSpeechMuted ? (
                    <VolumeX className="h-6 w-6 text-catty-gray" />
                  ) : (
                    <Volume2 className="h-6 w-6 text-catty-orange" />
                  )}
                </Button>
              </div>
            </>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!showResults ? (
            <>
              {/* form cards */}
              <Card
                className={`mb-8 ${
                  animate ? "bartholomeow-card" : "opacity-0"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-xl text-catty-brown">
                    Where do you spend the most?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 stagger-appear">
                  {Object.keys(spendingCategories).map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={spendingCategories[
                          category as keyof typeof spendingCategories
                        ]}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <Label htmlFor={category} className="capitalize">
                        {category}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card
                className={`mb-8 ${
                  animate ? "bartholomeow-card" : "opacity-0"
                }`}
                style={{ animationDelay: "0.5s" }}
              >
                <CardHeader>
                  <CardTitle className="text-xl text-catty-brown">
                    What are you looking for in a credit card?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={cardGoal}
                    onValueChange={setCardGoal}
                    className="stagger-appear"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <RadioGroupItem value="cashback" id="cashback" />
                      <Label htmlFor="cashback">Cash Back</Label>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <RadioGroupItem value="points" id="points" />
                      <Label htmlFor="points">Travel Points</Label>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <RadioGroupItem value="lowinterest" id="lowinterest" />
                      <Label htmlFor="lowinterest">Low Interest Rate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rewards" id="rewards" />
                      <Label htmlFor="rewards">Specialized Rewards</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <div
                className={`flex justify-between ${
                  animate ? "stagger-appear" : "opacity-0"
                }`}
              >
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
                    "Get Recommendations"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div>
              <div className="space-y-6">
                {recommendations.map((card, idx) => (
                  <CreditCardRecommendation key={idx} {...card} />
                ))}
              </div>

              <div className="mt-8">
                <p className="text-xs text-catty-gray mb-4">
                  Note: Credit card offers, rates, and benefits may change over
                  time. Please verify details with the issuing bank before
                  applying.
                </p>
                <div className="flex justify-between">
                  <Button
                    onClick={() => {
                      setShowResults(false);
                      stopAllSpeech();
                    }}
                    variant="outline"
                    className="bg-white border-catty-orange text-catty-brown hover:bg-catty-peach"
                  >
                    Start Over
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/");
                      stopAllSpeech();
                    }}
                    className="bg-catty-orange hover:bg-catty-brown text-white"
                  >
                    Return Home
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showResults && (
        <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom">
          <div className="relative w-64 h-64">
            <img
              src="/src/images/barth_ok.png"
              alt="Dr. Bartholomeow"
              className="absolute w-full h-full object-contain transform scale-150 transition-opacity duration-300"
              style={{ opacity: isTalking ? 0 : 1 }}
            />
            <img
              src="/src/images/barth_talk.png"
              alt="Dr. Bartholomeow Talking"
              className="absolute w-full h-full object-contain transform scale-150 transition-opacity duration-300"
              style={{ opacity: isTalking ? 1 : 0 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
