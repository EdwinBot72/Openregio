import { NetworkGrid } from "@/components/NetworkGrid";
import type { BusinessProfile } from "@/components/BusinessProfileCard";

export default function NetworkPage() {
  const profiles: BusinessProfile[] = [
    {
      id: "1",
      name: "Bakkerij De Gouden Korrel",
      owner: "Maria van den Berg",
      category: "Bakkerij",
      description: "Ambachtelijke bakkerij met verse broodjes en gebak, elke dag vers gebakken met lokale ingrediënten.",
      location: "Amsterdam Centrum",
      distance: "1.2 km",
    },
    {
      id: "2",
      name: "Koffie & Co",
      owner: "Jan Pieters",
      category: "Horeca",
      description: "Gezellig koffiehuis met specialty coffee en verse lunch.",
      location: "Amsterdam Noord",
      distance: "2.5 km",
    },
    {
      id: "3",
      name: "Groen Advies",
      owner: "Sophie de Vries",
      category: "Consulting",
      description: "Duurzaamheidsadvies voor lokale bedrijven en MKB.",
      location: "Amsterdam West",
      distance: "3.1 km",
    },
    {
      id: "4",
      name: "Tech Solutions NL",
      owner: "Ahmed Hassan",
      category: "IT",
      description: "Website en app ontwikkeling voor MKB ondernemers.",
      location: "Amsterdam Oost",
      distance: "1.8 km",
    },
    {
      id: "5",
      name: "Bloemen Boutique",
      owner: "Lisa Jansen",
      category: "Retail",
      description: "Bloemen en planten voor elk moment en gelegenheid.",
      location: "Amsterdam Zuid",
      distance: "4.2 km",
    },
    {
      id: "6",
      name: "Fitness First",
      owner: "Marco Visser",
      category: "Sport",
      description: "Personal training en groepslessen voor alle niveaus.",
      location: "Amsterdam Centrum",
      distance: "0.9 km",
    },
    {
      id: "7",
      name: "De Boekenwurm",
      owner: "Els Vermeer",
      category: "Retail",
      description: "Gezellige boekenwinkel met persoonlijk advies.",
      location: "Amsterdam Centrum",
      distance: "1.5 km",
    },
    {
      id: "8",
      name: "Fotografie Studio Luna",
      owner: "David Chen",
      category: "Creatief",
      description: "Professionele fotografie voor events en portretten.",
      location: "Amsterdam Noord",
      distance: "3.8 km",
    },
    {
      id: "9",
      name: "Juridisch Advies Pro",
      owner: "Anna Bakker",
      category: "Consulting",
      description: "Juridisch advies voor ondernemers en starters.",
      location: "Amsterdam Zuid",
      distance: "2.3 km",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-accent text-3xl font-bold mb-2">Ontdek je Netwerk</h1>
        <p className="text-muted-foreground">
          Vind en verbind met lokale ondernemers in jouw regio.
        </p>
      </div>

      <NetworkGrid
        profiles={profiles}
        onViewProfile={(id) => console.log("View profile:", id)}
        onContact={(id) => console.log("Contact:", id)}
      />
    </div>
  );
}
