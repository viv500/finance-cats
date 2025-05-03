import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FileUpload from "@/components/FileUpload";
import Dashboard from "@/components/Dashboard";
import CatAdvisor from "@/components/CatAdvisor";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Volume2, VolumeX } from "lucide-react";
import { CatCredentialsPlaque } from "@/components/CatCredentialsPlaque";
import { playCatSpeech, stopAllSpeech } from "@/services/elevenlabsService";

export default function PouncePage() {
  const navigate = useNavigate();

  // --- STATE ---
  const [financialData, setFinancialData] = useState<any>(null);
  const [animate, setAnimate] = useState(false);
  const [catAdvice, setCatAdvice] = useState<string>(
    "Meow! Upload your spending history CSV, and I'll help you optimize your budget!"
  );
  const [error, setError] = useState<string | null>(null);
  const [isSpeechMuted, setIsSpeechMuted] = useState(false);

  useEffect(() => {
    // Trigger animation after component mount
    setAnimate(true);

    // Clean up speech when component unmounts
    return () => {
      stopAllSpeech();
    };
  }, []);

  // Play speech when financial data is available
  useEffect(() => {
    if (financialData && !isSpeechMuted) {
      // Generate a custom message based on financial data
      let speechText = `Meow there! Sir Pounce at your service. `;

      if (financialData.spendingInsights) {
        const { highestCategory, savingsTips } = financialData.spendingInsights;
        speechText += `I've analyzed your spending habits and found some interesting patterns. `;
        speechText += `Your highest spending category is ${highestCategory}. `;

        if (savingsTips && savingsTips.length > 0) {
          speechText += `Here's a tip: ${savingsTips[0]} `;
        }

        speechText += `Your current savings rate is ${financialData.savingsRate}%. `;

        if (financialData.savingsRate < 20) {
          speechText += `I recommend trying to save at least 20% of your income for better financial security.`;
        } else {
          speechText += `Great job on your savings! Keep up the good work!`;
        }
      } else {
        speechText += `I've analyzed your spending patterns and have some suggestions to optimize your budget!`;
      }

      playCatSpeech("pounce", speechText);
    }
  }, [financialData, isSpeechMuted]);

  // --- HANDLER: upload CSV ---
  const handleFileUploaded = (data: any) => {
    if (!data) {
      setError("Unable to analyze the CSV data. Please try another file format.");
      return;
    }
    setFinancialData(data);
    // generate advice
    try {
      const highest = data.spendingInsights?.highestCategory || "unknown";
      const tips = data.spendingInsights?.savingsTips || [];
      const tip = tips.length
        ? tips[Math.floor(Math.random() * tips.length)]
        : "Meow! Try to set aside a little more each month for savings!";

      setCatAdvice(
        `Meow! I notice your highest spending is in ${highest}. Purr-haps you could consider this tip: ${tip}`
      );
    } catch {
      setCatAdvice(
        "Meow! I've analyzed your spending, but I'm having trouble coming up with specific advice. Let's work on your budget together!"
      );
    }
  };

  // --- HANDLER: toggle mute/unmute ---
  const toggleSpeech = () => {
    if (isSpeechMuted) {
      setIsSpeechMuted(false);
      playCatSpeech("pounce", catAdvice);
    } else {
      setIsSpeechMuted(true);
      stopAllSpeech();
    }
  };

  return (
    <div className="min-h-screen bg-catty-light-gray">
      <Navbar />

      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {/* TOP BAR: header + volume button */}
          <div className="flex items-center justify-between mb-6">
            {!financialData && (
              <div
                className={`flex items-center ${
                  animate ? "pounce-appear" : "opacity-0"
                }`}
              >
                <img
                  src="/src/images/pounce_ok.png"
                  alt="Sir Pounce"
                  className="w-24 h-24 object-contain mr-4"
                />
                <div>
                  <h1 className="text-3xl font-bold text-catty-brown">
                    Sir Pounce's Budget Optimizer
                  </h1>
                  <p className="text-catty-gray mt-2">
                    Upload your bank statement CSV and I'll help you identify
                    savings opportunities with AI!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CREDENTIALS PLAQUE */}
          {financialData && (
            <>
              <CatCredentialsPlaque
                name="Sir Pounce"
                degree="M.Sc., Financial Planning"
                school="London School of Economics"
                schoolLogo="/src/images/lse_logo.png"
              />
              <div className="flex justify-center mt-4 mb-4">
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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* UPLOAD FORM */}
          {!financialData ? (
            <div
              className={`max-w-md mx-auto ${
                animate ? "pounce-card" : "opacity-0"
              }`}
            >
              <FileUpload onFileUploaded={handleFileUploaded} accept=".csv" />
              <div
                className={`mt-6 text-center ${
                  animate ? "stagger-appear" : "opacity-0"
                }`}
              >
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="bg-white border-catty-orange text-catty-brown hover:bg-catty-peach"
                >
                  Go Back Home
                </Button>
              </div>
            </div>
          ) : (
            /* DASHBOARD + NAVIGATION */
            <>
              <div className={`${animate ? "pounce-card" : "opacity-0"}`}>
                <Dashboard data={financialData} />
              </div>

              <div
                className={`mt-6 flex justify-center ${
                  animate ? "stagger-appear" : "opacity-0"
                }`}
              >
                <Button
                  onClick={() => setFinancialData(null)}
                  variant="outline"
                  className="bg-white border-catty-orange text-catty-brown hover:bg-catty-peach mr-4"
                >
                  Upload Another CSV
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="bg-white border-catty-orange text-catty-brown hover:bg-catty-peach"
                >
                  Go Back Home
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* FLOATING FLAVOR IMAGE */}
      {financialData && (
        <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom">
          <img
            src="/src/images/pounce_ok.png"
            alt="Sir Pounce"
            className="w-64 h-64 object-contain transform scale-150"
          />
        </div>
      )}
    </div>
  );
}
