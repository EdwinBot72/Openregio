import { BusinessProfileCard } from "../BusinessProfileCard";

export default function BusinessProfileCardExample() {
  const profile = {
    id: "1",
    name: "Bakkerij De Gouden Korrel",
    owner: "Maria van den Berg",
    category: "Bakkerij",
    description: "Ambachtelijke bakkerij met verse broodjes en gebak, elke dag vers gebakken met lokale ingrediënten.",
    location: "Amsterdam Centrum",
    distance: "1.2 km",
  };

  return (
    <div className="max-w-sm">
      <BusinessProfileCard
        profile={profile}
        onViewProfile={(id) => console.log("View profile:", id)}
        onContact={(id) => console.log("Contact:", id)}
      />
    </div>
  );
}
