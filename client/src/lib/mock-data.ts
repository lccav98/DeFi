export const transactions = [
  {
    id: "tx-1",
    type: "deposit",
    amount: "R$ 5,000.00",
    converted: "$980.50 USDT",
    status: "completed",
    date: "2024-02-16 14:30",
    protocol: "Yield Protocol A",
    details: "PIX -> Liquid -> EVM -> Stake",
  },
  {
    id: "tx-2",
    type: "interest",
    amount: "+ $12.45",
    converted: null,
    status: "completed",
    date: "2024-02-15 09:00",
    protocol: "Yield Protocol A",
    details: "Daily Yield",
  },
  {
    id: "tx-3",
    type: "deposit",
    amount: "R$ 1,200.00",
    converted: "$235.10 USDT",
    status: "completed",
    date: "2024-02-10 11:20",
    protocol: "Yield Protocol B",
    details: "PIX -> Liquid -> EVM -> Stake",
  },
];

export const chartData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 5200 },
  { name: "Mar", value: 5800 },
  { name: "Apr", value: 6500 },
  { name: "May", value: 7200 },
  { name: "Jun", value: 8500 },
];

export const plans = [
  {
    id: "plan-3",
    duration: "3 Months",
    apy: "8.5%",
    risk: "Low",
    min: 50,
  },
  {
    id: "plan-6",
    duration: "6 Months",
    apy: "12.5%",
    risk: "Medium",
    min: 100,
    recommended: true,
  },
  {
    id: "plan-12",
    duration: "12 Months",
    apy: "18.2%",
    risk: "Medium-High",
    min: 500,
  },
];
