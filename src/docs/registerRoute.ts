import { registry } from "./registry";
import { ZodTypeAny } from "zod";

interface RegisterRouteConfig {
  method: "get" | "post" | "put" | "patch" |"delete";
  path: string;
  tags?: string[];
  security?: { [key: string]: any }[];
  requestBody?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
  responses: {
    [statusCode: number]: {
      description: string;
      body?: ZodTypeAny;
    };
  };
}

export function registerRoute({
  method,
  path,
  tags = ["Default"],
  security = [],
  requestBody,
  query,
  params,
  responses,
}: RegisterRouteConfig) {
  const req: any = {};
  if (requestBody) req.body = { content: { "application/json": { schema: requestBody } } };
  if (query) req.query = query;
  if (params) req.params = params;

  const resp: any = {};
  for (const [status, val] of Object.entries(responses)) {
    if (val.body) {
      resp[status] = { description: val.description, content: { "application/json": { schema: val.body } } };
    } else {
      resp[status] = { description: val.description };
    }
  }

  registry.registerPath({
    method,
    path,
    tags,
    security,
    request: req,
    responses: resp,
  });
}