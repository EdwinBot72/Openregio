import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const questions = [
  {
    id: 1,
    question: "Heb je vaste klanten waar je regelmatig contact mee hebt?",
    yesText: "Ja, ik heb een vaste klantenkring",
    noText: "Nee, ik werk vooral met eenmalige klanten",
  },
  {
    id: 2,
    question: "Kun je zonder grote platformen (Google, Facebook, Thuisbezorgd) nog steeds klanten bereiken?",
    yesText: "Ja, ik heb ook andere kanalen",
    noText: "Nee, ik ben vooral afhankelijk van platformen",
  },
  {
    id: 3,
    question: "Heb je een manier om klanten te bereiken als internet of je pinautomaat uitvalt?",
    yesText: "Ja, ik heb een backup-plan",
    noText: "Nee, dan ligt mijn bedrijf stil",
  },
  {
    id: 4,
    question: "Ken je andere ondernemers in jouw buurt met wie je kunt samenwerken of doorverwijzen?",
    yesText: "Ja, ik heb een lokaal netwerk",
    noText: "Nee, ik werk vooral alleen",
  },
  {
    id: 5,
    question: "Accepteer je ook andere betaalmethodes dan pin (contant, overschrijving, factuur)?",
    yesText: "Ja, ik bied meerdere opties",
    noText: "Nee, alleen pin of online betalen",
  },
];

export default function BasischeckPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (answer: boolean) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const yesCount = answers.filter(Boolean).length;
  const score = Math.round((yesCount / questions.length) * 100);

  const getResultMessage = () => {
    if (score >= 80) {
      return {
        title: "Uitstekend!",
        message: "Je bedrijf is goed voorbereid op een basisgerichte aanpak. Je hebt al een sterk lokaal netwerk en bent niet te afhankelijk van grote platformen.",
        color: "text-green-600",
      };
    } else if (score >= 60) {
      return {
        title: "Goed op weg!",
        message: "Je hebt een goede basis, maar er zijn nog mogelijkheden om je onafhankelijkheid te versterken. OpenRegio kan je helpen je lokale netwerk uit te breiden.",
        color: "text-yellow-600",
      };
    } else if (score >= 40) {
      return {
        title: "Ruimte voor verbetering",
        message: "Je bent behoorlijk afhankelijk van platformen en digitale systemen. OpenRegio kan je helpen om terug te keren naar de basis en een sterker lokaal netwerk op te bouwen.",
        color: "text-orange-600",
      };
    } else {
      return {
        title: "Tijd voor actie",
        message: "Je bedrijf is sterk afhankelijk van externe platformen. OpenRegio helpt je om weer grip te krijgen op je eigen klanten, netwerk en betalingen.",
        color: "text-red-600",
      };
    }
  };

  const result = getResultMessage();

  if (showResult) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center">
            <Link 
              href="/" 
              className="font-accent text-2xl font-bold text-primary"
              data-testid="link-home-logo"
            >
              OpenRegio
            </Link>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" data-testid="card-result">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl" data-testid="text-result-title">
                Jouw Basischeck Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2" data-testid="text-score">
                  {score}%
                </div>
                <div className={`text-xl font-semibold ${result.color}`} data-testid="text-result-level">
                  {result.title}
                </div>
              </div>

              <p className="text-muted-foreground text-center" data-testid="text-result-message">
                {result.message}
              </p>

              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div 
                    key={q.id} 
                    className="flex items-center gap-2 text-sm"
                    data-testid={`result-item-${idx}`}
                  >
                    {answers[idx] ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span className="text-muted-foreground">{q.question}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Link href="/start?plan=basic">
                  <Button className="w-full" size="lg" data-testid="button-join">
                    Word lid van OpenRegio – €9,95 p/m
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full" data-testid="button-back-home">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Terug naar home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="font-accent text-2xl font-bold text-primary"
            data-testid="link-home-logo"
          >
            OpenRegio
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-exit">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Stoppen
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full" data-testid="card-question">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground" data-testid="text-progress">
                Vraag {currentQuestion + 1} van {questions.length}
              </span>
              <div className="flex gap-1">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx < currentQuestion
                        ? "bg-primary"
                        : idx === currentQuestion
                        ? "bg-primary/50"
                        : "bg-muted"
                    }`}
                    data-testid={`progress-dot-${idx}`}
                  />
                ))}
              </div>
            </div>
            <CardTitle className="text-xl" data-testid="text-question">
              {questions[currentQuestion].question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-4 px-4"
              onClick={() => handleAnswer(true)}
              data-testid="button-answer-yes"
            >
              <CheckCircle2 className="w-5 h-5 mr-3 text-green-600 shrink-0" />
              <span>{questions[currentQuestion].yesText}</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-4 px-4"
              onClick={() => handleAnswer(false)}
              data-testid="button-answer-no"
            >
              <XCircle className="w-5 h-5 mr-3 text-red-600 shrink-0" />
              <span>{questions[currentQuestion].noText}</span>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
