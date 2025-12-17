/* eslint-disable @typescript-eslint/no-explicit-any */
import xmlrpc from "xmlrpc";
import { ODOO_CONFIG, MONITORED_MODELS } from "./constants";

const createClient = (path: string) =>
  xmlrpc.createSecureClient({ url: `${ODOO_CONFIG.url}/xmlrpc/2/${path}` });

const call = (client: any, method: string, params: any[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    client.methodCall(method, params, (err: any, res: any) =>
      err ? reject(err) : resolve(res)
    );
  });
};

export async function getAuthUid(): Promise<number | null> {
  const common = createClient("common");
  try {
    const uid = await call(common, "authenticate", [
      ODOO_CONFIG.db,
      ODOO_CONFIG.username,
      ODOO_CONFIG.password,
      {},
    ]);
    return uid ? Number(uid) : null;
  } catch (e) {
    console.error("Odoo Auth Error:", e);
    return null;
  }
}

async function fetchDetails(
  models: any,
  uid: number,
  modelName: string,
  id: number
): Promise<string> {
  try {
    const commonArgs = [
      ODOO_CONFIG.db,
      uid,
      ODOO_CONFIG.password,
      modelName,
      "read",
      [[id]],
    ];

    if (modelName === "sale.order") {
      const fields = [
        "name",
        "partner_id", 
        "amount_total", 
        "amount_tax", 
        "amount_untaxed", 
        "currency_id", 
        "state", 
        "validity_date", 
        "user_id", 
        "payment_term_id", 
        "date_order", 
      ];

      const res = await call(models, "execute_kw", [...commonArgs, fields]);
      if (!res[0]) return "";
      const p = res[0];

      const currency = p.currency_id?.[1] || "";
      const salesPerson = p.user_id?.[1] || "None";
      return `REF: ${p.name} | CLIENT: ${
        p.partner_id?.[1]
      } | TOTAL: ${p.amount_total.toLocaleString()} ${currency} (Tax: ${
        p.amount_tax
      }) | REP: ${salesPerson} | PAY: ${
        p.payment_term_id?.[1] || "Immediate"
      } | STATUS: ${p.state.toUpperCase()}`;
    }
    if (modelName === "account.move") {
      const fields = [
        "name", 
        "partner_id", 
        "amount_total", 
        "amount_residual", 
        "invoice_date", 
        "invoice_date_due", 
        "payment_state", 
        "move_type", 
        "invoice_user_id", 
      ];

      const res = await call(models, "execute_kw", [...commonArgs, fields]);
      if (!res[0]) return "";
      const p = res[0];
      if (p.move_type !== "out_invoice" && p.move_type !== "in_invoice")
        return "";

      const isBill = p.move_type === "in_invoice";
      const typeLabel = isBill ? "VENDOR BILL" : "INVOICE";
      const dueLabel =
        p.amount_residual > 0
          ? `DUE: ${p.amount_residual.toLocaleString()}`
          : "FULLY PAID";

      return `${typeLabel}: ${p.name} | TARGET: ${
        p.partner_id?.[1]
      } | TOTAL: ${p.amount_total.toLocaleString()} | ${dueLabel} | DUE DATE: ${
        p.invoice_date_due || "N/A"
      }`;
    }
    if (modelName === "stock.picking") {
      const fields = [
        "name", 
        "location_id", 
        "location_dest_id", 
        "origin", 
        "state", 
        "scheduled_date", 
        "picking_type_id", 
      ];

      const res = await call(models, "execute_kw", [...commonArgs, fields]);
      if (!res[0]) return "";
      const p = res[0];

      const route = `${p.location_id?.[1]
        ?.split("/")
        .pop()} ➔ ${p.location_dest_id?.[1]?.split("/").pop()}`;

      return `OP: ${p.picking_type_id?.[1]} | ROUTE: ${route} | SOURCE: ${
        p.origin || "Direct"
      } | SCHEDULED: ${p.scheduled_date} | STATUS: ${p.state.toUpperCase()}`;
    }
    if (modelName === "purchase.order") {
      const fields = [
        "name", 
        "partner_id", 
        "amount_total", 
        "currency_id", 
        "state", 
        "date_approve", 
        "receipt_status", 
      ];

      const res = await call(models, "execute_kw", [...commonArgs, fields]);
      if (!res[0]) return "";
      const p = res[0];

      return `PO: ${p.name} | VENDOR: ${
        p.partner_id?.[1]
      } | TOTAL: ${p.amount_total.toLocaleString()} ${
        p.currency_id?.[1]
      } | RECEIVED: ${p.receipt_status || "no"} | APPROVED: ${
        p.date_approve || "Pending"
      }`;
    }
    if (modelName === "crm.lead") {
      const fields = [
        "name", 
        "partner_id", 
        "expected_revenue", 
        "probability", 
        "stage_id", 
        "user_id", 
        "priority", 
        "tag_ids", 
      ];

      const res = await call(models, "execute_kw", [...commonArgs, fields]);
      if (!res[0]) return "";
      const p = res[0];

      const stars = "★".repeat(Number(p.priority) || 0);

      return `LEAD: ${p.name} | CLIENT: ${p.partner_id?.[1] || "New"} | REV: ${
        p.expected_revenue
      } (${p.probability}%) | STAGE: ${p.stage_id?.[1]} | REP: ${
        p.user_id?.[1]
      } ${stars}`;
    }
  } catch {
    return "";
  }
  return "";
}

export async function fetchLatestLogs(uid: number, lastCheckTime: string) {
  const models = createClient("object");
  const activeModels = Object.keys(MONITORED_MODELS);

  const domain = [
    ["date", ">", lastCheckTime],
    ["model", "in", activeModels],
    ["message_type", "!=", "user_notification"],
  ];

  const messages = await call(models, "execute_kw", [
    ODOO_CONFIG.db,
    uid,
    ODOO_CONFIG.password,
    "mail.message",
    "search_read",
    [domain],
    {
      fields: [
        "date",
        "model",
        "res_id",
        "author_id",
        "body",
        "record_name",
        "subtype_id",
      ],
      order: "date asc",
      limit: 20,
    },
  ]);
  const enrichedLogs = await Promise.all(
    messages.map(async (msg: any) => {
      console.log(messages);
      const config = MONITORED_MODELS[msg.model];
      let details = "";

      if (config?.fetchDetails) {
        details = await fetchDetails(models, uid, msg.model, msg.res_id);
      }
      const cleanBody = (msg.body || "")
        .replace(/<[^>]*>?/gm, "")
        .replace(/&nbsp;/g, " ")
        .trim();

      return {
        id: msg.id,
        resId: msg.res_id,
        date: msg.date.split(" ")[0],
        time: msg.date.split(" ")[1],
        model: msg.model,
        record: msg.record_name || `ID:${msg.res_id}`,
        author: msg.author_id ? msg.author_id[1] : "System",
        body: cleanBody || msg.subtype_id?.[1] || "Update",
        type: config?.label || "MISC",
        details: details,
      };
    })
  );

  return enrichedLogs;
}
