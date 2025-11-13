import { NetworkGrid } from "../NetworkGrid";

export default function NetworkGridExample() {
  const profiles = [
    {
      id: "1",
      name: "Bakkerij De Gouden Korrel",
      owner: "Maria van den Berg",
      category: "Bakkerij",
      description: "Ambachtelijke bakkerij met verse broodjes en gebak.",
      location: "Amsterdam Centrum",
      distance: "1.2 km",
    },
    {
      id: "2",
      name: "Koffie & Co",
      owner: "Jan Pieters",
      category: "Horeca",
      description: "Gezellig koffiehuis met specialty coffee.",
      location: "Amsterdam Noord",
      distance: "2.5 km",
    },
    {
      id: "3",
      name: "Groen Advies",
      owner: "Sophie de Vries",
      category: "Consulting",
      description: "Duurzaamheidsadvies voor lokale bedrijven.",
      location: "Amsterdam West",
      distance: "3.1 km",
    },
    {
      id: "4",
      name: "Tech Solutions NL",
      owner: "Ahmed Hassan",
      category: "IT",
      description: "Website en app ontwikkeling voor MKB.",
      location: "Amsterdam Oost",
      distance: "1.8 km",
    },
    {
      id: "5",
      name: "Bloemen Boutique",
      owner: "Lisa Jansen",
      category: "Retail",
      description: "Bloemen en planten voor elk moment.",
      location: "Amsterdam Zuid",
      distance: "4.2 km",
    },
    {
      id: "6",
      name: "Fitness First",
      owner: "Marco Visser",
      category: "Sport",
      description: "Personal training en groepslessen.",
      location: "Amsterdam Centrum",
      distance: "0.9 km",
    },
  ];

  return (
    <NetworkGrid
      profiles={profiles}
      onViewProfile={(id) => console.log("View profile:", id)}
      onContact={(id) => console.log("Contact:", id)}
    />
  );
}
