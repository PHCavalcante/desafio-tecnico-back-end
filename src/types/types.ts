type Order = {
  lab: string;
  patient: string;
  customer: string;
  state: "CREATED" | "ANALYSIS" | "COMPLETED";
  status: "ACTIVE" | "DELETED";
  services: { name: string; value: number; status: "PENDING" | "DONE" }[];
};

type User = {
  email: string;
  password: string;
};

export type { Order, User };
