export const ODOO_CONFIG = {
  url: process.env.ODOO_URL,
  db: process.env.ODOO_DB,
  username: process.env.ODOO_EMAIL,
  password: process.env.ODOO_PASSWORD,
  refreshRate: 5000,
};

export const MONITORED_MODELS: Record<
  string,
  { label: string; color: string; fetchDetails: boolean }
> = {
  "sale.order": { label: "SALES", color: "text-green-500", fetchDetails: true },
  "purchase.order": {
    label: "PURCHASE",
    color: "text-red-500",
    fetchDetails: true,
  },
  "stock.picking": {
    label: "INVENTORY",
    color: "text-yellow-500",
    fetchDetails: true,
  },
  "account.move": {
    label: "FINANCE",
    color: "text-blue-500",
    fetchDetails: true,
  },
  "crm.lead": { label: "CRM", color: "text-pink-500", fetchDetails: true },
  "res.partner": {
    label: "CONTACT",
    color: "text-cyan-500",
    fetchDetails: true,
  },
  "product.template": {
    label: "PRODUCT",
    color: "text-gray-400",
    fetchDetails: false,
  },
};
