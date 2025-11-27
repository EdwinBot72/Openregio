import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Banknote, FileText, Phone, Battery, Users, Shield, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

interface Question {
  id: string;
  icon: typeof Banknote;
  title: string;
  description: string;
  badge: string;
}

const questions: Question[] = [
  {
    id: "cash",
    icon: Banknote,
    title: "Kun je klanten laten betalen met cash?",
    description: "Heb je wisselgeld klaarliggen en weet je hoe je een handmatige bon maakt?",
    badge: "Accepteert cash",
  },
  {
    id: "bonnenblok",
    icon: FileText,
    title: "Heb je een bonnenblok of papieren facturen?",
    description: "Kun je een factuur schrijven zonder computer of printer?",
    badge: "Bonnenblok",
  },
  {
    id: "telefoonlijst",
    icon: Phone,
    title: "Heb je een papieren telefoonlijst?",
    description: "Ken je de nummers van je belangrijkste klanten, leveranciers en collega's uit je hoofd of op papier?",
    badge: "Telefoonlijst",
  },
  {
    id: "noodstroom",
    icon: Battery,
    title: "Heb je noodstroom of een powerbank?",
    description: "Kun je je telefoon opladen en bereikbaar blijven als de stroom uitvalt?",
    badge: "Noodstroom",
  },
  {
    id: "offline",
    icon: Users,
    title: "Kun je een deel van je werk zonder computer doen?",
    description: "Kun je klanten helpen, afspraken maken of je werk doen zonder internet?",
    badge: "Offline werk",
  },
];

export default function BasischeckPage() {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  const handleAnswer = (answer: boolean) => {
    const question = questions[currentQuestion];
    setAnswers((prev) => ({ ...prev, [question.id]: answer }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setFinished(false);
  };

  const score = Object.values(answers).filter(Boolean).length;
  const percentage = Math.round((score / questions.length) * 100);

  const getScoreMessage = () => {
    if (percentage >= 80) {
      return {
        title: "Uitstekend! Je bedrijf is goed voorbereid.",
        description: "Je hebt de basis op orde. Je kunt doorwerken als systemen haperen.",
        color: "text-green-600",
        icon: Shield,
      };
    } else if (percentage >= 60) {
      return {
        title: "Goed bezig! Maar er is ruimte voor verbetering.",
        description: "Je hebt een aantal basics op orde, maar een paar simpele stappen kunnen je nog weerbaarder maken.",
        color: "text-yellow-600",
        icon: AlertTriangle,
      };
    } else if (percentage >= 40) {
      return {
        title: "Let op! Je bedrijf is kwetsbaar.",
        description: "Als systemen uitvallen, heb je een probleem. Tijd om de basis op orde te brengen.",
        color: "text-orange-600",
        icon: AlertTriangle,
      };
    } else {
      return {
        title: "Waarschuwing! Je bedrijf is te afhankelijk.",
        description: "Je bent volledig afhankelijk van digitale systemen. Een stroomstoring of storing kan je bedrijf stilleggen.",
        color: "text-red-600",
        icon: XCircle,
      };
    }
  };

  // Intro page
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="font-accent text-2xl font-bold text-primary" data-testid="link-home-logo">
              OpenRegio
            </Link>
            <Link href="/start?plan=basic">
              <Button size="sm" data-testid="button-nav-join">
                Word lid
              </Button>
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-accent text-4xl md:text-5xl font-bold mb-4" data-testid="text-basischeck-title">
              De Basischeck
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Hoe stevig is jouw bedrijf als systemen haperen? Ontdek in 5 simpele vragen 
              hoe weerbaar je bent – en wat je kunt doen om sterker te staan.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="font-accent text-2xl font-bold mb-6 text-center">
                Wat gebeurt er als...
              </h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="text-4xl mb-2">💳</div>
                  <p className="font-semibold">De pin uitvalt?</p>
                  <p className="text-sm text-muted-foreground">Kun je nog afrekenen?</p>
                </div>
                <div className="p-4">
                  <div className="text-4xl mb-2">🔌</div>
                  <p className="font-semibold">De stroom uitvalt?</p>
                  <p className="text-sm text-muted-foreground">Blijf je bereikbaar?</p>
                </div>
                <div className="p-4">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="font-semibold">Het internet eruit ligt?</p>
                  <p className="text-sm text-muted-foreground">Kun je nog werken?</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button size="lg" onClick={() => setStarted(true)} data-testid="button-start-check">
              Start de Basischeck
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              5 vragen • 2 minuten • Gratis
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-5 gap-4">
            {questions.map((q, idx) => (
              <div key={idx} className="text-center p-4">
                <q.icon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">{q.badge}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Results page
  if (finished) {
    const scoreMessage = getScoreMessage();
    const ScoreIcon = scoreMessage.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="font-accent text-2xl font-bold text-primary" data-testid="link-home-logo">
              OpenRegio
            </Link>
            <Link href="/start?plan=basic">
              <Button size="sm" data-testid="button-nav-join">
                Word lid
              </Button>
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6`}>
              <ScoreIcon className={`h-10 w-10 ${scoreMessage.color}`} />
            </div>
            <h1 className="font-accent text-3xl md:text-4xl font-bold mb-4" data-testid="text-result-title">
              Jouw score: {score} van de {questions.length}
            </h1>
            <div className="w-full max-w-md mx-auto mb-6">
              <Progress value={percentage} className="h-4" />
              <p className="text-lg font-semibold mt-2">{percentage}% weerbaar</p>
            </div>
            <h2 className={`text-xl font-semibold ${scoreMessage.color} mb-2`}>
              {scoreMessage.title}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {scoreMessage.description}
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-accent text-xl font-bold mb-4">Jouw badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {questions.map((q) => {
                  const hasIt = answers[q.id];
                  return (
                    <div
                      key={q.id}
                      className={`text-center p-4 rounded-lg ${
                        hasIt ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
                      }`}
                      data-testid={`badge-result-${q.id}`}
                    >
                      {hasIt ? (
                        <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      )}
                      <p className="text-sm font-medium">{q.badge}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {score < questions.length && (
            <Card className="mb-8 border-primary">
              <CardContent className="p-6">
                <h3 className="font-accent text-xl font-bold mb-4">Wat kun je doen?</h3>
                <ul className="space-y-3">
                  {questions
                    .filter((q) => !answers[q.id])
                    .map((q) => (
                      <li key={q.id} className="flex items-start gap-3">
                        <q.icon className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-semibold">{q.badge}</p>
                          <p className="text-sm text-muted-foreground">{q.description}</p>
                        </div>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="bg-primary/5 border-primary">
            <CardContent className="p-8 text-center">
              <h3 className="font-accent text-2xl font-bold mb-4">
                Klaar om je bedrijf weerbaarder te maken?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Word lid van OpenRegio en krijg toegang tot het lokale netwerk, 
                printbare templates, en je eigen weerbaarheidsprofiel met badges.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/start?plan=basic">
                  <Button size="lg" data-testid="button-result-join">
                    Word lid – €9,95 p/m
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" onClick={handleRestart} data-testid="button-restart">
                  Opnieuw doen
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Maandelijks opzegbaar, geen contracten
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Question page
  const question = questions[currentQuestion];
  const QuestionIcon = question.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-accent text-2xl font-bold text-primary" data-testid="link-home-logo">
            OpenRegio
          </Link>
          <div className="text-sm text-muted-foreground">
            Vraag {currentQuestion + 1} van {questions.length}
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <QuestionIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-accent text-2xl md:text-3xl font-bold mb-4" data-testid="text-question-title">
              {question.title}
            </h2>
            <p className="text-muted-foreground mb-8" data-testid="text-question-description">
              {question.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => handleAnswer(true)}
                className="min-w-32"
                data-testid="button-answer-yes"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Ja
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleAnswer(false)}
                className="min-w-32"
                data-testid="button-answer-no"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Nee
              </Button>
            </div>

            {currentQuestion > 0 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mt-6"
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Vorige vraag
              </Button>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Badge: <span className="font-medium">{question.badge}</span>
        </p>
      </div>
    </div>
  );
}
